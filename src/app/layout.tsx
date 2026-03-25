import "./globals.css";
import Navbar from "../components/Navbar";
import { Inter } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "@/contexts/UserContext";

const inter = Inter({ subsets: ["latin"], weight: ["400", "700", "900"] });

export const metadata = {
  title: "FuelSync | Next-Gen Fuel Infrastructure",
  description: "Real-time fuel availability and queue management for the modern driver in Ethiopia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} text-gray-900 antialiased`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <UserProvider>
            <Navbar />
            <main className="flex flex-col pt-16 sm:pt-20">
              {children}
            </main>
          </UserProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}