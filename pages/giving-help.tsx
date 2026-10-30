import Link from "next/link";
import Layout from "../components/Layout";

const contactEmail = "embassy.tabernacle@gmail.com";

export default function GivingHelp() {
  return (
    <Layout>
      <main className="min-h-screen bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-glow sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-embassyGold">
            Donations and payments
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-royal-950 sm:text-5xl">
            Giving Information
          </h1>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            Thank you for supporting Embassy Tabernacle. This page explains how
            online giving works and how to get help with a payment.
          </p>

          <div className="mt-10 space-y-9 text-base leading-7 text-gray-700">
            <section>
              <h2 className="font-serif text-2xl font-bold text-royal-950">
                Voluntary giving
              </h2>
              <p className="mt-3">
                Giving is voluntary. One-time gifts and monthly giving are
                processed through Paystack. Monthly giving creates recurring
                card payments. Paystack handles payment details on its secure
                checkout page. The church does not handle or store your card
                details.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-royal-950">
                Cancel monthly giving
              </h2>
              <p className="mt-3">
                To ask the church to cancel monthly giving, email{" "}
                <a
                  href={`mailto:${contactEmail}?subject=Monthly%20giving%20cancellation`}
                  className="font-semibold text-royal-950 underline decoration-embassyGold underline-offset-4 hover:text-embassyGold"
                >
                  {contactEmail}
                </a>{" "}
                before your next scheduled payment. We will confirm when the
                request has been handled. If you have a Paystack subscription
                management option available through your payment confirmation,
                you may also use that option.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-royal-950">
                Mistaken or duplicate payments
              </h2>
              <p className="mt-3">
                If you believe a payment was made by mistake or charged more
                than once, email the church with your Paystack transaction
                reference. Do not include card details. We will review the
                payment and explain the options available. Refunds are not
                automatic. The outcome depends on the circumstances, applicable
                requirements and Paystack’s process.
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200 pt-6">
            <Link
              href="/giving"
              className="inline-flex rounded-full bg-royal-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-embassyGold hover:text-royal-950"
            >
              Return to Giving
            </Link>
            <Link
              href="/privacy"
              className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-royal-950 transition hover:border-embassyGold hover:text-embassyGold"
            >
              Privacy Notice
            </Link>
          </div>
        </article>
      </main>
    </Layout>
  );
}
