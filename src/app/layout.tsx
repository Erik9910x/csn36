import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ui/Toast";
import { Taskbar } from "@/components/layout/Taskbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CASINO36.FUN - Demo Game Platform",
  description: "A fun, virtual-currency demo game platform. No real money, just entertainment!",
  keywords: ["casino", "demo", "games", "tai xiu", "bau cua", "slot", "aviator"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <Taskbar />
            <main className="min-h-screen pt-16 pb-24">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
