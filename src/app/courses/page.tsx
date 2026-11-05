import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import CoursesClient from "./CoursesClient";

export const metadata: Metadata = {
    title: "Course Catalog | Data Analytics, SQL, Power BI & Python Training",
    description: "Explore practical, project-based courses in Microsoft Excel, SQL, Power BI, Python, and Quantitative Data Modeling at Privailers Data Consult Academy.",
    alternates: {
        canonical: "/courses",
    },
};

export const revalidate = 60;

export default async function CoursesPage() {
    let initialCourses: any[] = [];

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data } = await supabase
                .from("courses")
                .select("id, title, description, price, tier, published")
                .order("created_at", { ascending: false });

            if (data) {
                initialCourses = data;
            }
        }
    } catch (e) {
        console.error("SSR fetch courses error:", e);
    }

    return <CoursesClient initialCourses={initialCourses} />;
}
