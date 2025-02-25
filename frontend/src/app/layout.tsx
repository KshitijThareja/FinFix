"use client"
import { AuthProvider } from "./utils/authContext";
import { space_grotesk, akatab } from "./utils/fonts";
import { Navbar } from "@/components/navbar";
import { useDarkMode } from '../hooks/useDarkMode';
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { darkMode, setDarkMode } = useDarkMode();
  return (
    <html suppressHydrationWarning lang="en" className={`${space_grotesk.variable} ${akatab.variable}`}>
      <head>
        <title>FinFix</title>
        <meta name="description" content="Feeling lost financially? FinFix is here to help you find your way back to financial stability." />
      </head>
      <body className="font-fspace_grotesk">
        <AuthProvider>
          <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
