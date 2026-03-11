import "./globals.css";
import Navbar from "../components/Navbar";
import { Inter } from "next/font/google";

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
    <html lang="en">
      <body className={`${inter.className} text-gray-900 antialiased`}>
        <Navbar />
        <main className="flex flex-col pt-16 sm:pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}