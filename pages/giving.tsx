import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Layout from "../components/Layout";

const presetAmounts = [25, 50, 100, 250, 500];

const frequencyOptions = [
  { label: "One-time", value: "one_time" },
  { label: "Monthly", value: "monthly" },
] as const;

type Frequency = (typeof frequencyOptions)[number]["value"];

type PaymentState = "idle" | "processing" | "success" | "failed";

type VerificationResult = {
  success?: boolean;
  status?: string;
  message?: string;
  reference?: string;
  amount?: number;
  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
  };
};

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100_000;

const formatCurrency = (value: number) =>
  `R${value.toLocaleString("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export default function Giving() {
  const router = useRouter();

  const [amount, setAmount] = useState(100);
  const [frequency, setFrequency] = useState<Frequency>("one_time");

  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [paymentState, setPaymentState] = useState<PaymentState>("idle");

  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const [verifiedAmount, setVerifiedAmount] = useState<number | null>(null);

  /*
   * ---------------------------------------------------------
   * VERIFY PAYSTACK CALLBACK
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!router.isReady) return;

    const trxref =
      typeof router.query.trxref === "string" ? router.query.trxref : null;

    const reference =
      typeof router.query.reference === "string"
        ? router.query.reference
        : null;

    const referenceToVerify = reference || trxref;

    if (!referenceToVerify) {
      return;
    }

    let cancelled = false;

    const verifyPayment = async () => {
      setPaymentState("processing");
      setError(null);
      setPaymentReference(referenceToVerify);

      try {
        const response = await fetch(
          `/api/verify-payment?reference=${encodeURIComponent(
            referenceToVerify,
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const body: VerificationResult = await response.json();

        if (!response.ok) {
          throw new Error(body.message || "Unable to verify the payment.");
        }

        const transactionStatus = body.data?.status || body.status;
        const amountInSubunit = body.data?.amount ?? body.amount;
        const paymentSucceeded =
          body.success === true &&
          transactionStatus === "success" &&
          body.data?.reference === referenceToVerify &&
          body.data.currency === "ZAR" &&
          typeof amountInSubunit === "number" &&
          Number.isSafeInteger(amountInSubunit) &&
          amountInSubunit > 0;

        if (!paymentSucceeded) {
          if (!cancelled) {
            setPaymentState("failed");

            setError(
              "The payment was not completed. No successful giving was recorded.",
            );
          }

          return;
        }

        if (!cancelled) {
          setPaymentState("success");
          setVerifiedAmount(amountInSubunit / 100);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Payment verification error:", err);

          setPaymentState("failed");

          setError(
            err instanceof Error
              ? err.message
              : "We could not verify your payment.",
          );
        }
      } finally {
        /*
         * Remove:
         *
         * ?trxref=XXXX&reference=XXXX
         *
         * from the browser URL.
         */
        if (!cancelled) {
          await router.replace("/giving", undefined, {
            shallow: true,
          });
        }
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, router.query.trxref, router.query.reference]);

  /*
   * ---------------------------------------------------------
   * VALIDATE AMOUNT
   * ---------------------------------------------------------
   */
  const validateAmount = () => {
    if (!Number.isFinite(amount)) {
      return "Please enter a valid amount.";
    }

    if (amount < MIN_AMOUNT) {
      return `The minimum giving amount is ${formatCurrency(MIN_AMOUNT)}.`;
    }

    if (amount > MAX_AMOUNT) {
      return `The maximum giving amount is ${formatCurrency(MAX_AMOUNT)}.`;
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * VALIDATE EMAIL
   * ---------------------------------------------------------
   */
  const validateEmail = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return "Please enter your email address.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * CREATE PAYSTACK CHECKOUT
   * ---------------------------------------------------------
   */
  const createSession = async () => {
    const amountError = validateAmount();

    if (amountError) {
      setError(amountError);
      return;
    }

    const emailError = validateEmail();

    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCheckoutUrl(null);
    setPaymentState("idle");
    const checkoutWindow = window.open("about:blank", "_blank");

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          amount,
          frequency,
          email: email.trim().toLowerCase(),
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body.error || "Unable to create the Paystack checkout.",
        );
      }

      let paystackUrl: URL;

      try {
        paystackUrl = new URL(body.url);
      } catch {
        throw new Error("Paystack did not return a valid checkout URL.");
      }

      if (
        paystackUrl.protocol !== "https:" ||
        (paystackUrl.hostname !== "paystack.com" &&
          !paystackUrl.hostname.endsWith(".paystack.com"))
      ) {
        throw new Error("Paystack did not return a checkout URL.");
      }

      setCheckoutUrl(paystackUrl.toString());

      if (checkoutWindow) {
        checkoutWindow.opener = null;
        checkoutWindow.location.href = paystackUrl.toString();
      } else {
        window.location.assign(paystackUrl.toString());
      }
    } catch (err) {
      checkoutWindow?.close();
      console.error("Checkout error:", err);

      setError(err instanceof Error ? err.message : "Unable to start payment.");
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * SUCCESS SCREEN
   * ---------------------------------------------------------
   */
  if (paymentState === "success") {
    const displayAmount = verifiedAmount !== null ? verifiedAmount : amount;

    return (
      <Layout>
        <main className="min-h-screen bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl bg-royal-950 p-10 text-center text-white shadow-2xl sm:p-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brightGold text-royal-950">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="h-10 w-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 12 4 4L19 6"
                  />
                </svg>
              </div>

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-brightGold">
                Thank You
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Your giving was received.
              </h1>

              <p className="mt-6 text-lg text-white/75">
                Thank you for your{" "}
                <span className="font-bold text-white">
                  {formatCurrency(displayAmount)}
                </span>{" "}
                offering.
              </p>

              {paymentReference && (
                <p className="mt-6 text-sm text-white/50">
                  Reference: {paymentReference}
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setPaymentState("idle");
                  setPaymentReference(null);
                  setVerifiedAmount(null);
                  setCheckoutUrl(null);
                  setError(null);
                }}
                className="mt-8 rounded-2xl bg-brightGold px-7 py-4 text-sm font-semibold text-royal-950 transition hover:bg-white"
              >
                Make another gift
              </button>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  /*
   * ---------------------------------------------------------
   * FAILED PAYMENT
   * ---------------------------------------------------------
   */
  if (paymentState === "failed") {
    return (
      <Layout>
        <main className="min-h-screen bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl bg-royal-950 p-10 text-center text-white shadow-2xl sm:p-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-10 w-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-red-300">
                Payment not completed
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Your giving was not received.
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg text-white/75">
                {error ||
                  "The payment was unsuccessful or was cancelled. No successful giving was recorded."}
              </p>

              {paymentReference && (
                <p className="mt-6 text-sm text-white/50">
                  Reference: {paymentReference}
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setPaymentState("idle");
                  setPaymentReference(null);
                  setVerifiedAmount(null);
                  setError(null);
                }}
                className="mt-8 rounded-2xl bg-brightGold px-7 py-4 text-sm font-semibold text-royal-950 transition hover:bg-white"
              >
                Try again
              </button>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  /*
   * ---------------------------------------------------------
   * VERIFYING PAYMENT
   * ---------------------------------------------------------
   */
  if (paymentState === "processing") {
    return (
      <Layout>
        <main className="min-h-screen bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl bg-royal-950 p-10 text-center text-white shadow-2xl sm:p-16">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-brightGold" />

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-brightGold">
                Verifying payment
              </p>

              <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                Please wait...
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-white/70">
                We are securely confirming your transaction with Paystack.
                Please do not close this page.
              </p>

              {paymentReference && (
                <p className="mt-6 text-sm text-white/40">
                  Reference: {paymentReference}
                </p>
              )}
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  /*
   * ---------------------------------------------------------
   * NORMAL GIVING PAGE
   * ---------------------------------------------------------
   */
  return (
    <Layout>
      <main className="min-h-screen bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-slate-200 bg-royal-950/95 p-10 text-white shadow-2xl shadow-black/10 sm:p-12">
            <div className="mb-10 sm:flex sm:items-end sm:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brightGold">
                  Giving with confidence
                </p>

                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                  Support the mission with secure online giving.
                </h1>

                <p className="mt-4 text-lg text-white/75 sm:text-xl">
                  One-time gifts, automated monthly giving and fast, secure
                  mobile payments.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="space-y-8 rounded-3xl bg-white/5 p-8">
                {/* EMAIL */}
                <div className="rounded-3xl bg-white/10 p-6">
                  <label
                    htmlFor="donor-email"
                    className="block text-sm font-semibold text-white/80"
                  >
                    Email address
                  </label>

                  <p className="mt-1 text-sm text-white/50">
                    We’ll use this email for your payment receipt.
                  </p>

                  <input
                    id="donor-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError(null);
                    }}
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-royal-950/80 px-4 py-3 text-white outline-none placeholder:text-white/30 transition focus:border-brightGold"
                  />
                </div>

                {/* AMOUNT + FREQUENCY */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* AMOUNT */}
                  <div className="space-y-4 rounded-3xl bg-white/10 p-6">
                    <h2 className="text-xl font-semibold">Choose an amount</h2>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {presetAmounts.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setAmount(value);
                            setError(null);
                          }}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            amount === value
                              ? "border-brightGold bg-brightGold/10 text-white"
                              : "border-white/10 bg-white/5 text-white/80 hover:border-brightGold hover:bg-white/10"
                          }`}
                        >
                          {formatCurrency(value)}
                        </button>
                      ))}
                    </div>

                    <label className="block text-sm font-semibold text-white/80">
                      Custom amount (R)
                      <input
                        type="number"
                        min={MIN_AMOUNT}
                        max={MAX_AMOUNT}
                        step="1"
                        inputMode="numeric"
                        value={amount}
                        onChange={(event) => {
                          const value = Number(event.target.value);

                          setAmount(Number.isFinite(value) ? value : 0);

                          setError(null);
                        }}
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-royal-950/80 px-4 py-3 text-white outline-none transition focus:border-brightGold"
                      />
                    </label>

                    <p className="text-xs text-white/40">
                      Minimum {formatCurrency(MIN_AMOUNT)}.
                    </p>
                  </div>

                  {/* FREQUENCY */}
                  <div className="space-y-4 rounded-3xl bg-white/10 p-6">
                    <h2 className="text-xl font-semibold">Recurring giving</h2>

                    <p className="text-sm text-white/70">
                      Choose monthly giving for automated recurring support. You
                      can use any custom amount you prefer.
                    </p>

                    <div className="grid gap-3">
                      {frequencyOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFrequency(option.value);
                            setError(null);
                          }}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            frequency === option.value
                              ? "border-brightGold bg-brightGold/10 text-white"
                              : "border-white/10 bg-white/5 text-white/80 hover:border-brightGold hover:bg-white/10"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {frequency === "monthly" && (
                      <div className="rounded-2xl border border-brightGold/30 bg-brightGold/5 p-4">
                        <p className="text-sm text-white/80">Monthly giving:</p>

                        <p className="mt-1 text-2xl font-bold text-brightGold">
                          {formatCurrency(amount)}

                          <span className="text-sm font-normal text-white/60">
                            {" "}
                            / month
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SELECTED GIFT */}
                <div className="space-y-6 rounded-3xl border border-white/10 bg-black/10 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-base font-semibold text-white/80">
                      Selected gift
                    </p>

                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(amount)}

                      {frequency === "monthly" && (
                        <span className="ml-1 text-sm font-normal text-white/60">
                          / month
                        </span>
                      )}
                    </p>
                  </div>

                  <p className="text-sm text-white/70">
                    You are supporting the church family with a{" "}
                    {frequency === "monthly" ? "monthly recurring" : "one-time"}{" "}
                    offering.
                  </p>

                  {error && (
                    <p className="rounded-2xl bg-red-600/10 p-3 text-sm text-red-200">
                      {error}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={createSession}
                    disabled={isLoading}
                    className="inline-flex w-full justify-center rounded-2xl bg-brightGold px-6 py-4 text-sm font-semibold text-royal-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading
                      ? "Preparing secure checkout…"
                      : frequency === "monthly"
                        ? "Start Monthly Giving"
                        : "Give Securely"}
                  </button>
                </div>
              </section>

              {/* RIGHT COLUMN */}
              <aside className="space-y-8 rounded-3xl bg-white/5 p-8">
                {/* QR */}
                <div className="space-y-4 rounded-3xl bg-white/10 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-brightGold">
                    Scan to pay
                  </p>

                  <p className="text-white/80">
                    Open the secure Paystack checkout on your phone or scan the
                    QR code after the checkout link has been created.
                  </p>

                  {checkoutUrl ? (
                    <div className="rounded-3xl bg-white p-4 text-center">
                      <img
                        alt="Giving QR code"
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                          checkoutUrl,
                        )}`}
                        className="mx-auto"
                      />

                      <p className="mt-4 text-sm text-slate-600">
                        Scan this code to complete your offering on mobile.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-white/5 p-4 text-white/70">
                      Your checkout QR code will appear here after you choose an
                      amount and press Give Securely.
                    </div>
                  )}
                </div>

                {/* ACCEPTED */}
                <div className="space-y-4 rounded-3xl bg-white/10 p-6 text-white/80">
                  <p className="text-sm uppercase tracking-[0.25em] text-brightGold">
                    What we accept
                  </p>

                  <ul className="space-y-3 text-sm leading-7">
                    <li>Credit / debit cards</li>
                    <li>Supported Paystack payment methods</li>
                    <li>Secure online checkout</li>
                    <li>Recurring monthly giving</li>
                  </ul>
                </div>

                {/* SECURITY */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-brightGold">
                    Paystack powered
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Your payment is processed securely by Paystack. Embassy
                    Tabernacle does not handle or store your card details.
                  </p>
                </div>
              </aside>
            </div>

            <Link
              href="/giving-help"
              className="mt-8 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-brightGold hover:text-brightGold"
            >
              Giving and payment help
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
