"use client"
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import { Poppins, Raleway } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css"; // Import NProgress styles
const poppins = Poppins({weight: '400', subsets: ['latin'] })

export default function RootLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
      NProgress.start();
    };

    const handleStop = () => {
      setLoading(false);
      NProgress.done();
    };

    router.events?.on("routeChangeStart", handleStart);
    router.events?.on("routeChangeComplete", handleStop);
    router.events?.on("routeChangeError", handleStop);
    return () => {
      router.events?.off("routeChangeStart", handleStart);
      router.events?.off("routeChangeComplete", handleStop);
      router.events?.off("routeChangeError", handleStop);
    };
  }, [router]);

  return (
    <html lang="en">
      <UserProvider>
        <body className={poppins.className}>
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
              <p className="text-xl font-semibold">Loading...</p>
            </div>
          )}
          {children}
        </body>
      </UserProvider>
    </html>
  );
}
