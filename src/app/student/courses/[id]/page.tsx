"use client";

import { useEffect, useState, use } from "react";
import { usePaystackPayment } from 'react-paystack';
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Certificate from "@/components/ui/Certificate";
import CommentsSection from "@/components/ui/CommentsSection";
import Input from "@/components/ui/Input";

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
    const router = useRouter();
    const resolvedParams = use(params);
    const searchParams = useSearchParams();
    const courseId = resolvedParams.id;
    const targetCohortId = searchParams.get('cohortId');

    // --- STATE MANAGEMENT ---

    // Course Data
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [availableCohorts, setAvailableCohorts] = useState<any[]>([]);
    const [cohortClasses, setCohortClasses] = useState<any[]>([]);
    const [cohortAnnouncements, setCohortAnnouncements] = useState<any[]>([]);
    const [targetCohort, setTargetCohort] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Access & Progress
    const [hasAccess, setHasAccess] = useState(false);
    const [completedModuleIds, setCompletedModuleIds] = useState<Set<string>>(new Set());
    const [showCertificate, setShowCertificate] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

    // UI State
    const [isPlaying, setIsPlaying] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState('');

    // --- EFFECTS ---

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [courseId, user]);

    // Reset video state when changing modules
    useEffect(() => {
        setIsPlaying(false);
    }, [activeModuleIndex]);

    // --- DATA FETCHING ---

    const fetchData = async () => {
        setLoading(true);

        // 1. Fetch Course Details
        const { data: courseData } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        setCourse(courseData);

        // 2. Fetch Modules
        const { data: moduleData } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', courseId)
            .order('order', { ascending: true });

        setModules(moduleData || []);

        // 3. Fetch Projects
        const { data: projectData } = await supabase
            .from('projects')
            .select('*')
            .eq('course_id', courseId);

        setProjects(projectData || []);

        // 3.5 Fetch My Submissions (for status)
        const { data: submissionData } = await supabase
            .from('project_submissions')
            .select('*')
            .eq('user_id', user!.id)
            .in('project_id', (projectData || []).map((p: any) => p.id));

        setSubmissions(submissionData || []);

        // 4. Fetch Enrollment & Access
        const { data: enrollmentData } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', user!.id)
            .eq('course_id', courseId)
            .single();

        setEnrollment(enrollmentData);

        // Fetch User Profile for Real Name & Role
        let fetchedProfile = null;
        if (user) {
            const { data } = await supabase
                .from('users')
                .select('full_name, role')
                .eq('id', user.id)
                .single();
            fetchedProfile = data;
            setUserProfile(data);
        }

        // 5. Fetch Module Progress
        const { data: progressData } = await supabase
            .from('module_progress')
            .select('module_id')
            .eq('user_id', user!.id)
            .eq('completed', true)
            .in('module_id', (moduleData || []).map((m: any) => m.id));

        const completedSet = new Set((progressData || []).map((p: any) => p.module_id));
        setCompletedModuleIds(completedSet);

        // Determine Access (Admins bypass enrollment)
        const isAdmin = fetchedProfile?.role === 'admin' || (user as any)?.user_metadata?.role === 'admin';
        const canAccess = isAdmin || (enrollmentData && enrollmentData.status === 'active');
        setHasAccess(!!canAccess);

        // 6. Fetch Available Cohorts for this course
        const { data: cohortData } = await supabase
            .from('cohorts')
            .select('*')
            .eq('course_id', courseId)
            .eq('status', 'open');
        
        setAvailableCohorts(cohortData || []);

        // 7. If in a cohort, fetch classroom data
        if (enrollmentData?.cohort_id) {
            const { data: cClasses } = await supabase
                .from('cohort_classes')
                .select('*')
                .eq('cohort_id', enrollmentData.cohort_id)
                .order('scheduled_at', { ascending: true });
            
            const { data: cAnn } = await supabase
                .from('cohort_announcements')
                .select('*')
                .eq('cohort_id', enrollmentData.cohort_id)
                .order('created_at', { ascending: false });
            
            setCohortClasses(cClasses || []);
            setCohortAnnouncements(cAnn || []);
        }

        // 8. Fetch Target Cohort (if linked via query param)
        if (targetCohortId) {
            const { data: tCohort } = await supabase
                .from('cohorts')
                .select('*')
                .eq('id', targetCohortId)
                .single();
            setTargetCohort(tCohort);
        }

        setLoading(false);
    };

    // --- HANDLERS ---

    const handleMarkComplete = async () => {
        if (!user || !activeModule) return;

        try {
            // 1. Mark Module as Complete in DB
            const { error: progressError } = await supabase
                .from('module_progress')
                .upsert({
                    user_id: user.id,
                    module_id: activeModule.id,
                    completed: true,
                    completed_at: new Date().toISOString()
                }, { onConflict: 'user_id, module_id' });

            if (progressError) throw progressError;

            // 2. Update Local State
            const newCompletedSet = new Set(completedModuleIds);
            newCompletedSet.add(activeModule.id);
            setCompletedModuleIds(newCompletedSet);

            // 3. Recalculate Overall Progress
            const completedCount = newCompletedSet.size;
            const totalCount = modules.length;
            const newPercentage = Math.round((completedCount / totalCount) * 100);

            // 4. Update Enrollment Progress
            await supabase
                .from('enrollments')
                .update({
                    progress: newPercentage,
                    last_accessed: new Date().toISOString()
                })
                .eq('user_id', user.id)
                .eq('course_id', courseId);

            // Refresh enrollment data locally
            setEnrollment((prev: any) => ({ ...prev, progress: newPercentage }));

        } catch (e: any) {
            alert("Error saving progress: " + e.message);
        }
    };

    const handleEnroll = async () => {
        if (!user || !course) return;

        try {
            const { error } = await supabase
                .from('enrollments')
                .insert([{
                    user_id: user.id,
                    course_id: course.id,
                    status: 'active',
                    progress: 0
                }]);

            if (error) throw error;
            await fetchData();
            alert("Successfully enrolled!");
        } catch (e: any) {
            alert("Error enrolling: " + e.message);
        }
    };

    const [pendingCohort, setPendingCohort] = useState<any>(null);

    const handleMigrateToCohort = async (cohort: any) => {
        if (!user || !course) return;

        // Calculate price
        const cohortPrice = parseFloat(cohort.price || course.price || "0");
        
        // If they already have an enrollment, calculate the upgrade fee
        const userPricePaid = enrollment ? parseFloat(course.price || "0") : 0;
        const currentUpgradeFee = Math.max(0, cohortPrice - userPricePaid);

        if (currentUpgradeFee > 0) {
            setPendingCohort(cohort);
            // The payment trigger is in an effect watching pendingCohort
        } else {
            // Free or already covered
            try {
                if (enrollment) {
                    await supabase
                        .from('enrollments')
                        .update({ cohort_id: cohort.id, status: 'active' })
                        .eq('id', enrollment.id);
                } else {
                    await supabase
                        .from('enrollments')
                        .insert([{
                            user_id: user.id,
                            course_id: course.id,
                            cohort_id: cohort.id,
                            status: 'active',
                            progress: 0
                        }]);
                }
                alert("Successfully joined the batch!");
                fetchData();
            } catch (e: any) {
                alert("Error joining batch: " + e.message);
            }
        }
    };

    const handleApplyCoupon = async () => {
        setCouponError('');
        if (!couponCode) return;

        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('is_active', true)
            .single();

        if (error || !data) {
            setCouponError('Invalid or expired coupon code.');
            setAppliedCoupon(null);
            return;
        }

        // Check date
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            setCouponError('This coupon has expired.');
            return;
        }

        // Check uses
        if (data.used_count >= data.max_uses) {
            setCouponError('This coupon has reached its maximum usage.');
            return;
        }

        setAppliedCoupon(data);
        alert(`Success! ${data.discount_type === 'percentage' ? data.discount_value + '%' : '₦' + data.discount_value} discount applied.`);
    };

    const calculateDiscountedPrice = () => {
        if (!course?.price) return 0;
        if (!appliedCoupon) return course.price;

        if (appliedCoupon.discount_type === 'percentage') {
            return course.price * (1 - appliedCoupon.discount_value / 100);
        } else {
            return Math.max(0, course.price - appliedCoupon.discount_value);
        }
    };

    const discountedPrice = calculateDiscountedPrice();

    const paystackConfig = {
        reference: `PS_${typeof window !== 'undefined' ? new Date().getTime() : ''}`,
        email: user?.email || "student@example.com",
        amount: Math.round(discountedPrice * 100), 
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_dummy",
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'] // EXPLICITLY ENABLED CHANNELS
    };
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const initializePayment = usePaystackPayment(paystackConfig as any);

    // Dynamic Upgrade Payment
    const userPaidAmt = enrollment ? parseFloat(course?.price || "0") : 0;
    const upgradeFee = pendingCohort ? Math.max(0, parseFloat(pendingCohort.price || course?.price || "0") - userPaidAmt) : 0;
    const upgradeConfig = {
        ...paystackConfig,
        amount: Math.round(upgradeFee * 100),
        reference: `UG_${new Date().getTime()}`,
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const initializeUpgrade = usePaystackPayment(upgradeConfig as any);

    const handlePurchase = () => {
        if (!user || !course) return;

        const onSuccess = async (reference: any) => {
            try {
                // Verify the transaction with our backend
                const res = await fetch('/api/checkout/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reference: reference.reference || reference.transaction,
                        courseId: course.id,
                        userId: user.id
                    })
                });

                const data = await res.json();
                
                if (data.success) {
                    // Update coupon count if used
                    if (appliedCoupon) {
                        await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id });
                    }
                    alert("Payment successful! Welcome to the course 🎓");
                    await fetchData(); // Refresh data to unlock content
                } else {
                    alert("Payment verification failed: " + data.error);
                }
            } catch (err: any) {
                 alert("An error occurred during verification: " + err.message);
            }
        };

        const onClose = () => {
            console.log("Paystack dialog closed.");
        };

        initializePayment({ onSuccess: onSuccess as any, onClose: onClose as any } as any);
    };

    useEffect(() => {
        if (pendingCohort && upgradeFee > 0) {
            const onSuccess = async () => {
                if (enrollment) {
                    await supabase.from('enrollments').update({ cohort_id: pendingCohort.id, status: 'active' }).eq('id', enrollment.id);
                } else {
                    await supabase.from('enrollments').insert([{
                        user_id: user?.id,
                        course_id: course.id,
                        cohort_id: pendingCohort.id,
                        status: 'active',
                        progress: 0
                    }]);
                }
                alert("Welcome to the batch! Your enrollment is confirmed.");
                setPendingCohort(null);
                fetchData();
            };
            const onClose = () => setPendingCohort(null);
            initializeUpgrade({ onSuccess: onSuccess as any, onClose: onClose as any } as any);
        }
    }, [pendingCohort]);

    const handleModuleClick = (index: number) => {
        if (!hasAccess) return;
        setActiveModuleIndex(index);
    };

    const getVideoEmbedUrl = (url: string, autoplay = false) => {
        if (!url) return null;
        const autoParam = autoplay ? '&autoplay=1' : '';
        try {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
                return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&showinfo=0${autoParam}`;
            }
            if (url.includes('vimeo.com')) {
                const videoId = url.split('/').pop()?.split('?')[0];
                return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&badge=0${autoParam}`;
            }
            if (url.includes('cloudinary') || url.match(/\.(mp4|mov|webm)$/i)) {
                return "DIRECT_VIDEO";
            }
        } catch (e) { return null; }
        return url;
    };

    const activeModule = modules[activeModuleIndex];
    const isModuleCompleted = activeModule && completedModuleIds.has(activeModule.id);

    if (loading) return <div style={{ padding: '2rem' }}>Loading course player...</div>;
    
    if (!course) {
        return (
            <div style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎓</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                    {targetCohort ? targetCohort.name : 'Course Not Found'}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
                    {targetCohort 
                        ? "This mentored batch is active, but its associated curriculum content is currently being updated. Please check back shortly or join the live sessions below."
                        : "We couldn't find the course you're looking for. It might have been moved or renamed."}
                </p>
                {targetCohort && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                         <Button onClick={() => router.push('/student/live-classes')} variant="primary">View Live Sessions</Button>
                         <Link href="/student/courses" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Return to My Courses</Link>
                    </div>
                )}
                {!targetCohort && (
                    <Button onClick={() => router.push('/student/courses')} variant="primary">Back to Courses</Button>
                )}
            </div>
        );
    }

    return (
        <div className="course-player-grid">
            <style jsx>{`
                .course-player-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    min-height: 100vh;
                }
                @media (max-width: 1024px) {
                    .course-player-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .player-left {
                        padding: 1rem !important;
                        border-right: none !important;
                    }
                    .classroom-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                }
            `}</style>

            {/* LEFT: Main Content Area (Video) */}
            <div className="player-left" style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <Link href="/student/courses" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
                        ← Back to My Courses
                    </Link>
                </div>

                {hasAccess ? (
                    <div>
                        {activeModule ? (
                            <>
                                {/* Video Player Container */}
                                <div style={{
                                    aspectRatio: '16/9',
                                    backgroundColor: '#000',
                                    borderRadius: '0.75rem',
                                    overflow: 'hidden',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    position: 'relative'
                                }}>
                                    {!isPlaying ? (
                                        <div
                                            onClick={() => setIsPlaying(true)}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
                                                color: 'white'
                                            }}
                                        >
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                backdropFilter: 'blur(4px)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                marginBottom: '1rem',
                                                transition: 'transform 0.2s',
                                            }}>
                                                <div style={{
                                                    width: 0,
                                                    height: 0,
                                                    borderTop: '15px solid transparent',
                                                    borderBottom: '15px solid transparent',
                                                    borderLeft: '25px solid white',
                                                    marginLeft: '5px'
                                                }} />
                                            </div>
                                            <span style={{ fontWeight: 500, color: '#e2e8f0' }}>Click to Play</span>
                                        </div>
                                    ) : (
                                        (() => {
                                            if (!activeModule.video_url) return (
                                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                    No video content for this module.
                                                </div>
                                            );

                                            const embedUrl = getVideoEmbedUrl(activeModule.video_url, true);

                                            if (embedUrl === "DIRECT_VIDEO") {
                                                return (
                                                    <video
                                                        width="100%"
                                                        height="100%"
                                                        src={activeModule.video_url}
                                                        controls
                                                        autoPlay
                                                        style={{ objectFit: 'contain' }}
                                                    />
                                                );
                                            }

                                            return (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={embedUrl!}
                                                    title={activeModule.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            );
                                        })()
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                                        {activeModule.title}
                                    </h1>
                                    <Button
                                        onClick={handleMarkComplete}
                                        variant={isModuleCompleted ? 'ghost' : 'primary'}
                                        style={isModuleCompleted ? { color: '#059669', borderColor: '#059669', backgroundColor: '#ecfdf5' } : {}}
                                    >
                                        {isModuleCompleted ? '✓ Completed' : 'Mark as Complete'}
                                    </Button>
                                </div>
                                <Card style={{ lineHeight: '1.7', color: '#475569' }}>
                                    {(activeModule.content || "").split('\n').map((line: string, i: number) => (
                                        <p key={i} style={{ marginBottom: '1em' }}>{line}</p>
                                    ))}
                                </Card>

                                {/* Lesson Q&A Component */}
                                <CommentsSection 
                                    moduleId={activeModule.id} 
                                    isAdmin={userProfile?.role === 'admin' || (user as any)?.user_metadata?.role === 'admin'} 
                                />

                                {/* BATCH CLASSROOM (ONLY FOR COHORT STUDENTS) */}
                                {enrollment?.cohort_id && (
                                    <div style={{ marginTop: '3rem' }}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            🏫 My Batch Classroom
                                        </h2>
                                        
                                        <div className="classroom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                            {/* Announcements */}
                                            <div style={{ backgroundColor: '#fdf2f8', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #fbcfe8' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#9d174d', marginBottom: '1rem' }}>📢 Bulletin Board</h3>
                                                {cohortAnnouncements.length > 0 ? (
                                                    cohortAnnouncements.map(ann => (
                                                        <div key={ann.id} style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #fce7f3' }}>
                                                            <div style={{ fontWeight: 700, color: '#831843' }}>{ann.title}</div>
                                                            <p style={{ fontSize: '0.85rem', color: '#be185d', margin: '0.25rem 0' }}>{ann.content}</p>
                                                            <div style={{ fontSize: '0.7rem', color: '#f472b6' }}>{new Date(ann.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                    ))
                                                ) : <p style={{ fontSize: '0.85rem', color: '#be185d' }}>No updates yet.</p>}
                                            </div>

                                            {/* Classes */}
                                            <div style={{ backgroundColor: '#f0f9ff', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #bae6fd' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#075985', marginBottom: '1rem' }}>📅 Live Classes</h3>
                                                {cohortClasses.length > 0 ? (
                                                    cohortClasses.map(cls => (
                                                        <div key={cls.id} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e0f2fe' }}>
                                                            <div style={{ fontWeight: 700, color: '#0369a1' }}>{cls.title}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#0284c7', margin: '0.25rem 0' }}>
                                                                🕒 {new Date(cls.scheduled_at).toLocaleString()}
                                                            </div>
                                                            {cls.use_internal_room !== false ? (
                                                                <button 
                                                                    onClick={() => router.push(`/classroom/${cls.id}`)}
                                                                    style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.4rem 0.8rem', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                                >
                                                                    Join Live Room on Platform →
                                                                </button>
                                                            ) : cls.meeting_link && (
                                                                <a 
                                                                    href={cls.meeting_link} 
                                                                    target="_blank" 
                                                                    style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.4rem 0.8rem', backgroundColor: '#0ea5e9', color: 'white', textDecoration: 'none', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 700 }}
                                                                >
                                                                    Open External Class Link →
                                                                </a>
                                                            )}
                                                            {cls.assignment_details && (
                                                                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem' }}>
                                                                    <strong>Assignment:</strong> {cls.assignment_details}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : <p style={{ fontSize: '0.85rem', color: '#0369a1' }}>No upcoming classes.</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* UPGRADE / MIGRATE TO COHORT SECTION */}
                                {enrollment && !enrollment.cohort_id && availableCohorts.length > 0 && (
                                    <div style={{ marginTop: '3rem', padding: '2rem', border: '2px dashed #0284c7', backgroundColor: '#f0f9ff', borderRadius: '1.5rem' }}>
                                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0369a1' }}>🚀 Upgrade to Mentored Batch</h3>
                                            <p style={{ color: '#0284c7' }}>Get live help, assignments, and peer motivation by joining a batch.</p>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                            {availableCohorts.map(batch => (
                                                <div key={batch.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #bae6fd', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                                    <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '1rem' }}>{batch.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0' }}>📅 Starts: {new Date(batch.start_date).toLocaleDateString()}</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '1rem 0' }}>₦{batch.price?.toLocaleString()}</div>
                                                    <Button 
                                                        size="sm" 
                                                        variant="primary" 
                                                        style={{ width: '100%', borderRadius: '0.5rem' }}
                                                        onClick={() => handleMigrateToCohort(batch)}
                                                    >
                                                        Join This Batch
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        variant="outline"
                                        disabled={activeModuleIndex === 0}
                                        onClick={() => handleModuleClick(activeModuleIndex - 1)}
                                    >
                                        ← Previous Lesson
                                    </Button>
                                    <Button
                                        variant="primary"
                                        disabled={activeModuleIndex === modules.length - 1}
                                        onClick={() => handleModuleClick(activeModuleIndex + 1)}
                                    >
                                        Next Lesson →
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <h3>No modules found in this course.</h3>
                            </div>
                        )}
                    </div>
                ) : (
                    // --- ACCESS DENIED ---
                    <div style={{
                        minHeight: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1e293b',
                        color: 'white',
                        borderRadius: '0.75rem',
                        textAlign: 'center',
                        padding: '3rem'
                    }}>
                        {targetCohort ? (
                            <>
                                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🚀</div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                    Join {targetCohort.name}
                                </h2>
                                <p style={{ maxWidth: '500px', color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                                    You've been invited to join this exclusive mentored batch for <strong>{course.title}</strong>.
                                </p>
                                
                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    onClick={() => handleMigrateToCohort(targetCohort)} 
                                    style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                                >
                                    {parseFloat(targetCohort.price || course.price || "0") > 0 ? (
                                        `Join Batch for ₦${parseFloat(targetCohort.price || course.price).toLocaleString()}`
                                    ) : 'Join Batch for Free'}
                                </Button>
                                
                                <div style={{ marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
                                    Or <button onClick={() => setTargetCohort(null)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>view standard course options</button>
                                </div>
                            </>
                        ) : course.tier === 'paid' ? (
                            <>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                    Content Locked
                                </h2>
                                <p style={{ maxWidth: '400px', color: '#94a3b8', marginBottom: '2rem' }}>
                                    This is a <strong>Premium Course</strong>. You need to purchase it to access the video content.
                                </p>
                                <Button variant="primary" size="lg" onClick={handlePurchase} style={{ marginBottom: '1.5rem' }}>
                                    Unlock Course for {appliedCoupon ? (
                                        <>
                                            <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.8em', marginRight: '0.5rem' }}>
                                                ₦{course.price?.toLocaleString()}
                                            </span>
                                            ₦{discountedPrice.toLocaleString()}
                                        </>
                                    ) : (
                                        `₦${course.price?.toLocaleString() || '0'}`
                                    )}
                                </Button>

                                {/* Coupon Input */}
                                <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input 
                                            type="text"
                                            placeholder="Coupon Code"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value)}
                                            style={{
                                                flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #475569',
                                                backgroundColor: 'rgba(255,255,255,0.05)', color: 'white'
                                            }}
                                        />
                                        <Button size="sm" variant="outline" onClick={handleApplyCoupon}>Apply</Button>
                                    </div>
                                    {couponError && <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.5rem' }}>{couponError}</div>}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                    Enroll in this Course
                                </h2>
                                <Button variant="primary" size="lg" onClick={handleEnroll}>
                                    Enroll for Free
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT: Sidebar */}
            <div style={{ backgroundColor: 'white', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Course Content</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{modules.length} Lessons • {projects.length} Assignments</p>
                </div>

                {/* Certificate Button (Only shows if 100% complete and all projects graded) */}
                {(() => {
                    const allModulesDone = modules.length > 0 && completedModuleIds.size === modules.length;
                    const allProjectsGraded = projects.length === 0 || projects.every(p => 
                        submissions.find(s => s.project_id === p.id && s.status === 'graded')
                    );
                    
                    if (allModulesDone && allProjectsGraded) {
                        return (
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eab308', backgroundColor: '#fefce8' }}>
                                <Button 
                                    variant="primary" 
                                    style={{ width: '100%', justifyContent: 'center', backgroundColor: '#eab308', color: '#854d0e', border: 'none', boxShadow: '0 4px 6px -1px rgba(234, 179, 8, 0.4)', fontWeight: 700, fontSize: '1rem' }}
                                    onClick={() => setShowCertificate(true)}
                                >
                                    🏆 View Your Certificate
                                </Button>
                            </div>
                        );
                    }
                    
                    // Optional: Show a "Progress" indicator if modules are done but projects aren't
                    if (allModulesDone && !allProjectsGraded) {
                        return (
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, textAlign: 'center' }}>
                                    🔒 Certificate locked until all projects are graded.
                                </div>
                            </div>
                        );
                    }
                    
                    return null;
                })()}

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {modules.map((mod, index) => (
                        <div
                            key={mod.id}
                            onClick={() => handleModuleClick(index)}
                            style={{
                                padding: '1rem 1.5rem',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: hasAccess ? 'pointer' : 'not-allowed',
                                backgroundColor: index === activeModuleIndex ? '#e0f2fe' : 'white',
                                borderLeft: index === activeModuleIndex ? '4px solid #0284c7' : '4px solid transparent',
                                opacity: hasAccess ? 1 : 0.6
                            }}
                            className="hover:bg-slate-50"
                        >
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Lesson {index + 1}</span>
                                {!hasAccess && <span>🔒</span>}
                            </div>
                            <div style={{ fontWeight: 500, color: index === activeModuleIndex ? '#0369a1' : '#334155' }}>
                                {mod.title}
                            </div>
                        </div>
                    ))}

                    {/* Projects Section */}
                    {projects.length > 0 && hasAccess && (
                        <div style={{ marginTop: '1rem', borderTop: '4px solid #f1f5f9' }}>
                            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', fontWeight: 700, fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase' }}>
                                Class Projects
                            </div>
                            {projects.map(project => (
                                <Link href={`/student/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        padding: '1rem 1.5rem',
                                        borderBottom: '1px solid #f1f5f9',
                                        cursor: 'pointer',
                                        backgroundColor: 'white',
                                        transition: 'background 0.2s'
                                    }}
                                        className="hover:bg-slate-50"
                                    >
                                        <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginBottom: '0.25rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                                            <span>ASSIGNMENT</span>
                                            {(() => {
                                                const sub = submissions.find(s => s.project_id === project.id);
                                                if (sub?.status === 'graded') return <span style={{ color: '#059669' }}>Graded: {sub.grade}%</span>;
                                                if (sub) return <span style={{ color: '#d97706' }}>Submitted</span>;
                                                return null;
                                            })()}
                                        </div>
                                        <div style={{ fontWeight: 500, color: '#334155', fontSize: '0.95rem' }}>
                                            {project.title}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Certificate Modal */}
            {showCertificate && user && course && (
                <Certificate 
                    studentName={userProfile?.full_name || (user as any).user_metadata?.full_name || user.email?.split('@')[0] || 'Student'}
                    courseName={course.title}
                    date={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    onClose={() => setShowCertificate(false)}
                />
            )}

        </div>
    );
}
