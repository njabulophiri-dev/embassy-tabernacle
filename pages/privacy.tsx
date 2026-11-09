import Link from "next/link";
import Layout from "../components/Layout";

const contactEmail = "embassy.tabernacle@gmail.com";

export default function Privacy() {
  return (
    <Layout>
      <main className="min-h-screen bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-glow sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-embassyGold">
            Your information
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-royal-950 sm:text-5xl">
            Privacy Notice
          </h1>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            Embassy Tabernacle respects your privacy. This notice explains how
            information submitted through this website is used and who may
            process it.
          </p>

          <div className="mt-10 space-y-9 text-base leading-7 text-gray-700">
            <section>
              <h2 className="font-serif text-2xl font-bold text-royal-950">
                Information you provide
              </h2>
              <p className="mt-3">
                When you contact us or plan a visit, we receive your name, email
                address and message. Event interest forms ask for your name,
                email address, an optional phone number, the event you selected
                and the number of people interested. The form also records your
                consent for the church to contact you about that event.
              </p>
              <p className="mt-3">
                If you make a gift, the giving form sends your email address,
                selected amount and giving frequency to Paystack to start
                checkout. Paystack processes the payment details on its
                checkout page. Do not send card details through this website or
                by email.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-royal-950">
                How we use information
              </h2>
              <p className="mt-3">
                We use submitted information to reply to enquiries, follow up
                about an event you selected, process and verify giving
                transactions and protect the website from misuse. We do not
                use event interest details to confirm a booking.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-royal-950">
                Service providers
              </h2>
              <p className="mt-3">
                We use service providers to operate the website and deliver its
                features. Resend sends visit enquiries and event interest
                submissions to the church inbox. Paystack processes donations
                and provides payment confirmation. Our hosting provider serves
                the website and may process technical information needed for
                operation and security. These providers handle information
                under their own privacy terms.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-royal-950">
                Storage and retention
              </h2>
              <p className="mt-3">
                This website does not maintain a database of form submissions
                or its own donation ledger. Enquiries and event interest
                submissions are delivered to the church by email. The church
                and its email provider may retain those messages for as long as
                needed to respond, manage church activities and meet legal
                obligations. Paystack keeps its own transaction and
                subscription records according to its processes and terms.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-royal-950">
                Your choices and privacy rights
              </h2>
              <p className="mt-3">
                You may contact us to ask for access to your personal
                information. You may request a correction or deletion. You may
                also withdraw consent for future event contact. We may need to
                keep some information where the law requires it. Requests are
                handled under applicable privacy law, including South Africa’s
                Protection of Personal Information Act (POPIA).
              </p>
              <p className="mt-3">
                If you have a concern about how your information is handled,
                contact the church first. You may also contact the Information
                Regulator of South Africa through its{" "}
                <a
                  href="https://inforegulator.org.za/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-royal-950 underline decoration-embassyGold underline-offset-4 hover:text-embassyGold"
                >
                  official website
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-royal-950">
                Contact us
              </h2>
              <p className="mt-3">
                For privacy questions or requests, email{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-semibold text-royal-950 underline decoration-embassyGold underline-offset-4 hover:text-embassyGold"
                >
                  {contactEmail}
                </a>
                .
              </p>
            </section>

            <p className="border-t border-slate-200 pt-6 text-sm text-gray-500">
              This notice describes the current website. Please contact the
              church if you need more information about a particular request or
              transaction. See our{" "}
              <Link
                href="/giving-help"
                className="font-semibold text-royal-950 underline decoration-embassyGold underline-offset-4 hover:text-embassyGold"
              >
                giving information
              </Link>
              .
            </p>
          </div>
        </article>
      </main>
    </Layout>
  );
}
