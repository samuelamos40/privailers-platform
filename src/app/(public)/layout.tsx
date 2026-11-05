import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 80px - 300px)' }}>
                {children}
            </main>
            <WhatsAppFloat />
            <Footer />
        </>
    );
}
