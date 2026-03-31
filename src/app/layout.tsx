import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserProvider } from "@/contexts/UserContext";
import ClientNavbar from "@/components/ClientNavbar";

const inter = Inter({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata = {
  title: "FuelSync | Next-Gen Fuel Infrastructure",
  description: "Real-time fuel availability and queue management for the modern driver in Ethiopia.",
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
      <body className={`${inter.className} text-gray-900 antialiased`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <ThemeProvider>
            <UserProvider>
              <Suspense fallback={<div>Loading...</div>}>
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