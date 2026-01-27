import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 80px - 300px)' }}> {/* Approx min height calculation */}
                {children}
            </main>
            <Footer />
        </>
    );
}
