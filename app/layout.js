import Link from "next/link";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const mono = IBM_Plex_Mono({ weight: "400", subsets: ["latin"], variable: "--font-mono" });

export const metadata = { title: "Keep College Ave Cooking", description: "Know the cost. Move the food." };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${space.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink">
        <header className="border-b border-rule bg-ink px-5 py-4 text-paper md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
            <Link href="/" className="flex min-h-11 items-center gap-3 font-bold tracking-tight">
              <span className="grid size-9 place-items-center bg-action text-base font-black text-ink">CC</span>
              <span className="hidden sm:inline">Keep College Ave Cooking</span>
              <span className="sm:hidden">College Ave</span>
            </Link>
            <nav className="flex items-center gap-5 font-bold md:gap-8">
              <Link href="/deals" className="inline-flex min-h-11 items-center py-2 text-lg text-paper hover:text-action">Deals for tonight</Link>
              <Link href="/owner" className="inline-flex min-h-11 items-center border-l border-paper/40 py-2 pl-5 text-lg text-action md:pl-8">Owner desk</Link>
          </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">{children}</main>
      </body>
    </html>
  );
}
