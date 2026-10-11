import Link from "next/link";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";

const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-archivo" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = { title: "Keep College Ave Cooking" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-offwhite font-sans text-navy">
        <header className="flex items-center justify-between gap-4 bg-navy px-4 py-3 text-offwhite">
          <Link href="/" className="flex min-h-11 items-center font-display text-xl md:text-2xl">Keep College Ave Cooking</Link>
          <nav className="flex gap-4 text-base font-bold md:gap-6 md:text-lg">
            <Link href="/deals" className="py-2">I&apos;m hungry</Link>
            <Link href="/owner" className="py-2">I run a restaurant</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-4 md:p-8">{children}</main>
      </body>
    </html>
  );
}
