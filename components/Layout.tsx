import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { siFacebook, siInstagram, siTiktok } from "simple-icons";

import { Mail, Menu, Phone, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Giving", href: "/giving" },
  { label: "Sermons", href: "/sermons" },
];

export const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/18fKw2tafN/?mibextid=wwXIfr",
    Icon: siFacebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/embassy.tabernacle",
    Icon: siInstagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@embassy_tabernacle",
    Icon: siTiktok,
  },
];

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const contactEmail = "embassy.tabernacle@gmail.com";
  const contactEmailHref = `mailto:${contactEmail}?subject=Hello%20Embassy%20Tabernacle`;

  const handleEmailClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.location.href = contactEmailHref;
    window.open(contactEmailHref, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-royal-950/95 text-white backdrop-blur transition-all duration-300 ${
          isScrolled ? "shadow-xl" : "shadow-none"
        }`}
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
            isScrolled ? "h-16" : "h-20"
          }`}
          aria-label="Main navigation"
        >
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white/5">
              <Image
                src="/images/logo.jpg"
                alt="Embassy Tabernacle Logo"
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <span className="truncate font-serif text-lg font-bold tracking-normal sm:text-xl">
              Embassy Tabernacle Church
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-white/85 transition hover:text-brightGold"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/contact"
              className="rounded-full bg-embassyGold px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-brightGold hover:text-royal-950"
            >
              Plan Your Visit
            </Link>
          </div>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition hover:border-brightGold hover:text-brightGold lg:hidden"
            aria-label="Toggle navigation menu"
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        <div
          id="mobile-navigation"
          className={`overflow-hidden border-t border-white/10 bg-royal-950 transition-all duration-300 lg:hidden ${
            isMenuOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-brightGold"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 rounded-full bg-embassyGold px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-brightGold hover:text-royal-950"
            >
              Plan Your Visit
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-20">{children}</div>

      <footer className="bg-royal-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white/5">
                <Image
                  src="/images/logo.jpg"
                  alt="Embassy Tabernacle Logo"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </span>
              <span className="font-serif text-xl font-bold">
                Embassy Tabernacle Church
              </span>
            </Link>
            <p className="mt-4 font-semibold text-brightGold">
              Raising Ambassadors rooted in Christ
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
              We are a Bible-anchored, Christ-centered and
              <br />
              Spirit-led Church
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold">Quick Links</h2>
            <div className="mt-4 flex flex-col items-start gap-3">
              {["Home", "About Us", "Giving", "Sermons"].map((label) => (
                <Link
                  key={label}
                  href={
                    label === "Home"
                      ? "/"
                      : label === "About Us"
                        ? "/about"
                        : label === "Giving"
                          ? "/giving"
                          : label === "Sermons"
                            ? "/sermons"
                            : "#"
                  }
                  className="text-sm text-white/70 transition hover:text-brightGold"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold">Connect With Us</h2>
            <div className="mt-5 flex gap-3">
              {socialLinks.map(({ label, href, Icon }) => {
                const commonClasses =
                  "grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:-translate-y-1 hover:bg-embassyGold hover:text-royal-950";
                const content = (
                  <div
                    dangerouslySetInnerHTML={{ __html: Icon.svg }}
                    className="h-5 w-5"
                  />
                );

                return href.startsWith("http") ? (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={commonClasses}
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(href, "_blank", "noopener,noreferrer");
                    }}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    className={commonClasses}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
            <a
              href={contactEmailHref}
              onClick={handleEmailClick}
              className="mt-5 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-brightGold"
            >
              <Mail className="h-4 w-4" />
              {contactEmail}
            </a>
            <a
              href="tel:+27606026095"
              onClick={() => {
                window.location.href = "tel:+27606026095";
              }}
              className="mt-2 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-brightGold"
            >
              <Phone className="h-4 w-4" />
              +27 (60) 602 6095
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-6 text-center text-sm text-white/60">
          <p>© 2026 Embassy Tabernacle Church. All Rights Reserved.</p>
          <p className="mt-1">
            Developed by{" "}
            <Link
              href="https://zorya.co.za"
              className="font-semibold text-brightGold transition hover:text-white"
            >
              Zorya Studio
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
