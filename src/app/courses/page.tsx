import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import CoursesClient from "./CoursesClient";

export const metadata: Metadata = {
    title: "Course Catalog & Live Cohort Bootcamps | Data Analytics, SQL, Power BI",
    description: "Explore practical, project-based courses and live cohort bootcamps in Microsoft Excel, SQL, Power BI, Python, and Data Science at Privailers Data Consult Academy.",
    alternates: {
        canonical: "/courses",
    },
};

export const revalidate = 60;

export default async function CoursesPage() {
    let initialCourses: any[] = [];
    let initialCohorts: any[] = [];

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            
            const [coursesRes, cohortsRes] = await Promise.all([
                supabase
                    .from("courses")
                    .select("id, title, description, price, tier, published")
                    .order("created_at", { ascending: false }),
                supabase
                    .from("cohorts")
                    .select("id, name, start_date, end_date, capacity, price, status, instructor:users(full_name)")
                    .order("created_at", { ascending: false })
            ]);

            if (coursesRes.data) initialCourses = coursesRes.data;
            if (cohortsRes.data) initialCohorts = cohortsRes.data;
        }
    } catch (e) {
        console.error("SSR fetch courses/cohorts error:", e);
    }

    return <CoursesClient initialCourses={initialCourses} initialCohorts={initialCohorts} />;
}
