# Vervotech Integration Plan

A working plan for replacing Royal Vacation's mock hotel data with real
content — grounded in what Vervotech's API actually provides, what it
doesn't, and the fact that **3 supplier APIs are already in place, with more
planned.**

- **Source**: [docs.vervotech.com](https://docs.vervotech.com/getting-started-1677930m0) — Getting Started
- **Status**: Planning — not started
- **Codebase**: `backend/` + `client/`
- **Suppliers**: 3 confirmed today, more expected — names/details TBD (see open questions)

## 0. The one thing to understand before scoping this

> **Vervotech is a hotel content & mapping API — it does not sell rooms.**
> It gives you clean, deduplicated hotel *content* (name, address, star
> rating, amenities, images, geo-location) and a way to match the same hotel
> across different supplier catalogs. It has no concept of live pricing,
> room availability, or making a booking.

With only one supplier, Vervotech wouldn't earn its keep. **With 3 suppliers
already live — and more coming — this is exactly the situation Vervotech is
built for.** The same physical hotel is very likely listed by more than one
of the 3 suppliers, under different IDs, with different photos, different
amenity lists, maybe different star ratings. Left unmapped, that shows up on
the site as duplicate listings for the same hotel and inconsistent info
between them. Vervotech's job is to tell you which supplier IDs are the same
hotel, and hand back one clean content record to show instead of arbitrarily
picking one supplier's version.

**Booking itself still never goes through Vervotech.** Once a user picks a
specific rate, you book through whichever of the 3 (or more) suppliers
actually owns that rate, using their booking API.

## 1. What the API actually gives you

From the Getting Started docs and module list — and now directly relevant,
since mapping across 3+ suppliers is the actual problem being solved.

| Module | What it returns | Relevant now? |
|---|---|---|
| **Hotel Mapping** | Provider-ID ↔ Vervotech-ID resolution across suppliers, mapping stats, change tracking. | ✅ yes — the core problem with 3 suppliers |
| **Curated Content** | The clean, merged hotel record: name, address, geo-point, star rating, amenities, description, images. | ✅ yes — one listing per hotel instead of 3 |
| **Room Mapping** | Maps room names/attributes and board basis (breakfast, half-board, etc.) so "Deluxe Room" from Supplier A and "Deluxe King" from Supplier B are recognized as the same room. | ✅ yes — needed to merge rate plans per room |
| **Metadata / Master data** | Reference lookups: facility list, chains & brands, property types, countries. | ✅ yes — filters, labels |
| **Location Services** | Location search by ID or polygon (for map-bounds and "search this area"). | ✅ yes — search page map |
| **Provider Content** | Unmapped hotel exports per provider — a data-quality tool for the mapping team, not the storefront. | ⚙️ ops tooling, useful during onboarding of each supplier |
| **Dynamic / Dual Mapping** | Real-time match finding for a single provider hotel ID, rather than a bulk export. | ✅ useful for on-the-fly mapping as new suppliers are added |

## 2. Where the codebase stands today

So the plan below builds on what's real, not what the file tree implies.
This is a correction from the first draft of this doc — the backend has
more infrastructure for this than it first appeared.

- Every property shown on the site — home page carousels, search results,
  the property detail page — comes from static arrays in
  `client/src/lib/mock-data.ts` and `client/src/lib/property-detail-mock-data.ts`.
  Nothing is fetched.
- The backend already has a property model at
  `backend/app/api/routes/properties.py`, but it reads and writes an
  **in-memory list** (`backend/app/db/memory.py`) that resets on every
  restart. The frontend doesn't call it.

### There's already a real provider-credentials system — use it, don't rebuild it

A full admin-managed module for third-party providers already exists,
backed by a real Postgres table, and it's the right home for Vervotech and
the 3 suppliers' credentials — **not** `backend/.env` / `Settings` as the
first draft of this doc said.

- **Table**: `third_party_modules` (`backend/app/models/module.py`). Per
  provider: `provider` (unique slug), `name`, `category`, `status`
  (active/inactive), `environment` (development/staging/production),
  `markup_b2b_type`/`markup_b2b_value`, `markup_b2c_type`/`markup_b2c_value`,
  `tax_type`/`tax_value`, `base_currency`, `credential_schema` (JSONB —
  describes the credential form: key/label/secret/required, no values),
  `credentials_encrypted` (a single Fernet-encrypted `{key: value}` blob),
  `help_text`.
- **Routes**: `backend/app/api/routes/admin/modules.py`, mounted at
  `/api/v1/admin/modules` — **list, get, update only, deliberately no
  create/delete** ("the admin UI has no add/remove-provider flow," per the
  file's own docstring). New providers are added by seeding a row via SQL
  migration, matching `backend/sql/014_third_party_modules.sql`.
- **Admin UI**: already built — `admin/src/app/(dashboard)/modules/page.tsx`
  (list) and `.../modules/[id]/page.tsx` (edit: status, environment,
  markup, tax, credential fields, a "Test connection" button).
- **Already seeded**: 6 demo providers across other categories — Kikoto
  (Ferries), Amadeus (Flights), Viator (Tours), Welcome Pickups
  (Transfers), CarTrawler (Car Rental), SafetyWing (Insurance). None are
  hotel providers yet; Vervotech and the 3 suppliers need their own rows.
- **Encryption helpers**: `app/core/crypto.py` — `encrypt_json(dict)` /
  `decrypt_json(token)`, Fernet-based, keyed by
  `PAYMENT_CREDENTIALS_ENCRYPTION_KEY`. This is what any new integration
  client should call to read its own credentials — never re-implement
  credential storage.

> **Two gaps to know about before building on this:**
> 1. **No live outbound calls exist for any registered provider yet.**
>    Everything in `third_party_modules` today is metadata + encrypted
>    credentials with nothing calling out to a real API — including the
>    existing 6 providers. The "Test connection" button in the admin UI is
>    a **client-side mock** (`admin/src/lib/modules.ts` → `testModuleConnection()`
>    — a `setTimeout` that fabricates a success message, no network call at
>    all). Building Vervotech's client will be the *first* real one.
> 2. **List/get/update only — resolved as "admin-managed."** The goal is
>    self-service provider onboarding through the admin panel (see the new
>    §4 below), so `admin/modules.py` gets `POST`/`DELETE`, mirroring the
>    *already more complete* Payment Gateways module
>    (`app/api/routes/admin/payment_gateways.py`, which has both). This is
>    no longer an open question — it's a prerequisite for the automation
>    goal, not an optional nice-to-have.

> **Flag (still holds)**: no API credentials — Vervotech or any supplier —
> belong in `client/.env.local` or `admin/.env.local`. Those files ship to
> the browser. They belong in `third_party_modules.credentials_encrypted`,
> reached only from backend code.

**The bigger goal: automate this from the admin panel, not just store
credentials in it.** Today `third_party_modules` only holds *who* a
provider is (credentials, markup, tax). It has no concept of *how* to call
that provider's API. Turning "add a provider" into a true no-deploy,
admin-driven action means teaching the system to also store *how to call
it* — see §4 below.

## 4. Admin-driven provider onboarding

The credential storage in `third_party_modules` already exists (§2). What's
missing is teaching it *how* to call a provider's API, not just who they
are — so adding provider #4, #5, #6 becomes a database row filled in from
the browser, not a new Python file every time.

**What "generic" covers.** Most REST/JSON APIs with standard auth (Bearer
token, API-key header, Basic) can be driven entirely by configuration: a
base URL, the search/rates/booking endpoint paths, and a mapping from
"their JSON field" to "our canonical field." Two new pieces make that
config admin-editable:

- `api_config` (JSONB, new column on `third_party_modules`): base URL,
  auth type, and endpoint definitions (method + path) for search, rates,
  and booking.
- `field_mapping` (JSONB): canonical field → JSONPath into that provider's
  response — e.g. `hotel.name` → `$.propertyName`, `ratePlan.price` →
  `$.rate.total`. Walked at request time with a JSONPath library
  (`jsonpath-ng` or similar — a new dependency, not in `requirements.txt`
  today).

**One generic client, not one file per provider.**
`GenericRestSupplierClient` reads a provider's `api_config` +
`field_mapping`, builds the authenticated request, calls the endpoint, and
walks the response into the canonical `Hotel`/`RatePlan` shape. A
`provider_slug → client` registry points most providers at this one class;
only a provider with something the config can't express (custom auth
handshake, XML/SOAP, a multi-step booking flow) gets its own small
subclass file instead — bespoke code stays reserved for what's actually
bespoke.

**Admin UI additions**, on top of the existing provider detail page:
- An **API Configuration** section — base URL, auth type, endpoint paths.
- A **Field Mapping** editor — repeatable rows: canonical field (fixed
  dropdown matching the `Hotel`/`RatePlan` schema) → JSONPath input.
- **"Test connection" becomes "test connection + preview mapping"** — call
  the real search endpoint with sample params, run the field mapping, and
  show the admin a normalized preview *before* they flip the provider to
  active. This is what makes onboarding actually self-service instead of
  "fill in a form and hope."

**The honest limit.** This automates onboarding for providers that fit the
generic REST/JSON shape. A provider with real quirks — a two-step auth
handshake, XML instead of JSON, non-standard pagination — still needs a
developer to write it a dedicated client. The admin panel can still manage
that provider's credentials, status, and markup either way; it just can't
also replace the code for something genuinely non-standard without turning
into a full scripting engine, which isn't worth building for this.

## 5. How the pieces fit with multiple suppliers

The browser never talks to Vervotech or any supplier directly. The backend
maps, aggregates, and normalizes before anything reaches the client.

```
Supplier A          Supplier B          Supplier C          (+ more later)
  │ raw hotel IDs      │ raw hotel IDs      │ raw hotel IDs
  │ content + rates    │ content + rates    │ content + rates
  ▼                    ▼                    ▼
        Vervotech Hotel Mapping (+ Room Mapping)
        resolves: vervotech_id ↔ {supplierA_id, supplierB_id, supplierC_id, …}
                        │
                        ▼
        Postgres — hotels table keyed by vervotech_id
        + a supplier_hotel_ids join table (one row per supplier match)
                        │
        ┌───────────────┴────────────────┐
        ▼                                 ▼
  Display (listing/detail pages)    Search / property view
  Vervotech Curated Content →       Fan out to every supplier mapped
  one clean record per hotel        to that hotel, in parallel, for
  (name, photos, amenities,         live rates → merge into one
  star rating, description)         "rate plans" list per room
                                          │
                                          ▼
                                 User picks a rate plan
                                          │
                                          ▼
                         Book through THAT rate's specific supplier
                         (their booking API, their booking reference
                          stored as source of truth for that reservation)
```

The rate-merging step lines up naturally with the multi-rate-plan room
table already built on the property page — each row (different price,
cancellation policy, breakfast inclusion) can genuinely come from a
*different* supplier for the same physical room, not just a different fare
class from one supplier.

## 6. Implementation roadmap

Written as a developer would actually build it — in dependency order, each
step small enough to land and verify on its own before the next depends on
it. Grouped into seven stages; nothing in a later stage should start before
the stage before it is actually working, not just written.

### Stage A — Foundations (no external calls yet)

1. Add `POST`/`DELETE` to `admin/modules.py`, mirroring
   `admin/payment_gateways.py` — the prerequisite for admin-driven
   onboarding decided in §4, not an open question anymore.
2. Add `api_config` (JSONB) to `third_party_modules` via migration — base
   URL, auth type, and search/rates/booking endpoint definitions.
3. Add `field_mapping` (JSONB) — canonical field → JSONPath into a
   provider's response.
4. Add a JSONPath library (e.g. `jsonpath-ng`) to
   `backend/requirements.txt` — needed to walk `field_mapping` at request
   time.
5. Seed Vervotech + the 3 suppliers as rows (`category = "Hotels Module"`),
   `status = 'inactive'`, `credential_schema` matching each one's real
   auth (Vervotech: `accountId` + `apiKey`, both secret). Leave
   `api_config`/`field_mapping` blank — they get filled in through the
   admin UI in step 11, not hardcoded.
6. Define the canonical, supplier-agnostic schemas the rest of the app
   will speak: `Hotel`, `RoomOption`, `RatePlan`. Don't invent a new
   shape — mirror the TypeScript types already in
   `client/src/lib/property-detail-mock-data.ts`, since that's the
   contract the frontend already expects. Getting this shape right here
   is what lets Stage F be a data swap instead of a component rewrite.
7. Add `backend/app/core/providers.py`:
   `get_provider_credentials(slug: str) -> dict` — looks up a
   `third_party_modules` row, decrypts `credentials_encrypted` via
   `decrypt_json`, returns the plain dict. Every client below calls this
   instead of touching `Settings` or the table directly.
8. Build `backend/app/integrations/base.py` — shared plumbing every client
   needs: pulls credentials via step 7, sets up the `httpx` client
   (already in `requirements.txt`), timeout, retry, logging.
9. Build `backend/app/integrations/generic_rest.py` —
   `GenericRestSupplierClient`, which reads a provider's `api_config` +
   `field_mapping` and does the rest generically: authenticated request →
   call endpoint → walk response via JSONPath → canonical `Hotel`/
   `RatePlan` objects. This is what most of the 3 suppliers should use if
   they're standard REST/JSON.
10. Build `backend/app/integrations/registry.py` —
    `provider_slug -> client`. Generic-shaped providers point at
    `GenericRestSupplierClient` + their config; anything with bespoke auth
    or response shape (Vervotech's mapping API is the likely candidate)
    gets its own small subclass file instead, registered the same way.
11. Admin UI: add an **API Configuration** section (base URL, auth type,
    endpoint paths) and a **Field Mapping** editor (canonical field
    dropdown + JSONPath input, repeatable rows) to the provider detail
    page. Replace the "Test connection" mock in `admin/src/lib/modules.ts`
    with a real backend call that runs the actual request + mapping
    through step 9/10 and returns a normalized preview.
    **Done when:** onboarding one of the 3 "generic-shaped" suppliers is
    achievable entirely from the admin UI — new row, API config, field
    mapping, test-with-preview — with zero new backend code. A provider
    that needs bespoke logic (Vervotech, or any supplier with a real
    quirk) still requires its own client file, and that's an accepted,
    expected exception, not a failure of the design.

### Stage B — Content & mapping pipeline (batch, offline)

12. Pull a full hotel export from each of the 3 suppliers into a
    `raw_supplier_hotels` table (jsonb payload + supplier name + supplier's
    own hotel id) — land the data as-is, don't normalize yet.
13. Feed those exports into Vervotech's Hotel Mapping to get back
    `vervotech_id` groupings across the 3 suppliers.
14. Create the canonical `hotels` table (keyed by `vervotech_id`) and a
    `supplier_hotel_links` join table (`hotel_id`, `supplier`,
    `supplier_hotel_id`).
15. Pull Vervotech Curated Content per `vervotech_id` to populate `hotels`'
    display fields — name, address, geo, star rating, amenities, images,
    description.
16. Write the Alembic migration for `raw_supplier_hotels`, `hotels`,
    `supplier_hotel_links` — `alembic revision --autogenerate` then
    `upgrade head`, per this repo's existing convention.
    **Done when:** a handful of known hotels each appear as exactly *one*
    row in `hotels`, correctly linked to 2–3 supplier IDs, with content
    that's been manually spot-checked against a supplier's own site.

### Stage C — Live rates layer (per-request, real-time)

17. Build `backend/app/services/rates.py`: given `hotel_id` + dates +
    occupancy, look up its `supplier_hotel_links`, and call every linked
    supplier's client (via the step 10 registry) concurrently
    (`asyncio.gather`) with a per-supplier timeout (~5s) so one slow
    supplier can't stall the page.
18. Normalize each supplier's raw response into the canonical `RatePlan`
    shape from step 6 — price, taxes/fees, cancellation terms, perks,
    refundable flag. Use Room Mapping to decide which rooms across
    suppliers are the *same* room, so they group under one `RoomOption`
    instead of listing near-duplicates.
19. **Apply each provider's markup and tax while normalizing** — every row
    in `third_party_modules` already carries `markup_b2b`/`markup_b2c`
    (percentage or flat) and `tax` config per provider. The price shown to
    a user should be the supplier's raw rate run through *that supplier's*
    configured markup + tax, not the raw wholesale price — this business
    logic already has a home, it just hasn't been connected to anything
    live yet.
20. Handle partial failure explicitly: if 1 of 3 suppliers errors or times
    out, still return the other 2's rates (log the failure, don't 500 the
    whole request).
21. Add a short-lived cache (30–120s) on the merged result, keyed by
    `(hotel_id, dates, occupancy)` — live supplier calls are the most
    rate-limited, most expensive part of this system.
22. Expose `GET /api/v1/properties/{id}/rates` returning the merged
    rate-plan list, shaped to match `RoomOption`/`RatePlan` exactly.
    **Done when:** hitting this endpoint for a known multi-supplier hotel
    returns one merged room list with rate plans correctly attributed to
    their source supplier, marked-up and taxed per that supplier's admin
    config.

### Stage D — Booking

23. Design a `bookings` table: internal id, `hotel_id`, `supplier`,
    `supplier_booking_reference`, guest info, the rate snapshot locked in
    at booking time, status.
24. Implement a "recheck rate" call — right before payment, re-confirm
    price/availability with the specific supplier that owns the selected
    rate. Most suppliers require this and will reject a stale booking
    otherwise.
25. Implement one `book()` method per client behind a single interface
    (`book(hotel_id, rate_id, guest_info) -> BookingResult`) — generic
    providers can often express booking as one more `api_config` endpoint;
    bespoke providers implement it directly in their own client file.
26. On success: persist to `bookings`, hand off to the existing payment
    capture flow (`payment_credentials_encryption_key` pattern already in
    `config.py`), send confirmation.
27. On failure or rate mismatch: surface "price changed" / "no longer
    available" back to checkout — never silently charge the stale price.
    **Done when:** a real sandbox booking round-trips end to end against
    at least one supplier, with a second test that deliberately triggers
    a rate mismatch and confirms the user sees it, not a charge.

### Stage E — Sync & freshness

28. Scheduled job (or Vervotech webhook receiver, since their docs mention
    content-update notifications) to re-pull Curated Content periodically
    so listings don't silently go stale.
29. Decide and implement a re-sync cadence for Hotel Mapping itself, so
    new hotels each supplier adds actually show up over time.

### Stage F — Frontend cutover

30. Add `properties.list()`, `properties.get(id)`,
    `properties.getRates(id, params)` to `client/src/lib/api.ts`, typed
    against the same shapes from step 6.
31. Swap the home page (`HomeContent`) first — lowest risk, no booking
    flow attached.
32. Swap the search page next. This is where multi-supplier latency shows
    up most: don't live-rate every result in a 600-hotel list — show a
    cached "from" price for the list, and fetch live rates only for the
    hotel a user actually opens.
33. Swap the property detail page + availability section last — this is
    where the rate-plan table connects to the recheck-and-booking flow
    from Stage D.
34. Keep the mock-data files behind a feature flag / env toggle during
    rollout, so a supplier or Vervotech outage has an instant fallback
    rather than taking the site down.

### Stage G — Operational readiness

35. Log every outbound integration call with latency and status, so a
    slow or flaky supplier is visible, not just inferred from complaints.
36. Respect each integration's documented rate limits with backoff —
    Vervotech and each of the 3 suppliers will have their own.
37. Decide explicitly what "a supplier is down" looks like on the site:
    recommend hiding that supplier's rates rather than showing a price
    that might no longer be honored.

## 7. Open questions

Can't be planned around — need an answer to scope the work honestly.

- **Which 3 suppliers, specifically?** Names determine auth style, rate
  limits, and — now that onboarding is meant to be config-driven —
  whether each one actually fits the generic REST/JSON client or needs
  its own bespoke code.
- **Which of the 3 (and Vervotech) are "generic-shaped"?** Concretely:
  standard REST + JSON + Bearer/API-key/Basic auth = generic client, no
  new code. Custom auth handshake, XML/SOAP, or a multi-step booking flow
  = a dedicated file. Worth a quick pass over each provider's real docs
  before assuming all 3 fit the generic path.
- **How much catalog overlap is expected between them?** Heavy overlap
  makes mapping urgent immediately; light overlap means mapping mostly
  matters for the *next* supplier added, not these 3.
- **When two suppliers disagree on content for the same mapped hotel**
  (different star rating, different photos, different address
  formatting) — does Vervotech's Curated Content resolve that
  automatically, or does Royal Vacation need a tie-breaking rule?
- **Do we have sandbox credentials for all 3 suppliers and Vervotech
  yet?** Stages A–C all need live access to build and test against.
- **Which page goes live first?** Home page carousels are still the
  lowest-risk place to prove the merged pipeline before touching search
  or the booking-adjacent property page.
