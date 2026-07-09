import React from "react";
import Link from "next/link";
import { Church, CalendarDays, Users } from "lucide-react";
import Layout, { socialLinks } from "../Layout";

/*const stats = [
  {
    label: "10+ Years",
    detail: "Serving families with faith and purpose",
    Icon: CalendarDays,
  },
  {
    label: "500+ Members",
    detail: "A growing community of ambassadors",
    Icon: Users,
  },
  {
    label: "Multiple Campuses",
    detail: "One church family across communities",
    Icon: Church,
  },
]; */

export default function Home() {
  return (
    <Layout>
      <section className="relative isolate aspect-[4/5] min-h-[600px] w-full overflow-hidden sm:aspect-[16/9] sm:min-h-0 lg:aspect-[21/9]">
        <img
          src="https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=2200&q=85"
          alt="Church congregation worshipping with hands raised"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-royal-950/95 via-royal-950/70 to-royal-950/25" />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative flex h-full max-w-7xl flex-col justify-center mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-brightGold/50 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-brightGold backdrop-blur">
              Sunday worship at 09:00 AM
            </p>
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-normal text-white sm:text-6xl lg:text-7xl">
              Welcome to Embassy Tabernacle
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-medium leading-8 text-white/90 sm:text-2xl">
              Raising Ambassadors rooted in{" "}
              <span className="font-bold text-brightGold">Christ</span>
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-embassyGold px-8 py-4 text-center text-base font-bold text-white shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:bg-brightGold hover:text-royal-950"
              >
                Plan Your Visit
              </Link>
              <Link
                href="/sermons"
                className="rounded-full border-2 border-white px-8 py-4 text-center text-base font-bold text-white transition hover:-translate-y-1 hover:bg-white hover:text-royal-950"
              >
                Watch a Sermon
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* or just add pb-8 to the last section wrapper, or margin on Layout's footer */}
      {/*<section className="bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map(
              ({
                label,
                href,
                Icon,
              }: {
                label: string;
                href: string;
                Icon: any;
              }) => {
                const classes =
                  "grid h-12 w-12 place-items-center rounded-full border border-royal-950/10 bg-white text-royal-950 shadow-sm transition hover:-translate-y-1 hover:border-embassyGold hover:bg-embassyGold hover:text-white hover:shadow-lg";
                const content =
                  typeof Icon === "function" ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      dangerouslySetInnerHTML={{ __html: Icon.svg }}
                    />
                  );

                return href.startsWith("http") ? (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes}
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
                    className={classes}
                  >
                    {content}
                  </Link>
                );
              },
            )}
          </div>
        </div>
      </section>*/}
      {/* <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {stats.map(({ label, detail, Icon }) => {
            const IconComponent = Icon as unknown as React.ComponentType<
              React.SVGProps<SVGSVGElement>
            >;
            return (
              <article
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-glow"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-royal-950 text-brightGold">
                  <IconComponent className="h-7 w-7" />
                </div>
                <h2 className="mt-6 font-serif text-3xl font-bold text-royal-950">
                  {label}
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-500">{detail}</p>
              </article >
            );
          })}
        </div>
      </section > */}
    </Layout>
  );
}
