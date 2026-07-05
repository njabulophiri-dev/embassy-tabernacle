import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/send-visit-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Unable to send your message.");
      }

      setStatus("success");
      setFeedback("Thanks! Your visit request has been sent.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof Error ? error.message : "Unable to send your message.",
      );
    }
  };

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
                    href="mailto:njabulophiri55@gmail.com"
                    className="text-brightGold transition hover:text-white"
                  >
                    embassy.tabernacle@gmail.com
                  </a>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a
                    href="tel:+27606026095"
                    className="text-brightGold transition hover:text-white"
                  >
                    +27 (60) 602 6095
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> Pitsani Rd, Kelland, Johannesburg,
                  2194
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-3xl bg-white/10 p-6"
              >
                <p className="text-sm uppercase tracking-[0.25em] text-brightGold">
                  Need help with service times?
                </p>
                <p className="text-white/80">
                  If you'd like help choosing the best service or tour time,
                  send us a message and we'll follow up right away.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-white/10 bg-royal-950/80 px-4 py-3 text-white outline-none transition focus:border-brightGold"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Your email"
                    className="w-full rounded-2xl border border-white/10 bg-royal-950/80 px-4 py-3 text-white outline-none transition focus:border-brightGold"
                    required
                  />
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Tell us what you'd like help with"
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-royal-950/80 px-4 py-3 text-white outline-none transition focus:border-brightGold"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex rounded-full bg-brightGold px-6 py-3 text-sm font-semibold text-royal-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "loading" ? "Sending..." : "Email Us to Schedule"}
                </button>
                {feedback ? (
                  <p
                    className={`text-sm ${
                      status === "success" ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {feedback}
                  </p>
                ) : null}
              </form>
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
