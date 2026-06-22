import Link from "next/link";
import { Play } from "lucide-react";
import { siYoutube, siApplepodcasts, siSpotify } from "simple-icons";
import type { ComponentType, SVGProps } from "react";
import { useState } from "react";
import Layout from "../Layout";

type PodcastIcon = ComponentType<SVGProps<SVGSVGElement>> | { svg: string };

function isSvgIcon(icon: PodcastIcon): icon is { svg: string } {
  return typeof icon === "object" && icon !== null && "svg" in icon;
}

const sermons = [
  {
    title: "Walking Through Hard Times",
    preacher: "Pastor John",
    date: "March 16, 2026",
    videoId: "dQw4w9WgXcQ",
  },
  {
    title: "Hope in Darkness",
    preacher: "Pastor Sarah",
    date: "March 9, 2026",
    videoId: "9bZkp7q19f0",
  },
  {
    title: "The Power of Small Things",
    preacher: "Pastor John",
    date: "March 2, 2026",
    videoId: "jNQXAC9IVRw",
  },
  {
    title: "Forgiveness",
    preacher: "Pastor Mike",
    date: "February 23, 2026",
    videoId: "dQw4w9WgXcQ",
  },
  {
    title: "Faith That Moves Mountains",
    preacher: "Pastor John",
    date: "February 16, 2026",
    videoId: "9bZkp7q19f0",
  },
  {
    title: "Love Your Neighbor",
    preacher: "First Lady Mary",
    date: "February 9, 2026",
    videoId: "jNQXAC9IVRw",
  },
  {
    title: "The Grace of God",
    preacher: "Pastor John",
    date: "February 2, 2026",
    videoId: "dQw4w9WgXcQ",
  },
  {
    title: "Living in Purpose",
    preacher: "Pastor Sarah",
    date: "January 26, 2026",
    videoId: "9bZkp7q19f0",
  },
  {
    title: "Strength in Weakness",
    preacher: "Pastor Mike",
    date: "January 19, 2026",
    videoId: "jNQXAC9IVRw",
  },
];

const podcastButtons: {
  label: string;
  Icon: PodcastIcon;
  className: string;
}[] = [
  {
    label: "Spotify",
    Icon: siSpotify,
    className: "bg-[#1DB954] hover:bg-[#169c46]",
  },
  {
    label: "Apple Podcasts",
    Icon: siApplepodcasts,
    className: "bg-zinc-700 hover:bg-zinc-500",
  },
  {
    label: "YouTube",
    Icon: siYoutube,
    className: "bg-red-600 hover:bg-red-700",
  },
];

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export default function Sermons() {
  const [displayCount, setDisplayCount] = useState(6);
  const displayedSermons = sermons.slice(0, displayCount);
  const hasMore = displayCount < sermons.length;

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
            {displayedSermons.map((sermon) => (
              <article
                key={`${sermon.title}-${sermon.date}`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-2 hover:scale-[1.01] hover:shadow-glow"
              >
                <Link
                  href="#"
                  className="group relative block aspect-video overflow-hidden"
                >
                  <img
                    src={getYouTubeThumbnail(sermon.videoId)}
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

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setDisplayCount(displayCount + 6)}
                className="rounded-full bg-embassyGold px-8 py-4 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-brightGold hover:text-royal-950"
              >
                Add More
              </button>
            </div>
          )}
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
                {isSvgIcon(Icon) ? (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: Icon.svg }}
                  />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
