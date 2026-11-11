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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.privailers.com'),
  title: {
    default: "Privailers Data Consult | Enterprise Data Solutions",
    template: "%s | Privailers Data Consult"
  },
  description: "We build business intelligence systems, data science solutions, cloud data pipelines, stochastic models, and corporate training for modern teams.",
  keywords: ["Data Science", "Data Analytics", "Data Engineering", "Business Intelligence", "Mathematical Modeling", "Python", "Power BI", "SQL", "Privailers", "Bootcamp", "Nigeria", "Africa"],
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
    url: "https://www.privailers.com",
    siteName: "Privailers Data Consult",
    title: "Privailers Data Consult | Enterprise Data Solutions",
    description: "We build business intelligence systems, data science solutions, cloud data pipelines, stochastic models, and corporate training for modern teams.",
    images: [
      {
        url: "/images/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Privailers Data Consult - Enterprise Data Solutions"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Privailers Data Consult | Enterprise Data Solutions",
    description: "We build business intelligence systems, data science solutions, cloud data pipelines, stochastic models, and corporate training for modern teams.",
    images: ["/images/opengraph-image.png"],
    creator: "@privailers"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "ProfessionalService"],
    name: "Privailers Data Consult",
    url: "https://privailers.com",
    logo: "https://privailers.com/images/logo.png",
    image: "https://privailers.com/images/opengraph-image.png",
    description:
      "Empowering individuals and businesses with in-demand data skills, self-paced courses, live cohort bootcamps, automated data pipelines, and quantitative mathematical modeling.",
    email: "info@privailers.com",
    telephone: "+2347078865107",
    address: {
      "@type": "PostalAddress",
      addressCountry: "NG",
    },
    sameAs: ["https://privailers.com"],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${poppins.variable} ${roboto.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
