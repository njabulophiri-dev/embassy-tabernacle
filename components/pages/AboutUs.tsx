import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import Layout from "../Layout";

const leaders = [
  {
    name: "Pastor John Matthews",
    role: "Lead Pastor",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85",
    bio: "Pastor John leads with a heart for biblical teaching, discipleship, and community transformation."
  },
  {
    name: "First Lady Mary Matthews",
    role: "Women's Ministry Leader",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=85",
    bio: "First Lady Mary champions women, families, and practical faith through compassionate leadership."
  }
];

export default function AboutUs() {
  return (
    <Layout>
      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl shadow-glow">
            <img
              src="https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1600&q=85"
              alt="Church congregation gathered inside a sanctuary"
              className="h-[360px] w-full object-cover sm:h-[520px]"
            />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-embassyGold">
              About Embassy
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-normal text-royal-950 sm:text-5xl">
              Our Story
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Embassy Tabernacle Church was founded as a spiritual home for
              families seeking a deeper walk with Christ, practical teaching,
              and a community committed to service. From weekly worship to
              local outreach, our mission is to raise ambassadors who represent
              the love, wisdom, and hope of Jesus wherever they go.
            </p>
            <blockquote className="mt-8 rounded-xl border-l-4 border-embassyGold bg-white p-6 font-serif text-2xl font-bold leading-9 text-royal-950 shadow-sm">
              "Raising Ambassadors rooted in Christ"
            </blockquote>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-embassyGold">
              Shepherding with purpose
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-royal-950">
              Our Leadership
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
            {leaders.map((leader) => (
              <article
                key={leader.name}
                className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-glow"
              >
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="mx-auto h-36 w-36 rounded-full object-cover ring-4 ring-embassyGold/30"
                />
                <h3 className="mt-6 font-serif text-2xl font-bold text-royal-950">
                  {leader.name}
                </h3>
                <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-embassyGold">
                  {leader.role}
                </p>
                <p className="mt-4 text-sm leading-6 text-gray-500">{leader.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-embassyGold">
                Visit this week
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold text-royal-950">
                Find Us
              </h2>
              <p className="mt-5 flex items-start gap-3 text-lg leading-8 text-gray-600">
                <MapPin className="mt-1 h-6 w-6 shrink-0 text-embassyGold" />
                123 Faith Avenue, Charlotte, NC 28201
              </p>
              <Link
                href="https://www.google.com/maps"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-royal-950 px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-embassyGold"
              >
                Get Directions
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-glow">
              <iframe
                title="Embassy Tabernacle Church map"
                src="https://www.google.com/maps?q=123%20Faith%20Avenue%2C%20Charlotte%2C%20NC%2028201&output=embed"
                className="h-[360px] w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
