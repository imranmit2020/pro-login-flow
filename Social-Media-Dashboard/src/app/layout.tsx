import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OfinaPulse - Dashboard",
  description: "Comprehensive business management system with AI-powered assistance for tasks, appointments, communications, and analytics.",
  icons: {
    icon: "/OfinaPulse-Logo.png",
    shortcut: "/OfinaPulse-Logo.png",
    apple: "/OfinaPulse-Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force light theme and prevent dark mode
              (function() {
                // Remove any existing dark class
                document.documentElement.classList.remove('dark');
                // Force light theme
                document.documentElement.classList.add('light');
                // Store preference in localStorage
                localStorage.setItem('theme', 'light');
                // Override system preference
                localStorage.setItem('systemTheme', 'light');
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
