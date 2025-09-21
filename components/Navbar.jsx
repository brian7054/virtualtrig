// components/Navbar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2" aria-label="VIRTUALtrig home">
          {/* Mobile: icon only */}
          <Image
            src="/brand/mark.svg"
            alt="VIRTUALtrig"
            width={28}
            height={28}
            className="block md:hidden"
            priority
          />
          {/* Desktop: wordmark only */}
          <Image
            src="/brand/wordmark.svg"
            alt="VIRTUALtrig"
            width={160}
            height={28}
            className="hidden md:block"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/practice" className="text-sm text-gray-700 hover:text-black">
            Practice
          </Link>
          <Link href="/practice/identities" className="text-sm text-gray-700 hover:text-black">
            Identities
          </Link>
          <Link href="/contact" className="text-sm text-gray-700 hover:text-black">
            Contact
          </Link>

          <SignedOut>
            <Link
              href="/sign-in"
              className="inline-flex items-center rounded-xl bg-black text-white text-sm px-3 py-2 hover:bg-gray-900"
            >
              Sign in
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-lg border px-2.5 py-2 text-gray-700"
          aria-label="Toggle menu"
          aria-expanded={open ? "true" : "false"}
          onClick={() => setOpen((v) => !v)}
        >
          {/* Hamburger / X */}
          <svg
            className={`${open ? "hidden" : "block"}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <svg
            className={`${open ? "block" : "hidden"}`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div className={`md:hidden border-t ${open ? "block" : "hidden"}`}>
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
          <Link href="/practice" className="py-2 text-gray-800" onClick={() => setOpen(false)}>
            Practice
          </Link>
          <Link href="/practice/identities" className="py-2 text-gray-800" onClick={() => setOpen(false)}>
            Identities
          </Link>
          <Link href="/contact" className="py-2 text-gray-800" onClick={() => setOpen(false)}>
            Contact
          </Link>

          <SignedOut>
            <Link
              href="/sign-in"
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-black text-white px-3 py-2 hover:bg-gray-900"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="pt-1">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
