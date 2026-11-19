# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally:

- **Clients**: founders and business owners deciding whether to hire Hamza to build a product end to end (a pharmacy platform, a shop POS, a monitoring system).
- **Employers**: hiring managers, recruiters and tech leads evaluating Hamza for a full-stack + AI engineering role, remote or local.

Both arrive from a link (CV, LinkedIn, proposal, GitHub) and decide within minutes whether to reach out.

## Product Purpose

Personal portfolio of Hamza Munawar, Full-Stack & AI Engineer (Islamabad, Pakistan). It shows shipped work, skills (including LLM/AI product skills), writing, and a way to get in touch. Success: a qualified client or employer starts a conversation.

## Positioning

Ships real products end to end. The work on show is built, tested, deployed and in use, not demos: a live UK pharmacy platform, an offline-first Urdu/English POS with signed licensing, a monitoring system. The site should prove this with specifics a template portfolio could not copy.

## Operating Context

- Public SPA (React + Vite + Tailwind) with a Supabase backend; admin CMS edits projects, profile and blog posts.
- Deployed on Cloudflare Workers static assets (`npm run deploy` in `frontend/`).
- Light and dark themes.

## Capabilities and Constraints

- Admin CMS and markdown blog must keep working.
- Light and dark themes must both remain.
- AI skills are presented with an LLM-product focus (RAG, embeddings, agents, OpenAI/Claude APIs); AI-assisted engineering workflow is a secondary note.
- The "AI Knowledge Assistant" project stays.

## Brand Commitments

- Name: Hamza Munawar. Role line: Full-Stack & AI Engineer.
- Modern studio-portfolio look (reference: Framer / Awwwards dev portfolios). A Pakistani truck-art direction was built and rejected as "backward" on 2026-11-19; the Apple-style restraint before it was too plain.
- No Pakistan-themed framing: no Urdu lines, truck or road metaphors (user rejected "Honk to pass", "Ustad's rules", "The fleet" on 2026-11-19). Facts about Pakistani customers (Asaan Dukaan) stay as plain product description.

## Evidence on Hand

- **Drop In** (drop-in.co.uk, client work, may be named and linked): UK pharmacy e-commerce, doctor and pharmacy booking, clinical consultations and prescriptions, admin CMS. React 19, NestJS 11, Prisma, PostgreSQL, Stripe. 128 commits, 83 test files, CI.
- **Asaan Dukaan + Asaan Licensing**: offline-first POS for small Pakistani shops (mobile-phone shops first), English + Urdu RTL. Electron, React 19, TypeScript, SQLite, 25 server modules (sales, IMEI stock, khata credit ledgers, repairs, buy-back), money in integer paisa, idempotent writes, audit log, Ed25519-signed licences minted by a companion offline app and sent by WhatsApp. 367 + 32 commits, 154 + 11 spec files.
- **MediPoint** (in progress): offline-first pharmacy/distributor POS, Angular 21 + Electron, architecture-first with enforced layering tests.
- **Agrius Pulse** (agriuspulse.com; employer product at Agrius IT / Code Agrius, proprietary: describe at product level only, no internals, IPs or tenant names): multi-tenant infrastructure monitoring for MSPs. Go, React 19, PostgreSQL, VictoriaMetrics, Keycloak. 733 commits, 461 Go test files.
- AI-assisted engineering: about 1,190 commits across these repos carry a Claude co-author trailer; spec-first plans, custom skills and review agents.
- Existing projects in `frontend/src/utils/fallbackData.js` (Oreius, Bitcyllionaire, TheABFoods, Bitcy Club, Enterprise ERP, AI Knowledge Assistant).
- Absent: testimonials, client logos, metrics beyond those above. Do not invent them.

## Product Principles

1. Proof over adjectives: every claim points at a shipped thing, a number, or the work itself.
2. Two audiences, one story: the same evidence serves a client's "can he build my product" and an employer's "can he engineer".
3. Personality is earned by specifics: the site feels like Hamza because it shows how he thinks (offline-first, money in paisa, signed licences), not because of decoration.
4. Never publish client secrets: no IPs, specs, pricing, proposals or go-to-market details.
