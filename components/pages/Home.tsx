import { useEffect, useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import Layout, { socialLinks } from "../Layout";

const landscapeImages = [
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920738/WhatsApp_Image_2026-10-06_at_11.54.30_2_d6qpyv.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920566/WhatsApp_Image_2026-10-06_at_11.54.31_1_hurgul.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920979/WhatsApp_Image_2026-10-06_at_11.54.29_k0fpma.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920452/wmremove-1_enotcr.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920931/WhatsApp_Image_2026-10-06_at_11.54.29_1_owcv1e.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920403/wmremove-transformed_rqmyzh.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920806/WhatsApp_Image_2026-10-06_at_11.54.30_amrcri.jpg",
];

const portraitImages = [
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791921030/output-image_1_o6h9ap.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920898/output-image_igincy.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920849/output-image_2_femwhx.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920659/WhatsApp_Image_2026-10-06_at_11.54.31_2_db737c.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920617/WhatsApp_Image_2026-10-06_at_11.54.31_mxyols.jpg",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920178/phototune.ai_1791919686_pqrtix.png",
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920122/hero1.png",
];

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
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const images = isMobile ? portraitImages : landscapeImages;
  const slides = [...images, ...images];

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const updateMobile = () => setIsMobile(mobileQuery.matches);
    const updateReducedMotion = () =>
      setPrefersReducedMotion(reducedMotionQuery.matches);

    updateMobile();
    updateReducedMotion();
    mobileQuery.addEventListener("change", updateMobile);
    reducedMotionQuery.addEventListener("change", updateReducedMotion);

    return () => {
      mobileQuery.removeEventListener("change", updateMobile);
      reducedMotionQuery.removeEventListener("change", updateReducedMotion);
    };
  }, []);

  return (
    <Layout>
      <section className="home-hero relative isolate aspect-[4/5] min-h-[600px] w-full overflow-hidden sm:aspect-[16/9] sm:min-h-0 lg:aspect-[21/9]">
        <div
          className="home-image-track absolute inset-0 z-10 flex"
          style={{
            width: "max-content",
            animationDuration: `${images.length * 6}s`,
            animationPlayState:
              isPaused || prefersReducedMotion ? "paused" : "running",
          }}
        >
          {slides.map((image, index) => (
            <div
              key={`${index}-${image}`}
              aria-hidden="true"
              className="relative h-full flex-none overflow-hidden"
              style={{ width: isMobile ? "75cqh" : "133.333333cqh" }}
            >
              <img
                src={image}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover object-center blur-2xl"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <img
                src={image}
                alt=""
                className="absolute inset-0 h-full w-full object-contain object-center"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/60 via-black/25 to-black/10" />

        {images.length > 1 && (
          <div className="absolute bottom-6 right-4 z-30 flex items-center gap-2 sm:bottom-8 sm:right-8">
            <button
              type="button"
              onClick={() => setIsPaused((paused) => !paused)}
              aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-black/30 text-white backdrop-blur transition hover:bg-white hover:text-royal-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brightGold"
            >
              {isPaused ? (
                <Play aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Pause aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        <div className="relative z-30 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 mt-14 inline-flex rounded-full border border-brightGold/50 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-brightGold backdrop-blur sm:mt-0">
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
