import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserProvider } from "@/contexts/UserContext";
import ClientNavbar from "@/components/ClientNavbar";
import Loading from "./loading";

const inter = Inter({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata = {
  title: {
    default: "FuelSync | Next-Gen Fuel Infrastructure",
    template: "%s | FuelSync"
  },
  description: "Real-time fuel availability, digital queue management, and secure payments for the modern driver in Ethiopia.",
  keywords: ["Fuel Tracker", "Ethiopia Fuel", "Benzene Nafta", "Digital Queue", "FuelSync", "Smart Refueling"],
  authors: [{ name: "FuelSync Team" }],
  creator: "FuelSync Ethiopia",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_ET",
    url: "https://fuelsync.et",
    siteName: "FuelSync Ethiopia",
    title: "FuelSync | Next-Gen Fuel Infrastructure",
    description: "Real-time fuel availability and digital queuing across Ethiopia.",
    images: [
      {
        url: "/og-image.png", // Ensure this exists in public/
        width: 1200,
        height: 630,
        alt: "FuelSync Terminal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FuelSync | Smart Fuel Management",
    description: "Skip the line and find fuel instantly across the national grid.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
       <script
  dangerouslySetInnerHTML={{
    __html: `
      try {
        const saved = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", saved);
      } catch (e) {}
    `,
  }}
/>
      </head>
      <body className={`${inter.className} text-gray-900 antialiased`} suppressHydrationWarning>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <ThemeProvider>
            <UserProvider>
              <Suspense fallback={<Loading />}>
               <ClientNavbar />
              </Suspense>
              <main className="flex flex-col pt-16 sm:pt-20">{children}</main>
            </UserProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}