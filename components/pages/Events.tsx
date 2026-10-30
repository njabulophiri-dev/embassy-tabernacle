import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  Clock3,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  eventDates,
  getSouthAfricanToday,
  isPastEventDate,
  pastEventIds,
} from "../../lib/event-dates";
import Layout from "../Layout";

const churchAddress = "Pitsani Rd, Kelland, Johannesburg, 2194";
const gatheringImage =
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1791920738/WhatsApp_Image_2026-10-06_at_11.54.30_2_d6qpyv.jpg";
const sundayPosterImage =
  "https://res.cloudinary.com/dae3qtnqt/image/upload/v1793348384/16840f19-4eb2-4034-9043-8b0bba70a7dc_hpkzs4.jpg";
const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  churchAddress,
)}`;

const eventPreviews = [
  {
    id: "b4ileave-varsity-summit",
    label: "B4iLeave Varsity Summit",
    title: "B4iLeave Varsity Summit",
    description: "Event details and registration information will be shared soon.",
    posterUrl:
      "https://res.cloudinary.com/dae3qtnqt/image/upload/v1793348334/20498c1a-8be6-484b-b7fc-3bdfea18fc45_kerany.jpg",
  },
  {
    id: "night-prayer",
    label: "Night Prayer",
    title: "Night Prayer",
    description: "Event details and registration information will be shared soon.",
    posterUrl:
      "https://res.cloudinary.com/dae3qtnqt/image/upload/v1793348335/8153edf5-a105-4e50-8f53-ff0d06c41f0f_stgh9o.jpg",
  },
  {
    id: "singles-service",
    label: "Singles Service",
    title: "Singles Service",
    description: "Event details and registration information will be shared soon.",
    posterUrl:
      "https://res.cloudinary.com/dae3qtnqt/image/upload/v1793348334/f87a42a8-0ed9-4c93-98c1-e38cb7255637_hjflsu.jpg",
  },
  {
    id: "first-sunday-service",
    label: "First Sunday Service",
    title: "First Sunday Service",
    description: "Event details and registration information will be shared soon.",
    posterUrl:
      "https://res.cloudinary.com/dae3qtnqt/image/upload/v1793348335/d9f973be-7cd7-4c37-b2c4-6bf65396af33_wes1oh.jpg",
  },
  {
    id: "passover-conference",
    label: "Passover Conference",
    title: "Passover Conference",
    description: "Event details and registration information will be shared soon.",
    posterUrl:
      "https://res.cloudinary.com/dae3qtnqt/image/upload/v1793348333/1493cfe9-1960-46c1-bbe1-82d585057024_xtuojb.jpg",
  },
] as const;

const initialEventCount = 6;

export default function Events() {
  const [today, setToday] = useState(getSouthAfricanToday);
  const [displayCount, setDisplayCount] = useState(initialEventCount);
  const [selectedEvent, setSelectedEvent] = useState<
    (typeof eventPreviews)[number] | null
  >(null);
  const [registrationStatus, setRegistrationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [registrationFeedback, setRegistrationFeedback] = useState("");

  useEffect(() => {
    const updateToday = () => setToday(getSouthAfricanToday());
    updateToday();

    const timer = window.setInterval(updateToday, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const handleRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEvent) return;

    const formData = new FormData(event.currentTarget);
    setRegistrationStatus("loading");
    setRegistrationFeedback("");

    try {
      const response = await fetch("/api/event-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          guests: formData.get("guests"),
          consent: formData.get("consent") === "on",
          note: formData.get("note"),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to send your registration.");
      }

      setRegistrationStatus("success");
      setRegistrationFeedback(
        "Thanks for your interest! Our team will be in touch as soon as event details are confirmed.",
      );
    } catch (error) {
      setRegistrationStatus("error");
      setRegistrationFeedback(
        error instanceof Error
          ? error.message
          : "Unable to send your registration. Please try again.",
      );
    }
  };

  const closeRegistration = () => {
    if (registrationStatus === "loading") return;
    setSelectedEvent(null);
    setRegistrationStatus("idle");
    setRegistrationFeedback("");
  };

  return (
    <Layout>
      <main>
        <section className="relative isolate flex min-h-[46rem] items-center overflow-hidden bg-royal-950 text-white sm:min-h-[42rem] lg:min-h-[44rem]">
          <img
            src={gatheringImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[55%_center] sm:object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-royal-950/65 via-royal-950/75 to-royal-950 sm:bg-gradient-to-r sm:from-royal-950/90 sm:via-royal-950/70 sm:to-royal-950/45"
          />
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-40 -z-[5] h-[32rem] w-[32rem] rounded-full border border-brightGold/20"
          />
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-24 -z-[5] h-[24rem] w-[24rem] rounded-full border border-brightGold/15"
          />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-brightGold">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Life together
              </p>
              <h1 className="mt-5 max-w-2xl font-serif text-5xl font-bold leading-[1.08] sm:text-6xl lg:text-7xl">
                Gather with us.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-xl sm:leading-8">
                There is a place for you at Embassy Tabernacle. Join us for
                worship, grow in faith and share life with our church family.
              </p>
              <Link
                href="#gatherings"
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-embassyGold px-7 py-4 text-sm font-bold text-royal-950 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Explore our gatherings
                <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative max-w-lg rounded-3xl border border-white/20 bg-royal-950/55 p-6 shadow-2xl backdrop-blur-md sm:p-8 lg:ml-auto">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brightGold">
                A word for the gathering
              </p>
              <p className="mt-5 font-serif text-2xl font-medium italic leading-relaxed sm:text-3xl">
                “I was glad when they said unto me, Let us go into the house of
                the Lord.”
              </p>
              <div className="mt-8 h-px bg-white/15" />
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-brightGold">
                Psalm 122:1
              </p>
              <p className="mt-2 text-sm text-white/65">King James Version</p>
            </div>
          </div>
        </section>

        <section
          id="gatherings"
          className="scroll-mt-20 bg-slate-50 px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-embassyGold">
                Come as you are
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold text-royal-950 sm:text-5xl">
                Our gatherings
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Make time for worship, the Word and community. We would love to
                welcome you this Sunday.
              </p>
            </div>

            <article className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-glow">
              <div className="grid lg:grid-cols-[0.8fr_2fr]">
                <div className="relative flex min-h-52 items-center justify-center overflow-hidden bg-royal-950">
                  <img
                    src={sundayPosterImage}
                    alt="Sunday worship poster"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>

                <div className="p-7 sm:p-9">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-embassyGold">
                        Weekly gathering
                      </p>
                      <h3 className="mt-2 font-serif text-3xl font-bold text-royal-950">
                        Sunday Worship
                      </h3>
                    </div>
                    <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-royal-950">
                      All are welcome
                    </span>
                  </div>

                  <div className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Clock3
                        aria-hidden="true"
                        className="mt-0.5 h-5 w-5 shrink-0 text-embassyGold"
                      />
                      <div>
                        <p className="text-sm font-semibold text-royal-950">
                          Sundays at 9:00 AM
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Join us for Sunday worship
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin
                        aria-hidden="true"
                        className="mt-0.5 h-5 w-5 shrink-0 text-embassyGold"
                      />
                      <div>
                        <p className="text-sm font-semibold text-royal-950">
                          Johannesburg
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {churchAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-royal-950 transition hover:text-embassyGold"
                  >
                    Get directions
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section
          id="special-events"
          className="scroll-mt-20 overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-embassyGold">
                  <Sparkles aria-hidden="true" className="h-4 w-4" />
                  Make room for more
                </p>
                <h2 className="mt-3 font-serif text-4xl font-bold text-royal-950 sm:text-5xl">
                  Something special is coming.
                </h2>
                <p className="mt-5 text-lg leading-8 text-gray-600">
                  Meaningful moments are better together. Explore a preview of
                  the gatherings we’re dreaming up and let us know what you’d
                  love to be part of.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {eventPreviews.slice(0, displayCount).map((preview) => {
                const isPast =
                  pastEventIds.has(preview.id) ||
                  isPastEventDate(eventDates[preview.id], today);

                return (
                  <article
                    key={preview.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-glow"
                  >
                    <div className="relative m-3 aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-slate-100">
                      <img
                        src={preview.posterUrl}
                        alt={`${preview.title} event poster`}
                        className="h-full w-full object-contain"
                      />
                      {isPast && (
                        <span className="absolute right-4 top-4 rounded-full border border-brightGold/60 bg-black/55 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest text-brightGold backdrop-blur">
                          Past event
                        </span>
                      )}
                    </div>

                    <div className="px-6 pb-6 pt-2 sm:px-7 sm:pb-7">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-embassyGold">
                        {preview.label}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl font-bold text-royal-950">
                        {preview.title}
                      </h3>
                      <p className="mt-3 min-h-[3.5rem] text-sm leading-6 text-gray-600">
                        {preview.description}
                      </p>
                      {isPast ? (
                        <p className="mt-5 rounded-full bg-slate-100 px-5 py-3.5 text-center text-sm font-semibold text-gray-500">
                          This event has passed
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(preview)}
                          className="mt-5 inline-flex w-full items-center justify-between rounded-full bg-royal-950 px-5 py-3.5 text-sm font-bold text-white transition group-hover:bg-embassyGold group-hover:text-royal-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-950"
                        >
                          Register your interest
                          <ChevronRight
                            aria-hidden="true"
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {displayCount < eventPreviews.length && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <p className="text-sm text-gray-500">
                  Showing {Math.min(displayCount, eventPreviews.length)} of{" "}
                  {eventPreviews.length} events
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDisplayCount((count) =>
                      Math.min(count + initialEventCount, eventPreviews.length),
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-embassyGold px-8 py-4 text-sm font-bold text-royal-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-brightGold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal-950"
                >
                  Show more events
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {selectedEvent && (
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-royal-950/75 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeRegistration();
            }}
          >
            <section
              aria-labelledby="registration-title"
              aria-modal="true"
              className="relative max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-9"
              role="dialog"
            >
              <button
                type="button"
                onClick={closeRegistration}
                disabled={registrationStatus === "loading"}
                aria-label="Close registration form"
                className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-royal-950 transition hover:bg-slate-200 disabled:opacity-50"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>

              {registrationStatus === "success" ? (
                <div className="py-8 text-center">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                    <CheckCircle2 aria-hidden="true" className="h-9 w-9" />
                  </span>
                  <h2
                    id="registration-title"
                    className="mt-6 font-serif text-3xl font-bold text-royal-950"
                  >
                    You’re on our list.
                  </h2>
                  <p className="mt-4 leading-7 text-gray-600">
                    {registrationFeedback}
                  </p>
                  <button
                    type="button"
                    onClick={closeRegistration}
                    className="mt-7 rounded-full bg-royal-950 px-7 py-3 text-sm font-bold text-white transition hover:bg-embassyGold hover:text-royal-950"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p className="pr-12 text-xs font-bold uppercase tracking-[0.2em] text-embassyGold">
                    Be part of it
                  </p>
                  <h2
                    id="registration-title"
                    className="mt-3 pr-10 font-serif text-3xl font-bold text-royal-950"
                  >
                    Register your interest
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Let us know you’re interested in{" "}
                    <span className="font-semibold text-royal-950">
                      {selectedEvent.label}
                    </span>
                    . Our team will reach out when details are confirmed.
                  </p>

                  <form
                    className="mt-7 space-y-4"
                    onSubmit={handleRegistration}
                  >
                    <label className="block">
                      <span className="text-sm font-semibold text-royal-950">
                        Your name
                      </span>
                      <input
                        autoComplete="name"
                        name="name"
                        required
                        maxLength={100}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-royal-950 outline-none transition placeholder:text-gray-400 focus:border-embassyGold focus:ring-2 focus:ring-embassyGold/20"
                        placeholder="e.g. Thandi Mokoena"
                      />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-semibold text-royal-950">
                          Email address
                        </span>
                        <input
                          autoComplete="email"
                          name="email"
                          type="email"
                          required
                          maxLength={254}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-royal-950 outline-none transition placeholder:text-gray-400 focus:border-embassyGold focus:ring-2 focus:ring-embassyGold/20"
                          placeholder="you@example.com"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-royal-950">
                          Phone{" "}
                          <span className="font-normal text-gray-400">
                            (optional)
                          </span>
                        </span>
                        <input
                          autoComplete="tel"
                          name="phone"
                          type="tel"
                          maxLength={30}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-royal-950 outline-none transition placeholder:text-gray-400 focus:border-embassyGold focus:ring-2 focus:ring-embassyGold/20"
                          placeholder="+27"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-sm font-semibold text-royal-950">
                        How many people are interested?
                      </span>
                      <select
                        name="guests"
                        defaultValue="1"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-royal-950 outline-none transition focus:border-embassyGold focus:ring-2 focus:ring-embassyGold/20"
                      >
                        {[1, 2, 3, 4, 5].map((count) => (
                          <option key={count} value={count}>
                            {count === 5 ? "5 or more" : count}{" "}
                            {count === 1 ? "person" : "people"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-gray-600">
                      <input
                        name="consent"
                        type="checkbox"
                        required
                        className="mt-1 h-4 w-4 shrink-0 accent-[#DEC378]"
                      />
                      <span>
                        I agree that Embassy Tabernacle may contact me about
                        this event. See our{" "}
                        <Link
                          href="/privacy"
                          className="font-semibold text-royal-950 underline decoration-embassyGold underline-offset-2"
                        >
                          Privacy Notice
                        </Link>
                        .
                      </span>
                    </label>
                    <p className="text-xs leading-5 text-gray-500">
                      This is an expression of interest, not a confirmed
                      booking. Your details will be sent to the church team.
                    </p>

                    {registrationFeedback && (
                      <p
                        role="alert"
                        className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                      >
                        {registrationFeedback}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={registrationStatus === "loading"}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-royal-950 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-embassyGold hover:text-royal-950 disabled:cursor-wait disabled:opacity-70"
                    >
                      {registrationStatus === "loading" ? (
                        <LoaderCircle
                          aria-hidden="true"
                          className="h-5 w-5 animate-spin"
                        />
                      ) : (
                        <Check aria-hidden="true" className="h-5 w-5" />
                      )}
                      {registrationStatus === "loading"
                        ? "Sending your interest..."
                        : "Let me know when it’s happening"}
                    </button>
                  </form>
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </Layout>
  );
}
