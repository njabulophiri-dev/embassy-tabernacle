import Link from "next/link";

export default function Contact() {
  return (
    <main className="min-h-screen bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-royal-950/95 p-10 text-white shadow-2xl shadow-black/10 sm:p-12">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brightGold">
              Plan Your Visit
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Let us help you.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/75 sm:text-xl">
              Reach out to book a tour, ask about service times or get
              directions to our church.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6 rounded-3xl bg-white/5 p-8">
              <h2 className="text-2xl font-semibold text-white">
                Contact Options
              </h2>
              <div className="space-y-3 text-white/80">
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:info@embassytabernacle.org"
                    className="text-brightGold transition hover:text-white"
                  >
                    info@embassytabernacle.org
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a
                    href="tel:+1234567890"
                    className="text-brightGold transition hover:text-white"
                  >
                    +1 (234) 567-890
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> Pitsani Rd, Kelland, Johannesburg,
                  2194
                </p>
              </div>

              <div className="space-y-4 rounded-3xl bg-white/10 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-brightGold">
                  Need help with service times?
                </p>
                <p className="text-white/80">
                  If you'd like help choosing the best service or tour time,
                  send us a message and we'll follow up right away.
                </p>
                <Link
                  href="mailto:info@embassytabernacle.org?subject=Plan%20My%20Visit"
                  className="inline-flex rounded-full bg-brightGold px-6 py-3 text-sm font-semibold text-royal-950 transition hover:bg-white"
                >
                  Email Us to Schedule
                </Link>
              </div>
            </section>

            <section className="space-y-6 rounded-3xl bg-white/5 p-8">
              <h2 className="text-2xl font-semibold text-white">
                Quick booking details
              </h2>
              <div className="space-y-4 text-white/80">
                <div>
                  <p className="font-semibold text-white">
                    Typical service times
                  </p>
                  <p>Sunday • 9:00 AM - 12:00 AM</p>
                </div>
                <div>
                  <p className="font-semibold text-white">What to expect</p>
                  <p>
                    Warm welcome, family-friendly worship, children’s ministry
                    and a message rooted in Scripture.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-white">Parking</p>
                  <p>Available on-site with clear signage when you arrive.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
