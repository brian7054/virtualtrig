// components/Navbar.jsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/practice", label: "Practice" },
  { href: "/support", label: "Support" },
  // { href: "/teachers", label: "Teachers" }, // uncomment when ready
];

function NavLink({ href, label, current, onClick }) {
  const base =
    "px-3 py-2 rounded-lg text-sm transition-colors duration-150";
  const active = "bg-gray-900 text-white";
  const inactive =
    "text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none";
  return (
    <Link href={href} className={`${base} ${current ? active : inactive}`} onClick={onClick}>
      {label}
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    const close = () => setOpen(false);
    router.events?.on("routeChangeComplete", close);
    return () => router.events?.off("routeChangeComplete", close);
  }, [router.events]);

  const isCurrent = (href) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-3 md:p-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2" aria-label="VIRTUALtrig home">
          {/* Compact mark (always visible) */}
          <img
            src="/virtualtrig-icon.svg"
            alt=""
            className="h-7 w-7"
          />
          {/* Wordmark (auto light/dark if you used the provided SVG) */}
          <img
            src="/virtualtrig-wordmark.svg"
            alt="VIRTUALtrig"
            className="hidden md:block h-8 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {LINKS.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              label={l.label}
              current={isCurrent(l.href)}
            />
          ))}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 border"
            aria-controls="mobile-menu"
            aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Toggle menu</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div id="mobile-menu" className={`md:hidden border-t ${open ? "block" : "hidden"}`}>
        <div className="max-w-6xl mx-auto p-3 flex flex-col gap-2">
          {LINKS.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              label={l.label}
              current={isCurrent(l.href)}
              onClick={() => setOpen(false)}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
