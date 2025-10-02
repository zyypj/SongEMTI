import "./globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "SongEMTI", description: "Stream your vibes." };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-neutral-950 text-neutral-100 antialiased">
        <div className="min-h-screen grid grid-rows-[auto_1fr]">
          {children}
        </div>
      </body>
    </html>
  );
}
