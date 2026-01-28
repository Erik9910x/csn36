
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ui/Toast";
import { Taskbar } from "@/components/layout/Taskbar";

export const metadata: Metadata = {
    title: "CASINO36 V3",
    description: "Rebuilt from scratch",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <ToastProvider>
                        <Taskbar />
                        <main className="min-h-screen pt-20 px-4 pb-12 container mx-auto">
                            {children}
                        </main>
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
