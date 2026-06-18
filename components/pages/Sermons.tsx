import Link from "next/link";
import { Music2, Play, Podcast, YouTube } from "lucide-react";
import Layout from "../Layout";

const sermons = [
  {
    title: "Walking Through Hard Times",
    preacher: "Pastor John",
    date: "March 16, 2026",
    image:
      "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Hope in Darkness",
    preacher: "Pastor Sarah",
    date: "March 9, 2026",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "The Power of Small Things",
    preacher: "Pastor John",
    date: "March 2, 2026",
    image:
      "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Forgiveness",
    preacher: "Pastor Mike",
    date: "February 23, 2026",
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Faith That Moves Mountains",
    preacher: "Pastor John",
    date: "February 16, 2026",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Love Your Neighbor",
    preacher: "First Lady Mary",
    date: "February 9, 2026",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85",
  },
];

const podcastButtons = [
  {
    label: "Spotify",
    Icon: Music2,
    className: "bg-[#1DB954] hover:bg-[#169c46]",
  },
  {
    label: "Apple Podcasts",
    Icon: Podcast,
    className: "bg-zinc-900 hover:bg-zinc-700",
  },
  { label: "YouTube", Icon: YouTube, className: "bg-red-600 hover:bg-red-700" },
];

export default function Sermons() {
  return (
    <Layout>
      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-embassyGold">
              Watch and grow
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-normal text-royal-950 sm:text-5xl">
              Recent Sermons
            </h1>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              Catch the latest messages from Embassy Tabernacle Church and stay
              encouraged throughout the week.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon) => (
              <article
                key={sermon.title}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-2 hover:scale-[1.01] hover:shadow-glow"
              >
                <Link
                  href="#"
                  className="group relative block aspect-video overflow-hidden"
                >
                  <img
                    src={sermon.image}
                    alt={`${sermon.title} sermon thumbnail`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-royal-950/20 transition group-hover:bg-royal-950/35" />
                  <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition group-hover:scale-110 group-hover:bg-embassyGold group-hover:text-royal-950">
                    <Play className="ml-1 h-7 w-7 fill-current" />
                  </span>
                </Link>
                <div className="p-6">
                  <h2 className="font-serif text-2xl font-bold leading-8 text-royal-950">
                    {sermon.title}
                  </h2>
                  <p className="mt-3 text-sm font-semibold text-gray-500">
                    {sermon.preacher}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">{sermon.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-4xl font-bold text-royal-950">
            Listen on Your Favorite Platform
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {podcastButtons.map(({ label, Icon, className }) => (
              <Link
                key={label}
                href="#"
                className={`inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 ${className}`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
