import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS } from "@/constants/site";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(null);
  }, [router.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300">
            <Image
              src="/logo.png"
              alt="Pa's Place Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span
            className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
              scrolled ? "text-gray-900" : "text-white drop-shadow-lg"
            }`}
          >
            Pa&apos;s Place
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" ref={dropdownRef}>
          {NAV_LINKS.map((link) =>
            link.children ? (
              <div key={link.label} className="relative">
                <button
                  onClick={() =>
                    setDropdownOpen(
                      dropdownOpen === link.label ? null : link.label
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    isActive(link.href)
                      ? scrolled
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-white bg-white/20"
                      : scrolled
                      ? "text-gray-700 hover:text-emerald-700 hover:bg-gray-50"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      dropdownOpen === link.label ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {dropdownOpen === link.label && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-2.5 text-sm transition-colors ${
                          isActive(child.href)
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-gray-700 hover:bg-gray-50 hover:text-emerald-700"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? scrolled
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-white bg-white/20"
                    : scrolled
                    ? "text-gray-700 hover:text-emerald-700 hover:bg-gray-50"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled
              ? "text-gray-700 hover:bg-gray-100"
              : "text-white hover:bg-white/10"
          }`}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-slideDown">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button
                    onClick={() =>
                      setDropdownOpen(
                        dropdownOpen === link.label ? null : link.label
                      )
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium ${
                      isActive(link.href)
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        dropdownOpen === link.label ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {dropdownOpen === link.label && (
                    <div className="ml-4 mt-1 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-4 py-2.5 rounded-lg text-sm ${
                            isActive(child.href)
                              ? "text-emerald-700 bg-emerald-50"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive(link.href)
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
