import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "لوحة التحكم - استوديو تعليمي",
  description: "لوحة التحكم المركزية لفريق الاستوديو التعليمي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} antialiased`}>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <main className="lg:pr-64">
            <div className="pb-20 lg:pb-0">{children}</div>
          </main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
