import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://privailers-platform.vercel.app'),
  title: {
    default: "Privailers Data Consult | Premier Data Academy & Analytics",
    template: "%s | Privailers Data Consult"
  },
  description: "Empowering individuals and businesses with in-demand data skills, self-paced courses, live cohort bootcamps, automated data pipelines, and quantitative mathematical modeling.",
  keywords: ["Data Analytics", "EdTech", "Data Engineering", "Mathematical Modeling", "Python", "Power BI", "SQL", "Privailers", "Bootcamp", "Nigeria", "Africa"],
  authors: [{ name: "Privailers Data Consult" }],
  creator: "Privailers Data Consult",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/images/icons/favicon.png", sizes: "any" }
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/icon.png"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://privailers-platform.vercel.app",
    siteName: "Privailers Data Consult",
    title: "Privailers Data Consult | Premier Data Academy & Analytics",
    description: "Empowering individuals and businesses with in-demand data skills, self-paced courses, live cohort bootcamps, automated data pipelines, and quantitative mathematical modeling.",
    images: [
      {
        url: "/images/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Privailers Data Consult - Premier Data Academy & Analytics"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Privailers Data Consult | Premier Data Academy & Analytics",
    description: "Empowering individuals and businesses with in-demand data skills, self-paced courses, live cohort bootcamps, automated data pipelines, and quantitative mathematical modeling.",
    images: ["/images/opengraph-image.png"],
    creator: "@privailers"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${roboto.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
