import "./globals.css";
import React from "react";

export const metadata = {
  title: "AI Graphics News",
  description: "Denný výber AI noviniek pre grafikov",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body className="bg-zinc-950 text-zinc-100">
        <div className="max-w-4xl mx-auto p-5">
          <header className="py-6">
            <h1 className="text-2xl font-semibold">AI Graphics News</h1>
            <p className="text-sm opacity-70">Denný výber AI noviniek pre grafikov (MVP)</p>
          </header>
          {children}
          <footer className="py-10 text-xs opacity-60">© {new Date().getFullYear()} – MVP</footer>
        </div>
      </body>
    </html>
  );
}
