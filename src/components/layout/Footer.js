import Link from "next/link";
import Image from "next/image";
import { SITE, CONTACT, NAV_LINKS, SOCIAL } from "@/constants/site";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FaFacebookF, url: SOCIAL.facebook, label: "Facebook" },
    { icon: FaInstagram, url: SOCIAL.instagram, label: "Instagram" },
    { icon: FaTwitter, url: SOCIAL.twitter, label: "Twitter" },
    { icon: FaLinkedinIn, url: SOCIAL.linkedin, label: "LinkedIn" },
  ].filter((s) => s.url);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt={`${SITE.name} Logo`}
                width={48}
                height={48}
                className="rounded-lg"
              />
              <h2 className="text-white text-xl font-bold">{SITE.name}</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {SITE.tagline}. Bringing the community together through
              volunteerism and support.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, url, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-emerald-600 hover:text-white transition-all duration-200"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.filter((l) => !l.children).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {NAV_LINKS.filter((l) => l.children).flatMap((l) =>
                l.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={CONTACT.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  <FiMapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{CONTACT.address.full}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  <FiMail className="w-4 h-4 shrink-0" />
                  <span>{CONTACT.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phoneLink}`}
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  <FiPhone className="w-4 h-4 shrink-0" />
                  <span>
                    {CONTACT.person}: {CONTACT.phone}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            &copy; {currentYear} {SITE.name}. All rights reserved.
          </p>
          <p>
            Designed by{" "}
            <a
              href="https://coreaxis.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-emerald-400 transition-colors"
            >
              CoreAxis Development
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
