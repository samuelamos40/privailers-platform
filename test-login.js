const { createClient } = require('@supabase/supabase-js');

// Hardcoded for diagnostic purposes (copied from .env.local)
const supabaseUrl = 'https://akxilgzeyyovovukzwcg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreGlsZ3pleXlvdm92dWt6d2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjI2NDgsImV4cCI6MjA4NTA5ODY0OH0.mNGnrOmnTWisVVKCKFjuIy6B5glLAppDqrIhLdjFYfo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRegistration() {
    const email = `test_auto_${Date.now()}@privailers.com`;
    const password = 'password123';

    console.log(`--- Testing Registration for ${email} ---`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Test Auto User',
                role: 'student'
            }
        }
    });

    if (error) {
        console.error('Registration Failed!');
        console.error(error);
    } else {
        console.log('Registration Successful (API Call)!');
        console.log('User ID:', data.user?.id);
        console.log('Email Confirmed At:', data.user?.email_confirmed_at);
        console.log('Session exists?', !!data.session);

        if (!data.session && !data.user?.email_confirmed_at) {
            console.log('CONCLUSION: Email Confirmation is ENABLED. You cannot log in until verified.');
        } else {
            console.log('CONCLUSION: Auth User is confirmed.');

            // NOW CHECK PUBLIC PROFILE
            const userId = data.user?.id;
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError || !profile) {
                console.error('CRITICAL ERROR: User has Auth account but NO Public Profile!');
                console.error('This causes the redirect loop because the app cannot find your Role.');
                console.error('Profile Error:', profileError);
            } else {
                console.log('SUCCESS: Public Profile Found!');
                console.log('Role:', profile.role);
            }
        }
    }
}

testRegistration();
