# Embassy Tabernacle Church Website

A Next.js and Tailwind CSS website for Embassy Tabernacle Church.

## Pages

- Home: `/`
- About Us: `/about-us`
- Events: `/events`
- Giving: `/giving`
- Giving Information: `/giving-help`
- Privacy Notice: `/privacy`
- Sermons: `/sermons`

The Events page displays the current Cloudinary event posters, a separate uncropped Sunday worship poster, progressive pagination, and an event-interest form. Add each new poster to `eventPreviews` in `components/pages/Events.tsx`, and add its ID and confirmed date to `lib/event-dates.ts` and its name to `pages/api/event-registration.ts`. Registration closes automatically after a confirmed event date. Submissions are emailed to `RESEND_TO_EMAIL` (or the default church inbox) using Resend; configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in the deployment environment.

The Giving page uses Paystack for one-time and monthly ZAR donations. Contact form email delivery requires `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.

## Paystack Setup

1. Create a Paystack merchant account, complete its verification, enable ZAR payments, and configure the account's settlement bank details.
2. Copy `.env.example` to `.env.local` for local testing. Set `NEXT_PUBLIC_BASE_URL` to the site's absolute URL, `PAYSTACK_SECRET_KEY` to a Paystack **test** secret key, and `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` for durable donation records. Keep secret keys server-side; never put them in a `NEXT_PUBLIC_` variable, commit them, or share them in chat.
3. Run the site and complete a test donation using Paystack test payment details. The return URL is generated as `${NEXT_PUBLIC_BASE_URL}/giving`.
4. Before accepting real donations, deploy the site on HTTPS, set `NEXT_PUBLIC_BASE_URL` to the exact production origin, and configure `PAYSTACK_SECRET_KEY` in the hosting provider's encrypted environment settings using the live secret key from Paystack. Configure Upstash Redis's production REST URL and token as encrypted server-side variables too. Verified donations are stored in Redis without an expiry and webhook retries are idempotent by transaction reference. Keep Redis persistence/backups enabled and reconcile its records with the Paystack dashboard.
5. In the Paystack dashboard, register `https://your-domain.example/api/paystack-webhook` as the webhook URL and enable the `charge.success` event. The endpoint validates Paystack's signature and the transaction before acknowledging it.
6. Redeploy after setting production variables. Make a small live donation and confirm it appears in the Paystack dashboard and settles to the church's configured account.

Monthly giving creates a Paystack subscription plan and requires a card-supported recurring payment. Transaction verification is performed server-side against Paystack; the site does not store card details. Paystack's dashboard is the source of truth for transactions and subscriptions.

`NEXT_PUBLIC_BASE_URL` and `PAYSTACK_SECRET_KEY` are required for production checkout. Do not use a test key for live donations or a live key during testing.

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.
