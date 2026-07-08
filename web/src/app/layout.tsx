import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { AppQueryProvider } from "@/lib/query-client";
import "./styles.css";

export const metadata: Metadata = {
  title: "Community Forum"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppQueryProvider>
          <div className="shell">
            <header className="topbar">
              <div>
                <p className="eyebrow">Saved Posts Take-Home</p>
                <h1>Community Forum</h1>
              </div>

              <nav className="nav">
                <Link href="/">Feed</Link>
                <Link href="/saved">Saved</Link>
              </nav>
            </header>
            {children}
          </div>
        </AppQueryProvider>
      </body>
    </html>
  );
}
