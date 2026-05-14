# BIZNESJON — Texnik Spetsifikatsiya

> *Tadbirkorlar uchun bepul professional ta'lim platformasining to'liq texnik hujjati*

| | |
|---|---|
| **Versiya** | 2.0 (Final) |
| **Sana** | 2026 |
| **Holat** | Implementatsiya uchun tasdiqlangan |
| **Maqsad** | Ishlab chiqish jamoasi uchun yagona haqiqat manbai |
| **Bog'liq hujjat** | `tz.md` v2.0 — biznes/funksional spetsifikatsiya |

---

## Mundarija

1. [Hujjat haqida](#1-hujjat-haqida)
2. [Texnik talablar va cheklovlar](#2-texnik-talablar-va-cheklovlar)
3. [Tizim arxitekturasi](#3-tizim-arxitekturasi)
4. [Texnologiyalar to'plami](#4-texnologiyalar-toplami)
5. [Frontend arxitekturasi](#5-frontend-arxitekturasi)
6. [Backend arxitekturasi](#6-backend-arxitekturasi)
7. [Ma'lumotlar bazasi](#7-malumotlar-bazasi)
8. [API spetsifikatsiyasi](#8-api-spetsifikatsiyasi)
9. [Autentifikatsiya va xavfsizlik](#9-autentifikatsiya-va-xavfsizlik)
10. [Video infratuzilmasi](#10-video-infratuzilmasi)
11. [Real-time tizim](#11-real-time-tizim)
12. [Fayl saqlash strategiyasi](#12-fayl-saqlash-strategiyasi)
13. [Bildirishnomalar tizimi](#13-bildirishnomalar-tizimi)
14. [Qidiruv va filtratsiya](#14-qidiruv-va-filtratsiya)
15. [Lokalizatsiya (i18n)](#15-lokalizatsiya-i18n)
16. [PWA imkoniyatlari](#16-pwa-imkoniyatlari)
17. ["Mening saytim" tizimi (PromoVideo)](#17-mening-saytim-tizimi)
18. [Admin panel](#18-admin-panel)
19. [Server konfiguratsiyasi](#19-server-konfiguratsiyasi)
20. [DevOps va deployment](#20-devops-va-deployment)
21. [Kuzatuv va Observability](#21-kuzatuv-va-observability)
22. [Backup va falokat tiklash](#22-backup-va-falokat-tiklash)
23. [Skalalash strategiyasi](#23-skalalash-strategiyasi)
24. [Xavfsizlik checklist](#24-xavfsizlik-checklist)
25. [Yetkazib berish strategiyasi (To'liq professional)](#25-yetkazib-berish-strategiyasi--toliq-professional-bir-martada)
26. [Ochiq savollar](#26-ochiq-savollar)
27. [Atamalar lug'ati](#27-atamalar-lugati)

---

## 1. Hujjat haqida

### 1.1. Maqsad

Ushbu hujjat **Biznesjon** platformasini noldan yaratish uchun to'liq texnik spetsifikatsiyani belgilaydi. U dasturchilar, DevOps muhandislari, sifat nazorati va mahsulot menejerlari uchun yagona haqiqat manbai (single source of truth) bo'lib xizmat qiladi.

### 1.2. Hujjat tamoyillari

- **Aniqlik** — har bir qaror sababli va o'lchovli
- **To'liqlik** — ishlab chiqish boshlanguncha hech qanday ochiq texnik savol qolmaydi
- **Texnik etuklik** — qarorlar enterprise standartlariga muvofiq
- **Pragmatizm** — hozirgi miqyosga mos, kelajakka tayyor

### 1.3. Bog'liq hujjatlar

| Hujjat | Vazifasi |
|--------|----------|
| `Biznesjon — Loyiha Hujjati` (biznes spetsifikatsiya) | Funksional talablar, biznes mantiq |
| `texnik.md` (mazkur hujjat) | Texnik arxitektura va implementatsiya |
| `RUNBOOK.md` (kelajakda) | Operatsion protseduralar |
| `SECURITY.md` (kelajakda) | Xavfsizlik siyosati va incident response |

> **Ziddiyat siyosati:** Mazkur hujjat texnik qarorlarda ustun. Funksional ziddiyat bo'lsa — biznes hujjati ustun.

---

## 2. Texnik talablar va cheklovlar

### 2.1. Tasdiqlangan asosiy qarorlar

| Soha | Qaror | Asos |
|------|-------|------|
| **Klient platformasi** | Web + PWA (installable) | Bitta kod bazasi, store talab qilmaydi, tezkor iteratsiya |
| **Server** | Contabo VPS (Germaniya) | Narx/sifat optimal, NVMe SSD, katta hajm |
| **Video saqlash** | VPS lokal fayl tizimi | Qo'shimcha xizmat xarajatlarisiz |
| **Stack** | TypeScript (Frontend + Backend) | Bir til, kam xato, qayta foydalanish |
| **Daromad** | Bepul, reklama yo'q | Biznes qaror |

### 2.2. Funksional bo'lmagan talablar (NFR)

| Atribut | Maqsad | O'lchov |
|---------|--------|---------|
| **Mavjudlik (Availability)** | 99.5% | Oyiga ≤ 3.6 soat downtime |
| **API javob vaqti** | p95 < 300ms | Synthetic monitoring |
| **Sahifa yuklanish** | LCP < 2.5s (4G), < 1s (Wi-Fi) | Lighthouse, Real User Monitoring |
| **Video boshlanish** | < 3s (HLS ABR) | Player events |
| **Bir vaqtdagi userlar (MVP)** | 500 | Yuk testi (k6) |
| **6 oydan keyin** | 5,000 | Kapasitet rejasi |
| **2 yildan keyin** | 20,000 | Skalalash chegarasi |
| **RPO** (max ma'lumot yo'qotish) | 24 soat | Kunlik backup |
| **RTO** (tiklanish vaqti) | 4 soat | Backup → restore protsedurasi |
| **Xavfsizlik** | OWASP Top 10 muvofiqlik | Yillik audit |
| **A11y** | WCAG 2.1 AA | axe-core CI'da |

### 2.3. Texnik cheklovlar

| Cheklov | Yumshatish strategiyasi |
|---------|-------------------------|
| Bitta VPS (single point of failure) | Tashqi backup + DR runbook + monitoring |
| Yevropa lokatsiyasi (~120ms UZ'dan) | Cloudflare CDN + Edge cache + asset optimizatsiya |
| Native ilova yo'q | PWA: install, offline, push, splash |
| Cheklangan operatsion jamoa | Strukturalangan kod, avto deploy, monitoring |

### 2.4. Browser qo'llab-quvvatlash

| Browser | Min versiya |
|---------|-------------|
| Chrome / Edge | 110 |
| Safari (iOS) | 16.4 (Web Push uchun shart) |
| Firefox | 110 |
| Samsung Internet | 21 |

> **Eslatma:** iOS 16.3 va undan past — push notification qo'llab-quvvatlanmaydi. Foydalanuvchiga ogohlantirish ko'rsatiladi.

---

## 3. Tizim arxitekturasi

### 3.1. Yuqori darajadagi diagramma

```
                           ┌────────────────────────┐
                           │      FOYDALANUVCHI     │
                           │  (Web/PWA — Telefon    │
                           │   yoki Desktop)        │
                           └───────────┬────────────┘
                                       │ HTTPS / WSS
                                       ▼
                           ┌────────────────────────┐
                           │    CLOUDFLARE EDGE     │
                           │  • DDoS himoya         │
                           │  • WAF                 │
                           │  • CDN cache (HLS)     │
                           │  • SSL terminate       │
                           └───────────┬────────────┘
                                       │
                                       ▼
        ╔═══════════════════════════════════════════════════════╗
        ║              CONTABO VPS (Germaniya)                  ║
        ║                                                       ║
        ║   ┌─────────────────────────────────────────────┐    ║
        ║   │                NGINX                        │    ║
        ║   │  • Reverse proxy  • Rate limit              │    ║
        ║   │  • TLS 1.3        • Static file serving     │    ║
        ║   └──┬────────────────┬──────────────┬──────────┘    ║
        ║      │                │              │                ║
        ║      ▼                ▼              ▼                ║
        ║  ┌────────┐      ┌─────────┐   ┌───────────┐         ║
        ║  │Next.js │      │ NestJS  │   │ Socket.io │         ║
        ║  │  SSR   │◄────►│  REST   │◄─►│  Gateway  │         ║
        ║  │  PWA   │      │   API   │   │   (WS)    │         ║
        ║  └────────┘      └────┬────┘   └─────┬─────┘         ║
        ║                       │              │                ║
        ║                  ┌────▼──────────────▼────┐           ║
        ║                  │   Application Layer    │           ║
        ║                  │  (Domain Services)     │           ║
        ║                  └────┬──────────────┬────┘           ║
        ║                       │              │                ║
        ║      ┌────────────────┼──────────────┼─────────┐     ║
        ║      ▼                ▼              ▼         ▼     ║
        ║  ┌────────┐    ┌──────────┐   ┌──────────┐  ┌─────┐ ║
        ║  │Postgres│    │  Redis   │   │ BullMQ   │  │ FS  │ ║
        ║  │  17    │    │   7      │   │ Workers  │  │     │ ║
        ║  │ + WAL  │    │(cache+pub│   │ (FFmpeg) │  │HLS  │ ║
        ║  └────────┘    │ /sub+Q)  │   └──────────┘  │media│ ║
        ║                └──────────┘                  └─────┘ ║
        ║                                                       ║
        ║   ┌─────────────────────────────────────────────┐    ║
        ║   │          OBSERVABILITY STACK                │    ║
        ║   │  Prometheus • Grafana • Loki • Sentry       │    ║
        ║   │  OpenTelemetry • Uptime Kuma                │    ║
        ║   └─────────────────────────────────────────────┘    ║
        ╚═══════════════════════════════════════════════════════╝
                  │                              │
                  ▼                              ▼
       ┌────────────────────┐         ┌────────────────────┐
       │   Eskiz.uz SMS     │         │   Backblaze B2     │
       │   (OTP yuborish)   │         │   (Tashqi backup)  │
       └────────────────────┘         └────────────────────┘
```

### 3.2. Arxitektura uslubi: Modular Monolit

**Mikroservis emas, modular monolit** — sabab:

| Mezon | Modular monolit | Mikroservis |
|-------|-----------------|-------------|
| Operatsion murakkablik | Past | Yuqori |
| Bitta VPS'da samaradorlik | Yaxshi | Yomon (network overhead) |
| Jamoa hajmi (≤ 5 dev) | Optimal | Overhead |
| Deployment | Bitta artifact | Ko'p artifactlar |
| Debugging | Oson | Distributed tracing kerak |
| Skala (5K user) | Yetarli | Keraksiz |

**Modular monolit qoidalari:**

1. Modullar **mustaqil** — boshqa modulning DB jadvallariga to'g'ridan-to'g'ri kirmaydi
2. Modullar bir-biri bilan faqat **ochiq interfeys** orqali muloqot qiladi
3. Har modul o'z **bounded context**'iga ega (DDD)
4. Kelajakda kerakli modul **mikroservis sifatida ajratib olinadi** — qayta yozishsiz

### 3.3. Komponentlar va vazifalari

| Komponent | Vazifa | Texnologiya |
|-----------|--------|-------------|
| Edge | DDoS, WAF, CDN, TLS | Cloudflare |
| Reverse proxy | Routing, rate limit, static | Nginx 1.26 |
| Frontend | UI, SSR, PWA shell | Next.js 15 |
| API server | REST endpoints, biznes mantiq | NestJS 11 |
| Real-time gateway | Chat, presence, push | Socket.io 4 |
| Asosiy DB | Strukturalangan ma'lumotlar | PostgreSQL 17 |
| Cache / Queue / Pub-Sub | Sessiya, cache, queue | Redis 7 |
| Background workers | Video transcode, cleanup | BullMQ |
| Fayl xizmati | Statik fayllar va media | Nginx + FS |
| Kuzatuv | Metrik, log, trace, error | Prometheus + Grafana + Loki + Sentry |

### 3.4. Ma'lumotlar oqimi (data flow)

**Misol: foydalanuvchi videoni tomosha qilganda:**

```
1. Browser → GET /lessons/123 (Next.js SSR)
2. Next.js → API: /api/v1/lessons/123 (server tomonida fetch)
3. NestJS → Auth Guard: JWT cookie verify
4. NestJS → Cache check (Redis): "lesson:123" (titles/descriptions JSON ichida 4 til)
5. Cache miss → Postgres: SELECT lesson + section + tags
6. Redis SET (TTL 5 daqiqa)
7. NestJS → JSON response
8. Next.js → HTML render with embedded data
9. Browser → HTML render → HLS.js init
10. HLS.js → GET /storage/videos/123/master.m3u8 (Cloudflare cached)
11. Cloudflare hit → segment'larni yuklab tomosha
12. Browser → POST /api/v1/lessons/123/progress (har 10 sek)
13. NestJS → Postgres UPSERT (debounced via Redis)
```

---

## 4. Texnologiyalar to'plami

### 4.1. Frontend stack

| Qatlam | Texnologiya | Versiya | Asos |
|--------|-------------|---------|------|
| Framework | **Next.js** | 15.x (App Router) | SSR + SSG + RSC, Vercel'ning enterprise tanlovi |
| Til | **TypeScript** | 5.5+ | Strict mode majburiy |
| UI primitives | **Radix UI** | 1.x | Accessible, headless |
| UI komponentlar | **shadcn/ui** | latest | Customizable, owned code |
| Stillar | **Tailwind CSS** | 4.x | Utility-first, design tokenlar |
| Server state | **TanStack Query** | 5.x | Caching, optimistic, retry |
| Mahalliy state | **Zustand** | 4.x | Yengil, performant |
| Forms | **React Hook Form** | 7.x | Performant, kam re-render |
| Validatsiya | **Zod** | 3.x | Schema-first, TS-native |
| i18n | **next-intl** | 3.x | App Router native |
| WebSocket klient | **socket.io-client** | 4.x | Reconnection, fallback |
| Video player | **HLS.js** + custom UI | latest | HLS qo'llab-quvvatlash |
| Animatsiya | **Framer Motion** | 11.x | Production-ready |
| Iconlar | **Lucide React** | latest | Tree-shakeable |
| Sana | **date-fns** | 3.x | Locale-aware |
| Birlik test | **Vitest** | 1.x | Tezkor, ESM-first |
| Komponent test | **Testing Library** | latest | Best practice |
| E2E test | **Playwright** | 1.x | Microsoft, multi-browser |
| Linter | **ESLint** + **eslint-config-next** | 9.x | Standart |
| Formatter | **Prettier** | 3.x | Konsistensiya |
| Git hooks | **Husky** + **lint-staged** | latest | Pre-commit |

### 4.2. Backend stack

| Qatlam | Texnologiya | Versiya | Asos |
|--------|-------------|---------|------|
| Runtime | **Node.js** | 22 LTS | Stabil 2027'gacha |
| Framework | **NestJS** | 11.x | DI, modular, enterprise |
| Til | **TypeScript** | 5.5+ | Frontend bilan unification |
| ORM | **Prisma** | 6.x | Type-safe, migration tool |
| Validatsiya | **class-validator** + **Zod** | latest | NestJS pipes + custom |
| Auth | **jose** (JWT) + **argon2** | latest | Zamonaviy, OWASP'ga muvofiq |
| WebSocket | **Socket.io** + Redis adapter | 4.x | Reconnect, scale |
| Queue | **BullMQ** | 5.x | Redis-based, prioritetlar |
| Logger | **Pino** + **pino-pretty** | 9.x | Structured, fast |
| HTTP klient | **undici** | latest | Native fetch'dan tezroq |
| API hujjatlari | **@nestjs/swagger** | latest | OpenAPI 3.1 |
| Test | **Vitest** + **Supertest** | latest | API integration |
| Migration | **Prisma Migrate** | 6.x | Deklarativ |
| Tracing | **OpenTelemetry SDK** | latest | CNCF standart |

### 4.3. Ma'lumotlar va saqlash

| Maqsad | Texnologiya | Versiya |
|--------|-------------|---------|
| OLTP DB | **PostgreSQL** | 17 |
| Cache / Sessiya / Queue / Pub-Sub | **Redis** | 7.4 |
| Qidiruv (MVP) | PostgreSQL **GIN + tsvector** | — |
| Qidiruv (skala) | **Meilisearch** | 1.x (kelajakda) |
| Fayl tizimi | ext4 (NVMe SSD) | — |
| Tashqi backup | **Backblaze B2** | S3-compatible |

### 4.4. Infratuzilma

| Qatlam | Texnologiya |
|--------|-------------|
| Server | Contabo VPS L (10 vCPU, 30 GB RAM, 800 GB NVMe) |
| OS | Ubuntu 24.04 LTS |
| Reverse proxy | Nginx 1.26 |
| TLS | Let's Encrypt (Certbot) |
| CDN | Cloudflare (Free → Pro keyinchalik) |
| Containerization | Docker 27 + Docker Compose v2 |
| Orchestration (kelajakda) | Docker Swarm yoki k3s |
| Konteyner registry | GitHub Container Registry |
| CI/CD | GitHub Actions |
| Sirlar | `.env` (Docker secret), kelajakda Infisical |

### 4.5. Observability stack

| Maqsad | Texnologiya |
|--------|-------------|
| Metriklar | **Prometheus** + Node Exporter |
| Vizualizatsiya | **Grafana** |
| Loglar | **Grafana Loki** + Promtail |
| Tracing | **OpenTelemetry** + Tempo (kelajakda) |
| Errorlar | **Sentry** (Free tier 5K events/oy) |
| Uptime | **Uptime Kuma** (self-hosted) |
| Alert | Grafana Alerts → Telegram bot |

### 4.6. Tashqi xizmatlar

| Maqsad | Xizmat | Sabab |
|--------|--------|-------|
| SMS (OTP) | **Eskiz.uz** | UZ'da liderlik, ishonchli |
| SMS backup | Eskiz Telegram bot fallback | Asosiysi tushib qolsa |
| Email | **Resend** | DX, narx, deliverability |
| Backup | **Backblaze B2** | ~$6/TB/oy, S3-compat |
| Domain | UZ'da .uz registratori | DNS Cloudflare'da |

---

## 5. Frontend arxitekturasi

### 5.1. Loyiha tuzilishi

```
apps/web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # uz-Latn | uz-Cyrl | ru | en
│   │   │   ├── (auth)/               # Public route group
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── verify-otp/page.tsx
│   │   │   ├── (onboarding)/         # Auth talab, lekin asosiy nav yo'q
│   │   │   │   ├── language/page.tsx
│   │   │   │   ├── industry/page.tsx
│   │   │   │   ├── section/page.tsx
│   │   │   │   └── profile/page.tsx  # ism + familiya + @username
│   │   │   ├── (main)/               # Auth + asosiy navigatsiya
│   │   │   │   ├── home/page.tsx
│   │   │   │   ├── lessons/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── people/
│   │   │   │   │   ├── page.tsx              # Tadbirkorlarni topish
│   │   │   │   │   └── [username]/page.tsx   # @username profil
│   │   │   │   ├── groups/
│   │   │   │   │   ├── page.tsx              # Mening guruhlarim
│   │   │   │   │   ├── new/page.tsx          # Yangi guruh yaratish
│   │   │   │   │   ├── search/page.tsx       # Public guruhlarni qidirish
│   │   │   │   │   ├── join/[token]/page.tsx # Invite link
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx          # Guruh chat
│   │   │   │   │       └── settings/page.tsx
│   │   │   │   ├── messages/
│   │   │   │   │   ├── page.tsx              # Threads list
│   │   │   │   │   └── [username]/page.tsx   # DM (username bo'yicha)
│   │   │   │   ├── my-site/page.tsx          # PromoVideo'lar
│   │   │   │   ├── notifications/page.tsx
│   │   │   │   └── settings/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── profile/page.tsx
│   │   │   │       ├── language/page.tsx
│   │   │   │       ├── notifications/page.tsx
│   │   │   │       ├── privacy/page.tsx
│   │   │   │       ├── theme/page.tsx
│   │   │   │       └── sessions/page.tsx
│   │   │   ├── (admin)/              # Admin panel
│   │   │   │   └── admin/
│   │   │   │       ├── page.tsx              # Dashboard
│   │   │   │       ├── users/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   └── [id]/page.tsx
│   │   │   │       ├── lessons/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   └── new/page.tsx      # 4 til metadata + 4 SRT
│   │   │   │       ├── promo-videos/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   └── new/page.tsx
│   │   │   │       ├── announcements/page.tsx
│   │   │   │       └── audit/page.tsx
│   │   │   └── layout.tsx
│   │   ├── share/
│   │   │   └── promo/
│   │   │       └── [token]/page.tsx   # Public PromoVideo (auth talab qilmaydi, noindex)
│   │   ├── api/                       # BFF endpoints (faqat zarur)
│   │   ├── manifest.ts                # PWA manifest
│   │   └── sitemap.ts
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn primitives (Button, Dialog, ...)
│   │   ├── layout/                    # Header, MobileTabBar, Sidebar, CommandPalette
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── lessons/
│   │   │   ├── chat/                  # DM va Group bir komponentni reuse qilishadi
│   │   │   ├── groups/
│   │   │   ├── people/
│   │   │   ├── promo-videos/
│   │   │   ├── notifications/
│   │   │   └── search/                # Global Cmd+K
│   │   └── shared/                    # Avatar, EmptyState, ErrorBoundary, VideoPlayer
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts              # ky wrapper, auth interceptor
│   │   │   ├── endpoints/             # Tipalashtirilgan API funksiyalar
│   │   │   └── queries/               # TanStack Query hooks
│   │   ├── socket/
│   │   │   ├── client.ts              # Socket.io singleton
│   │   │   └── hooks.ts               # useSocket, useEvent
│   │   ├── auth/
│   │   ├── i18n/
│   │   ├── pwa/
│   │   │   ├── push.ts                # Web Push subscribe (1-xabar trigger)
│   │   │   └── install.ts             # beforeinstallprompt
│   │   ├── theme/
│   │   │   └── provider.tsx           # Light/Dark/System
│   │   ├── store/                     # Zustand stores
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── constants.ts
│   │
│   ├── messages/                      # i18n JSON — 4 til
│   │   ├── uz-Latn.json
│   │   ├── uz-Cyrl.json
│   │   ├── ru.json
│   │   └── en.json
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── design-tokens.css          # Indigo + Zinc tokens
│   │
│   ├── middleware.ts                  # i18n routing + auth guard
│   └── env.ts                         # Tip-xavfsiz env (zod)
│
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js                          # Service worker (Serwist)
│   ├── icons/                         # PWA iconlar (192, 512, maskable)
│   └── splash/                        # iOS splash screens
│
├── tests/
│   ├── e2e/                           # Playwright
│   └── unit/                          # Vitest
│
├── next.config.mjs
├── tailwind.config.ts                 # Design tokens'ga bog'liq
├── tsconfig.json (strict: true)
├── .eslintrc.json
└── package.json
```

### 5.2. Routing strategiyasi

**Route group'lar** orqali layout va auth ajratiladi:

| Group | Layout | Middleware |
|-------|--------|------------|
| `(auth)` | Minimal | Mehmon-only |
| `(onboarding)` | Onboarding shell | Auth required |
| `(main)` | Asosiy app shell | Auth + onboarding tugagan |
| `(admin)` | Admin shell | Auth + role: ADMIN |

**Middleware** (`src/middleware.ts`):

```typescript
export async function middleware(request: NextRequest) {
  // 1. i18n routing
  const handleI18n = createI18nMiddleware();
  // 2. Auth check (cookie)
  const session = await getSessionFromCookie(request);
  // 3. Route guard
  if (isProtected(pathname) && !session) return redirect('/login');
  if (isAdminRoute(pathname) && session.role !== 'ADMIN') return redirect('/home');
  if (isOnboardingDone(session) && pathname.startsWith('/onboarding')) {
    return redirect('/home');
  }
  return handleI18n(request);
}
```

### 5.3. State menejmenti

**Qatlamlash:**

| State turi | Yechim | Misol |
|------------|--------|-------|
| Server state | TanStack Query | Lesson list, profile |
| Persistent local | Zustand + localStorage | Tema, til, last route |
| Ephemeral | useState/useReducer | Form holati, modal |
| URL state | Next.js searchParams | Filter, pagination |

**Zustand stores:**

```typescript
// src/lib/store/auth.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth' }
  )
);

// src/lib/store/ui.ts
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: false,
      // ...
    }),
    { name: 'ui' }
  )
);
```

### 5.4. API integratsiya namunasi

```typescript
// src/lib/api/queries/lessons.ts
export function useLessons(filters: LessonFilters) {
  return useQuery({
    queryKey: ['lessons', filters],
    queryFn: () => api.lessons.list(filters),
    staleTime: 60_000,
  });
}

export function useUpdateProgress() {
  return useMutation({
    mutationFn: api.lessons.updateProgress,
    onMutate: async ({ lessonId, position }) => {
      // Optimistic update
      await queryClient.cancelQueries(['lesson', lessonId]);
      const prev = queryClient.getQueryData(['lesson', lessonId]);
      queryClient.setQueryData(['lesson', lessonId], (old) => ({
        ...old,
        progress: position,
      }));
      return { prev };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(['lesson', lessonId], ctx.prev);
    },
  });
}
```

### 5.5. Performance byudjeti

| Metrik | Maqsad | O'lchov vositasi |
|--------|--------|-------------------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse, Web Vitals |
| FID / INP | < 100ms / < 200ms | Web Vitals |
| CLS | < 0.1 | Web Vitals |
| Bundle (initial JS) | < 180 KB gzip | next-bundle-analyzer |
| Image format | AVIF birlamchi, WebP fallback | next/image |
| Font | Self-hosted, subset | next/font |

**Optimizatsiya texnikalari:**

- Route-based code splitting (avtomatik)
- React Server Components — server-only komponentlar (fetch, DB)
- Image priority + blur placeholder
- Prefetch — `<Link prefetch>` hover'da
- Virtual scrolling — TanStack Virtual (xabarlar, userlar ro'yxati)
- Service Worker cache — statik fayllar va GET API javoblari
- Critical CSS inline

### 5.6. Dizayn tizimi — Indigo + Zinc

**Brending tanlovi:** Indigo + Zinc palitra (Linear / Notion / Telegram vibe). Sof, minimalist, professional. Foydalanuvchi tasdiqlagan.

**design-tokens.css:**

```css
:root {
  /* ─── Brand (Indigo) ─── */
  --brand-50:  #eef2ff;
  --brand-100: #e0e7ff;
  --brand-500: #6366f1;   /* asosiy brand rang */
  --brand-600: #4f46e5;
  --brand-700: #4338ca;   /* hover / pressed */
  --brand-900: #312e81;

  /* ─── Semantic ─── */
  --success: #10b981;
  --warning: #f59e0b;
  --error:   #ef4444;
  --info:    #3b82f6;

  /* ─── Typography ─── */
  --font-sans: 'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Cascadia Code', ui-monospace, monospace;

  /* ─── Radius ─── */
  --radius-sm: 0.375rem;   /* 6px  */
  --radius-md: 0.5rem;     /* 8px  */
  --radius-lg: 1rem;       /* 16px */
  --radius-xl: 1.5rem;     /* 24px (avatar, modal) */
  --radius-full: 9999px;

  /* ─── Spacing scale (Tailwind moslab) ─── */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* ─── Z-index ─── */
  --z-header:   50;
  --z-tab-bar:  50;
  --z-modal:    100;
  --z-toast:    200;

  /* ─── Transition ─── */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-base: 200ms;
}

/* ─── LIGHT MODE (default) ─── */
:root,
[data-theme='light'] {
  --bg-app:     #ffffff;
  --bg-surface: #fafafa;     /* zinc-50  */
  --bg-elev:    #f4f4f5;     /* zinc-100 */
  --bg-hover:   #e4e4e7;     /* zinc-200 */

  --text-primary:   #09090b; /* zinc-950 */
  --text-secondary: #3f3f46; /* zinc-700 */
  --text-muted:     #71717a; /* zinc-500 */
  --text-disabled:  #a1a1aa; /* zinc-400 */
  --text-inverse:   #fafafa;

  --border:        #e4e4e7;  /* zinc-200 */
  --border-strong: #d4d4d8;  /* zinc-300 */

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.04);
  --shadow-md: 0 4px 12px rgb(0 0 0 / 0.06);
  --shadow-lg: 0 12px 32px rgb(0 0 0 / 0.10);
}

/* ─── DARK MODE ─── */
[data-theme='dark'] {
  --bg-app:     #09090b;     /* zinc-950 */
  --bg-surface: #18181b;     /* zinc-900 */
  --bg-elev:    #27272a;     /* zinc-800 */
  --bg-hover:   #3f3f46;     /* zinc-700 */

  --text-primary:   #fafafa; /* zinc-50  */
  --text-secondary: #d4d4d8; /* zinc-300 */
  --text-muted:     #a1a1aa; /* zinc-400 */
  --text-disabled:  #71717a; /* zinc-500 */
  --text-inverse:   #09090b;

  --border:        #27272a;  /* zinc-800 */
  --border-strong: #3f3f46;  /* zinc-700 */

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.35);
  --shadow-md: 0 4px 12px rgb(0 0 0 / 0.45);
  --shadow-lg: 0 12px 32px rgb(0 0 0 / 0.60);
}

/* System default */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    color-scheme: dark;
    /* dark mode token'lari */
  }
}
```

**Tailwind 4 config (`tailwind.config.ts`)** — design tokens'ga bog'lanadi:

```ts
export default {
  theme: {
    extend: {
      colors: {
        brand: { 50: 'var(--brand-50)', 500: 'var(--brand-500)', 700: 'var(--brand-700)' },
        bg: { app: 'var(--bg-app)', surface: 'var(--bg-surface)', elev: 'var(--bg-elev)' },
        text: { DEFAULT: 'var(--text-primary)', muted: 'var(--text-muted)' },
      },
      fontFamily: { sans: ['var(--font-sans)'], mono: ['var(--font-mono)'] },
      borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)' },
    },
  },
};
```

### 5.7. Shrift — Inter Variable

**Sabab:** Lotin + Kirill + Rus + Ingliz to'liq qo'llab-quvvatlaydi. Variable font (bitta fayl, hamma weight'lar). Self-hosted (CDN'ga bog'liq emas). GitHub, Linear, Mozilla, BBC ishlatadi.

```ts
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
```

**Subset:** `latin` + `latin-ext` (ingliz + diacritic'lar) + `cyrillic` + `cyrillic-ext` (uz-Cyrl + ru). 4 ta subset, ~120 KB jami.

### 5.8. Theme switcher

3 ta variant: **Yorug' · Qorong'i · Tizimga muvofiq**. Default = `system` (`prefers-color-scheme` media query). Sozlama `User.theme` ga saqlanadi va `localStorage` orqali keshlangan (server-side flash oldini olish uchun cookie ham).

**FOUC oldini olish** — Next.js `<head>` ichida inline script:

```tsx
// app/layout.tsx — head ichida
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    const stored = localStorage.getItem('theme') || 'system';
    const dark = stored === 'dark' || (stored === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  })();
`}} />
```

---

## 6. Backend arxitekturasi

### 6.1. Loyiha tuzilishi

```
apps/api/
├── src/
│   ├── modules/                      # Bounded contexts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── guards/
│   │   │   ├── dto/
│   │   │   └── auth.test.ts
│   │   ├── users/
│   │   ├── industries/
│   │   ├── sections/
│   │   ├── lessons/
│   │   ├── progress/
│   │   ├── messages/
│   │   ├── groups/
│   │   ├── notifications/
│   │   ├── sites/
│   │   ├── search/
│   │   ├── uploads/
│   │   └── admin/
│   │
│   ├── common/
│   │   ├── decorators/               # @CurrentUser, @Roles, @Public
│   │   ├── guards/                   # JwtGuard, RolesGuard, ThrottlerGuard
│   │   ├── interceptors/             # LoggingInterceptor, TransformResponse
│   │   ├── filters/                  # GlobalExceptionFilter
│   │   ├── pipes/                    # ZodValidationPipe
│   │   └── middleware/
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.module.ts
│   │   ├── redis/
│   │   ├── queue/                    # BullMQ konfiguratsiya
│   │   ├── storage/                  # Filesystem service
│   │   ├── sms/                      # Eskiz.uz adapter
│   │   ├── push/                     # web-push xizmati
│   │   ├── email/                    # Resend adapter
│   │   └── observability/
│   │       ├── logger.ts
│   │       ├── tracer.ts
│   │       └── metrics.ts
│   │
│   ├── workers/
│   │   ├── video-transcode.worker.ts
│   │   ├── notification-fanout.worker.ts
│   │   ├── cleanup.worker.ts
│   │   └── search-index.worker.ts
│   │
│   ├── gateways/                     # Socket.io
│   │   ├── chat.gateway.ts
│   │   ├── notification.gateway.ts
│   │   └── presence.gateway.ts
│   │
│   ├── config/
│   │   ├── configuration.ts          # @nestjs/config bilan
│   │   └── env.schema.ts             # Zod validation
│   │
│   ├── app.module.ts
│   └── main.ts                       # Bootstrap
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── test/                             # E2E
├── Dockerfile
└── package.json
```

### 6.2. Modul shabloni (har modul uchun standart)

```typescript
// modules/lessons/lessons.module.ts
@Module({
  imports: [PrismaModule, RedisModule, StorageModule],
  controllers: [LessonsController],
  providers: [LessonsService, LessonsRepository],
  exports: [LessonsService],
})
export class LessonsModule {}

// modules/lessons/lessons.controller.ts
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiTags('Lessons')
export class LessonsController {
  constructor(private readonly service: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Mening bo\'limimning darslari' })
  list(@CurrentUser() user: User, @Query() q: ListLessonsDto) {
    return this.service.listForUser(user, q);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.findOneForUser(id, user);
  }

  @Post(':id/progress')
  @HttpCode(204)
  updateProgress(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.service.updateProgress(id, user.id, dto);
  }
}
```

### 6.3. Standart javob shakli

**Muvaffaqiyatli javob:**

```json
{
  "data": { /* ... */ },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 145
  }
}
```

**Xato javob (RFC 7807 Problem Details):**

```json
{
  "type": "https://biznesjon.uz/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "Telefon raqami noto'g'ri formatda",
  "errors": [
    { "field": "phone", "code": "invalid_format" }
  ],
  "traceId": "01HXYZ..."
}
```

### 6.4. Middleware zanjiri

```
Request
  → Helmet (security headers)
  → CORS
  → Compression (brotli > gzip)
  → Request ID (X-Request-Id)
  → Pino logger (structured)
  → ThrottlerGuard (Redis rate limit)
  → JwtAuthGuard (auth)
  → RolesGuard (RBAC)
  → ZodValidationPipe
  → Controller → Service → Repository
  → TransformResponseInterceptor
  → GlobalExceptionFilter
Response
```

### 6.5. Xato boshqaruv strategiyasi

| Xato klassi | HTTP | Misol |
|-------------|------|-------|
| `ValidationError` | 422 | Form maydoni noto'g'ri |
| `AuthenticationError` | 401 | Token yo'q yoki muddati o'tgan |
| `AuthorizationError` | 403 | Ruxsat yetarli emas |
| `NotFoundError` | 404 | Resurs topilmadi |
| `ConflictError` | 409 | Telefon allaqachon ro'yxatdan o'tgan |
| `RateLimitError` | 429 | Limit oshib ketdi |
| `ExternalServiceError` | 502 | SMS gateway javob bermayapti |
| `InternalError` | 500 | Kutilmagan xato (Sentry'ga) |

Har xato `traceId` bilan keladi — Grafana Loki'da darhol topish mumkin.

### 6.6. Konfiguratsiya boshqaruv

`.env` fayli **Zod** orqali tasdiqlanadi:

```typescript
// config/env.schema.ts
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ESKIZ_EMAIL: z.string().email(),
  ESKIZ_PASSWORD: z.string(),
  STORAGE_ROOT: z.string().default('/var/biznesjon/storage'),
  CDN_BASE_URL: z.string().url(),
  SENTRY_DSN: z.string().url().optional(),
  // ...
});

// main.ts da bootstrap'da tekshiriladi — yetarsiz env => crash
```

---

## 7. Ma'lumotlar bazasi

### 7.1. ER diagramma

```
USER ─┬─ UserProfile (1:1)
      ├─ Industry (N:1)
      ├─ Section (N:1)
      ├─ LessonProgress (1:N)
      ├─ Message (sender, recipient)
      ├─ GroupMembership (N:M ↔ GroupChat) [role, leftAt]
      ├─ GroupChat (creator, 1:N)
      ├─ Notification (1:N)
      ├─ PushSubscription (1:N)
      ├─ PromoVideo (1:N) — "Mening saytim" videolari
      ├─ RefreshToken (1:N)
      └─ AuditLog (faoliyatlar)

INDUSTRY ──< SECTION ──< LESSON ──< LessonProgress
                                 └─ LessonSubtitle (4 til)
                                 └─ LessonTag

GROUPCHAT (foydalanuvchi yaratadi, sectionga avtomatik bog'lanmaydi)
   ├─ GroupMembership (OWNER | ADMIN | MEMBER, leftAt nullable)
   ├─ GroupMessage
   └─ GroupInvite (token-based)

PROMOVIDEO ──< PromoVideoShare (public link tokens)
```

### 7.2. To'liq Prisma schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USERS ───────────────────────────────────────

model User {
  id              String     @id @default(cuid())
  phone           String     @unique
  username        String     @unique           // @aziz, @jonbiznes — kichik harf, raqam, _, 3-20 belgi
  passwordHash    String
  role            UserRole   @default(USER)
  status          UserStatus @default(ACTIVE)
  language        String     @default("uz-Latn")  // uz-Latn | uz-Cyrl | ru | en
  theme           String     @default("system")    // light | dark | system
  industryId      String?
  sectionId       String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  lastActiveAt    DateTime?
  deletedAt       DateTime?  // 30 kun keyin to'liq o'chadi

  profile             UserProfile?
  industry            Industry?              @relation(fields: [industryId], references: [id])
  section             Section?               @relation(fields: [sectionId], references: [id])
  sentMessages        Message[]              @relation("SentMessages")
  receivedMessages    Message[]              @relation("ReceivedMessages")
  groupMemberships    GroupMembership[]
  groupMessages       GroupMessage[]
  createdGroups       GroupChat[]            @relation("GroupCreator")
  progress            LessonProgress[]
  notifications       Notification[]
  pushSubs            PushSubscription[]
  promoVideos         PromoVideo[]
  refreshTokens       RefreshToken[]
  auditEntries        AuditLog[]             @relation("Actor")
  notificationPrefs   NotificationPreferences?

  @@index([phone])
  @@index([username])
  @@index([sectionId, lastActiveAt(sort: Desc)])
  @@index([deletedAt])
}

model UserProfile {
  userId       String   @id
  firstName    String
  lastName     String
  businessName String?
  city         String?
  bio          String?  @db.VarChar(200)
  avatarUrl    String?
  searchVector Unsupported("tsvector")?  // GIN index uchun (username + ism + biznes + shahar)
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([searchVector], type: Gin)
}

enum UserRole { USER ADMIN SUPER_ADMIN }
enum UserStatus { ACTIVE PENDING_DELETION }

// ─── KONTENT TAKSONOMIYASI ───────────────────────

model Industry {
  id        String    @id @default(cuid())
  slug      String    @unique
  iconKey   String
  order     Int
  names     Json      // { "uz-Latn": "...", "uz-Cyrl": "...", "ru": "...", "en": "..." }
  active    Boolean   @default(true)
  sections  Section[]
  users     User[]
}

model Section {
  id          String      @id @default(cuid())
  industryId  String
  slug        String
  iconKey     String
  order       Int
  names       Json        // 4 til
  active      Boolean     @default(true)
  industry    Industry    @relation(fields: [industryId], references: [id])
  lessons     Lesson[]
  users       User[]

  @@unique([industryId, slug])
  @@index([industryId, order])
}

// ─── DARSLAR ─────────────────────────────────────
// Audio o'zbek tilida (yagona), lekin sarlavha/tavsif/subtitle 4 tilda

model Lesson {
  id              String        @id @default(cuid())
  sectionId       String
  titles          Json          // { "uz-Latn": "...", "uz-Cyrl": "...", "ru": "...", "en": "..." }
  descriptions    Json          // { "uz-Latn": "...", "uz-Cyrl": "...", "ru": "...", "en": "..." }
  durationSec     Int
  order           Int           @default(0)
  thumbnailUrl    String
  hlsManifestPath String        // /storage/videos/{id}/master.m3u8 (signed URL orqali serve qilinadi)
  status          LessonStatus  @default(DRAFT)
  publishedAt     DateTime?
  viewsCount      Int           @default(0)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  section    Section          @relation(fields: [sectionId], references: [id])
  tags       LessonTag[]
  subtitles  LessonSubtitle[]
  progress   LessonProgress[]

  @@index([sectionId, status, order])
  @@index([status, publishedAt(sort: Desc)])
}

enum LessonStatus { DRAFT PROCESSING PUBLISHED ARCHIVED FAILED }

model LessonSubtitle {
  lessonId  String
  language  String   // uz-Latn | uz-Cyrl | ru | en
  vttUrl    String   // /storage/videos/{id}/subtitles/{lang}.vtt (VTT, HLS-native)
  lesson    Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@id([lessonId, language])
}

model LessonTag {
  lessonId String
  tag      String
  lesson   Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  @@id([lessonId, tag])
  @@index([tag])
}

model LessonProgress {
  userId        String
  lessonId      String
  positionSec   Int      @default(0)
  completed     Boolean  @default(false)
  watchedSec    Int      @default(0)
  lastWatchedAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@id([userId, lessonId])
  @@index([userId, lastWatchedAt(sort: Desc)])
}

// ─── "MENING SAYTIM" — Mijoz biznesi haqida professional video ──

model PromoVideo {
  id              String       @id @default(cuid())
  userId          String       // egasi (mijoz)
  titles          Json         // 4 til
  descriptions    Json         // 4 til
  durationSec     Int
  thumbnailUrl    String
  hlsManifestPath String       // /storage/promo-videos/{id}/master.m3u8
  status          PromoStatus  @default(PROCESSING)
  isShareable     Boolean      @default(false)  // egasi public link orqali ulasha oladimi
  shareToken      String?      @unique          // null bo'lsa share qilingan emas
  uploadedBy      String       // admin id
  uploadedAt      DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  subtitles PromoVideoSubtitle[]

  @@index([userId, uploadedAt(sort: Desc)])
  @@index([shareToken])
  @@index([status])
}

enum PromoStatus { PROCESSING PUBLISHED ARCHIVED FAILED }

model PromoVideoSubtitle {
  promoVideoId String
  language     String   // uz-Latn | uz-Cyrl | ru | en
  vttUrl       String
  promoVideo   PromoVideo @relation(fields: [promoVideoId], references: [id], onDelete: Cascade)

  @@id([promoVideoId, language])
}

// ─── XABARLAR (1-1) ──────────────────────────────

model Message {
  id          String        @id @default(cuid())
  senderId    String
  recipientId String
  type        MessageType
  body        String?       @db.Text
  mediaUrl    String?
  mediaMeta   Json?         // { duration, size, mime, width?, height?, waveform? }
  replyToId   String?
  status      MessageStatus @default(SENT)
  deletedFor  String[]      // soft delete har user uchun
  createdAt   DateTime      @default(now())
  deliveredAt DateTime?
  readAt      DateTime?

  sender    User             @relation("SentMessages", fields: [senderId], references: [id])
  recipient User             @relation("ReceivedMessages", fields: [recipientId], references: [id])
  replyTo   Message?         @relation("Reply", fields: [replyToId], references: [id])
  replies   Message[]        @relation("Reply")
  reactions MessageReaction[]

  @@index([senderId, recipientId, createdAt(sort: Desc)])
  @@index([recipientId, status, createdAt(sort: Desc)])
}

enum MessageType {
  TEXT
  IMAGE
  AUDIO        // ovozli xabar
  VIDEO        // oddiy video
  VIDEO_NOTE   // aylanacha (yumaloq) video — Telegram-style
}
enum MessageStatus { SENT DELIVERED READ }

// Reaction alohida jadval (Json field'da JSONB scan O(n) — mashhur xabarda sekin)
model MessageReaction {
  messageId String
  userId    String
  emoji     String   // unicode emoji
  createdAt DateTime @default(now())
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@id([messageId, userId, emoji])
  @@index([messageId])
}

// ─── GURUH CHATLARI (Telegram-style) ─────────────

model GroupChat {
  id           String            @id @default(cuid())
  name         String            @db.VarChar(50)
  description  String?           @db.VarChar(200)
  avatarUrl    String?
  visibility   GroupVisibility   @default(PRIVATE)
  creatorId    String
  memberCount  Int               @default(1)     // cached counter (200 limit tekshirish uchun)
  industryId   String?           // tematik bog'lanish (ixtiyoriy, qidiruv uchun)
  sectionId    String?           // tematik bog'lanish (ixtiyoriy)
  searchVector Unsupported("tsvector")?  // public guruhlar uchun qidiruv
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  creator   User               @relation("GroupCreator", fields: [creatorId], references: [id])
  members   GroupMembership[]
  messages  GroupMessage[]
  invites   GroupInvite[]

  @@index([visibility, memberCount(sort: Desc)])
  @@index([industryId, sectionId])
  @@index([searchVector], type: Gin)
}

enum GroupVisibility { PUBLIC PRIVATE }

model GroupMembership {
  userId     String
  groupId    String
  role       GroupRole  @default(MEMBER)
  joinedAt   DateTime   @default(now())
  leftAt     DateTime?  // null = hozirgi a'zo; not null = chiqgan (tarix uchun saqlanadi)
  mutedUntil DateTime?
  lastReadAt DateTime?

  user  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  group GroupChat @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@id([userId, groupId])
  @@index([groupId, leftAt])
  @@index([userId, leftAt])
}

enum GroupRole { OWNER ADMIN MEMBER }

model GroupMessage {
  id        String      @id @default(cuid())
  groupId   String
  senderId  String
  type      MessageType
  body      String?     @db.Text
  mediaUrl  String?
  mediaMeta Json?
  replyToId String?
  mentions  String[]    // [userId, ...]
  createdAt DateTime    @default(now())
  editedAt  DateTime?

  group     GroupChat              @relation(fields: [groupId], references: [id], onDelete: Cascade)
  sender    User                   @relation(fields: [senderId], references: [id])
  reactions GroupMessageReaction[]

  @@index([groupId, createdAt(sort: Desc)])
}

model GroupMessageReaction {
  messageId String
  userId    String
  emoji     String
  createdAt DateTime @default(now())
  message   GroupMessage @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@id([messageId, userId, emoji])
  @@index([messageId])
}

model GroupInvite {
  id         String     @id @default(cuid())
  groupId    String
  token      String     @unique  // /groups/join/{token}
  createdBy  String     // userId
  maxUses    Int?       // null = cheksiz
  usesCount  Int        @default(0)
  expiresAt  DateTime?  // null = abadiy
  revokedAt  DateTime?
  createdAt  DateTime   @default(now())

  group GroupChat @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@index([groupId, revokedAt])
  @@index([token])
}

// ─── BILDIRISHNOMALAR ────────────────────────────

model Notification {
  id        String    @id @default(cuid())
  userId    String
  type      NotifType
  payload   Json
  readAt    DateTime?
  createdAt DateTime  @default(now())
  expiresAt DateTime  // default +30 kun

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, readAt, createdAt(sort: Desc)])
  @@index([expiresAt])
}

enum NotifType {
  NEW_MESSAGE         // DM
  GROUP_MENTION       // @mention guruh chatda
  GROUP_INVITE        // private guruhga taklif
  PROMO_VIDEO_PUBLISHED  // admin "Mening saytim" video yukladi
  NEW_LESSON          // bo'limda yangi dars
  ADMIN_ANNOUNCEMENT  // admin hammaga e'lon
  ACCOUNT_RESTORED    // 30 kun ichida login qilib hisob tiklandi
}

model NotificationPreferences {
  userId           String  @id
  pushNewMessage   Boolean @default(true)
  pushGroupMention Boolean @default(true)
  pushNewLesson    Boolean @default(true)
  pushPromoVideo   Boolean @default(true)
  pushAnnouncement Boolean @default(true)
  inAppAll         Boolean @default(true)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  userAgent String?
  createdAt DateTime @default(now())
  lastUsed  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// ─── XAVFSIZLIK ─────────────────────────────────

model OtpCode {
  id        String     @id @default(cuid())
  phone     String
  codeHash  String     // bcrypt
  purpose   OtpPurpose
  attempts  Int        @default(0)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime   @default(now())
  ip        String?

  @@index([phone, purpose, expiresAt])
}

// Faqat REGISTER kerak — PASSWORD_RESET admin manual orqali
enum OtpPurpose { REGISTER PHONE_CHANGE }

model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  tokenHash String    @unique  // SHA-256
  family    String                       // rotation oilasi
  userAgent String?
  ip        String?
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())
  lastUsed  DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, revokedAt])
  @@index([family])
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  action    String   // "USER.UPDATE", "PROMO_VIDEO.UPLOAD", "LESSON.PUBLISH", "GROUP.DELETE", ...
  target    String?  // "user:abc123", "lesson:xyz", "group:def"
  metadata  Json?
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())

  actor User? @relation("Actor", fields: [actorId], references: [id])

  @@index([actorId, createdAt(sort: Desc)])
  @@index([action, createdAt(sort: Desc)])
  @@index([target])
}
```

### 7.3. Indekslar va sabablar

| Jadval | Indeks | Sabab |
|--------|--------|-------|
| `User.phone` | UNIQUE | Login lookup |
| `User.username` | UNIQUE | `/people/@username` route, mention lookup |
| `User.(sectionId, lastActiveAt DESC)` | Composite | Bo'lim bo'yicha so'nggi faollar |
| `UserProfile.searchVector` | GIN | Full-text qidiruv (username + ism + biznes + shahar) |
| `Lesson.(sectionId, status, order)` | Composite | Bosh sahifa feed (til endi lesson'da yo'q — subtitle alohida) |
| `Lesson.(status, publishedAt DESC)` | Composite | Yangi darslar feed |
| `LessonSubtitle.(lessonId, language)` | Compound PK | Subtitle lookup per til |
| `Message.(senderId, recipientId, createdAt DESC)` | Composite | Chat tarixi |
| `MessageReaction.messageId` | Single | Reaction count per xabar |
| `GroupChat.(visibility, memberCount DESC)` | Composite | Public guruhlar discovery |
| `GroupChat.(industryId, sectionId)` | Composite | Tematik guruh qidiruvi |
| `GroupChat.searchVector` | GIN | Public guruh qidiruvi (nom + tavsif) |
| `GroupMembership.(groupId, leftAt)` | Composite | Faol a'zolar (leftAt IS NULL) |
| `GroupMembership.(userId, leftAt)` | Composite | "Mening guruhlarim" |
| `GroupMessage.(groupId, createdAt DESC)` | Composite | Guruh oqimi |
| `GroupInvite.token` | UNIQUE | Invite link orqali kirish |
| `PromoVideo.(userId, uploadedAt DESC)` | Composite | "Mening saytim" tartibida |
| `PromoVideo.shareToken` | UNIQUE | Public share URL lookup |
| `Notification.(userId, readAt, createdAt DESC)` | Composite | O'qilmaganlar |
| `Notification.expiresAt` | Single | Cleanup batch |
| `RefreshToken.tokenHash` | UNIQUE | Validatsiya |
| `RefreshToken.family` | Single | Token rotation |

### 7.4. Migration siyosati

- Har o'zgarish — alohida Prisma migration
- **Production: faqat `prisma migrate deploy`** (`migrate dev` emas)
- Buzuvchi migration uchun **expand-and-contract** pattern:
  1. Yangi ustun qo'shiladi (nullable)
  2. Kod yangi va eski ustunni yozadi
  3. Backfill skripti
  4. Kod faqat yangi ustunni o'qiydi
  5. Eski ustun olinadi
- Har migration **CI'da test bazasida** sinaladi
- Backup OLDIN — har production migration uchun

### 7.5. Performans qoidalari

- N+1 problem — Prisma `include` yoki `select` bilan oldini olinadi
- Pagination — har list endpoint da limit (default 20, max 100)
- Soft delete — `deletedAt` filter har query'da
- Hot key cache — Redis (sohalar, bo'limlar 5 daqiqa)
- Connection pool — PgBouncer (kelajakda), hozir Prisma'ning ichki pool
- Reactions alohida jadval (Json field emas) — popular xabarda 500 reaction yozish O(1), JSONB scan O(n) emas
- Group memberCount cached — har join/leave'da transaction ichida `INCR`/`DECR` (200 limit atomically tekshiriladi)
- `searchVector` jadvalda GENERATED ALWAYS AS — application code'da update qilish kerak emas

### 7.6. Biznes qoidalari (schema darajasida emas — service darajasida)

| Qoida | Joy |
|---|---|
| Username regex: `/^[a-z0-9_]{3,20}$/` | Onboarding + edit profile |
| Bio 200 belgi (grapheme clusters, emoji hisobga olib) | Profile service |
| Group memberCount ≤ 200 | `joinGroup` service (transaction + advisory lock) |
| OWNER guruhdan chiqa olmaydi (avval transfer kerak) | `leaveGroup` service |
| Xabar 24 soat ichida o'chirilishi mumkin | `deleteMessage` service |
| Bo'lim o'zgarganda guruh a'zoliklari saqlanadi (leftAt yo'q) | `changeSection` service |
| PromoVideo `shareToken` faqat egasi yoqgan bo'lsa generate qilinadi | `enableSharing` service |
| 30 kun keyin soft-deleted user to'liq o'chadi (cron) | Cleanup worker |
| OTP 5 daqiqa, 5 marta xato urinish → yangi OTP kerak | Auth service |
| Parol reset — faqat admin (`PASSWORD_RESET` OTP yo'q) | Admin panel |

---

## 8. API spetsifikatsiyasi

### 8.1. URL struktura

```
https://api.biznesjon.uz/api/v1/...        # Foydalanuvchi
https://api.biznesjon.uz/admin/api/v1/...  # Admin
https://api.biznesjon.uz/health            # Health check
https://api.biznesjon.uz/metrics           # Prometheus (faqat ichki)
https://api.biznesjon.uz/api/docs          # Swagger (staging/dev)
```

### 8.2. Auth endpointlari

| Method | Endpoint | Body / Query | Javob |
|--------|----------|--------------|-------|
| POST | `/auth/register` | `{ phone, password }` | `{ otpToken, expiresIn }` |
| POST | `/auth/verify-otp` | `{ otpToken, code }` | `{ user, accessToken }` + cookie |
| POST | `/auth/login` | `{ phone, password }` | `{ user, accessToken }` + cookie |
| POST | `/auth/refresh` | (cookie) | `{ accessToken }` |
| POST | `/auth/logout` | — | 204 |
| POST | `/auth/resend-otp` | `{ otpToken }` | `{ resentAt }` |

> **Parol unutilsa "forgot password" endpoint YO'Q** — foydalanuvchi support'ga murojaat qiladi, admin manual `POST /admin/users/:id/reset-password` orqali yangi vaqtinchalik parol beradi.

### 8.3. Foydalanuvchi va onboarding

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/me` | Joriy user + profil |
| PATCH | `/me` | Profilni yangilash (ism, familiya, biznes, shahar, bio) |
| POST | `/me/avatar` | Multipart upload (JPG/PNG/WEBP/HEIC, server konvert qiladi) |
| DELETE | `/me/avatar` | O'chirish |
| PATCH | `/me/username` | Username o'zgartirish (cooldown: 30 kunda 1 marta) |
| PATCH | `/me/onboarding` | Til, soha, bo'lim, profil + username bir martalik |
| PATCH | `/me/section` | Soha/bo'limni keyin o'zgartirish (cooldown yo'q, tarix saqlanadi) |
| PATCH | `/me/language` | Til o'zgartirish (4 til) |
| PATCH | `/me/theme` | Tema (light/dark/system) |
| GET | `/me/sessions` | Faol qurilmalar |
| DELETE | `/me/sessions/:id` | Qurilmadan chiqarish |
| DELETE | `/me` | Hisobni o'chirish (soft, 30 kun) |
| GET | `/users/check-username?username=X` | `{ available: bool, suggestions: ["aziz1","aziz2","aziz3"] }` |
| GET | `/users/by-username/:username` | Profil ma'lumotlari (ommaviy) |
| GET | `/users` | Tadbirkorlarni topish (filter: industry, section, city, q; pagination) |

### 8.4. Taksonomiya va kontent (darslar)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/industries` | 10 ta soha (4 til names bilan) |
| GET | `/industries/:id/sections` | Sohaning bo'limlari (4 til names) |
| GET | `/lessons` | Mening bo'limimning darslari (paginate, faqat PUBLISHED) |
| GET | `/lessons/:id` | Bitta dars + signed HLS manifest URL (5 daq TTL) + subtitle URLs |
| GET | `/lessons/feed/home` | Bosh sahifa feed: { newest, continueWatching, popular, myGroups, newPeople, promoVideos } |
| POST | `/lessons/:id/progress` | Pozitsiya saqlash (debounced, har 10s) |
| POST | `/lessons/:id/view` | Ko'rilgan deb belgilash (50% ko'rilganda yoki tugaganda, per user per kun deduplication) |

### 8.5. "Mening saytim" — PromoVideo

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/me/promo-videos` | Mening barcha promo videolarim |
| GET | `/me/promo-videos/:id` | Bitta video + signed HLS URL |
| POST | `/me/promo-videos/:id/enable-sharing` | Public link yoqish (shareToken generate) |
| POST | `/me/promo-videos/:id/disable-sharing` | Public link o'chirish |
| GET | `/users/:username/promo-videos` | Boshqa user'ning **ulashilgan** promo videolari (faqat `isShareable=true`) |
| GET | `/share/promo/:token` | Public sahifa ma'lumotlari (auth yo'q) |

### 8.6. Xabarlar (DM)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/messages/threads` | Suhbatlar ro'yxati + oxirgi xabar + o'qilmagan soni |
| GET | `/messages/with/:username` | Tarix (cursor pagination) |
| POST | `/messages` | Xabar (REST fallback, asosiy WebSocket) |
| POST | `/messages/:id/reactions` | Reaktsiya qo'shish `{ emoji }` |
| DELETE | `/messages/:id/reactions/:emoji` | Reaktsiya olib tashlash |
| DELETE | `/messages/:id` | O'chirish (24 soat ichida) |
| POST | `/messages/upload` | Media yuklash (image/audio/video/video_note) — multipart, max 100MB |

### 8.7. Guruhlar (Telegram-style)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/groups` | Yangi guruh yaratish `{ name, description?, avatarUrl?, visibility, industryId?, sectionId? }` |
| GET | `/groups/me` | Mening barcha guruhlarim (faol a'zoligi) |
| GET | `/groups/search?q=...&industryId=...&sectionId=...` | Public guruhlarni qidirish |
| GET | `/groups/:id` | Guruh metadata + a'zo ekanligi |
| PATCH | `/groups/:id` | Sozlamalarni o'zgartirish (faqat OWNER/ADMIN) |
| DELETE | `/groups/:id` | Guruhni o'chirish (faqat OWNER) |
| POST | `/groups/:id/members` | A'zo qo'shish (taklif) — username yoki userId |
| DELETE | `/groups/:id/members/:userId` | A'zoni chiqarish (faqat OWNER/ADMIN) |
| POST | `/groups/:id/leave` | O'zi chiqish (OWNER avval transfer qilishi kerak) |
| POST | `/groups/:id/transfer-ownership` | `{ newOwnerId }` (faqat OWNER) |
| POST | `/groups/:id/invites` | Invite link yaratish `{ maxUses?, expiresAt? }` |
| GET | `/groups/:id/invites` | Faol invite linklar (faqat OWNER/ADMIN) |
| DELETE | `/groups/:id/invites/:inviteId` | Linkni bekor qilish |
| POST | `/groups/join/:token` | Invite link orqali qo'shilish |
| GET | `/groups/:id/messages` | Tarix (cursor pagination) |
| POST | `/groups/:id/messages` | Yuborish (asosiy WebSocket) |
| POST | `/groups/:id/messages/:msgId/reactions` | Reaktsiya |
| DELETE | `/groups/:id/messages/:msgId/reactions/:emoji` | Olib tashlash |
| DELETE | `/groups/:id/messages/:msgId` | Xabarni o'chirish (egasi 24 soat, ADMIN doimo) |
| POST | `/groups/:id/read` | Oxirgi o'qilgan vaqtni belgilash |

### 8.8. Bildirishnomalar

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/notifications` | Ro'yxat (paginate, filter o'qilgan) |
| POST | `/notifications/read-all` | Hammasini o'qilgan deb belgilash |
| POST | `/notifications/:id/read` | Bittasi |
| GET | `/notifications/unread-count` | Soni (badge uchun) |
| GET | `/me/notification-preferences` | Push/in-app preferences |
| PATCH | `/me/notification-preferences` | Yangilash |
| POST | `/push/subscribe` | Web Push subscription |
| DELETE | `/push/subscribe` | Bekor qilish |
| GET | `/push/vapid-public-key` | VAPID kalit |

### 8.9. Global qidiruv

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/search?q=...` | Global qidiruv (Cmd+K modal): darslar + tadbirkorlar + public guruhlar (har biridan top 5) |

### 8.10. Admin endpointlari

| Method | Endpoint | Rol |
|--------|----------|-----|
| GET | `/admin/users` | Filter, search, paginate — ADMIN |
| GET | `/admin/users/:id` | To'liq ma'lumot — ADMIN |
| PATCH | `/admin/users/:id` | Profilni tahrirlash — ADMIN |
| POST | `/admin/users/:id/reset-password` | Yangi vaqtinchalik parol generate va telegram'da admin'ga ko'rsatish — ADMIN |
| DELETE | `/admin/users/:id` | Soft delete (30 kun) — ADMIN |
| POST | `/admin/lessons` | Video metadata + 4 til titles/descriptions/subtitles + upload URL — ADMIN |
| PATCH | `/admin/lessons/:id` | Tahrirlash — ADMIN |
| DELETE | `/admin/lessons/:id` | O'chirish — ADMIN |
| POST | `/admin/promo-videos` | User profiliga PromoVideo biriktirish (4 til metadata + subtitle) — ADMIN |
| PATCH | `/admin/promo-videos/:id` | Tahrirlash — ADMIN |
| DELETE | `/admin/promo-videos/:id` | O'chirish — ADMIN |
| POST | `/admin/messages/direct` | Foydalanuvchiga maxsus xabar — ADMIN |
| POST | `/admin/announcements` | Hammaga e'lon — ADMIN |
| GET | `/admin/audit-logs` | Audit log — SUPER_ADMIN |
| GET | `/admin/stats/overview` | Dashboard ma'lumotlari — ADMIN |

### 8.10. Rate limiting

| Endpoint guruhi | Limit | Sabab |
|------------------|-------|-------|
| `/auth/register`, `/auth/login` | 5/daqiqa/IP | Brute-force |
| `/auth/verify-otp` | 5 urinish/OTP, 10/soat/telefon | OTP himoya |
| `/auth/resend-otp` | 1/daqiqa, 3/soat/telefon | SMS xarajat himoyasi |
| `/messages` POST | 30/daqiqa/user | Spam |
| `/uploads/*` | 10/soat/user | Resurs |
| Boshqa GET | 100/daqiqa/user | Umumiy |
| Admin GET | 200/daqiqa/admin | Bo'sh |

Limitlar Redis'da `INCR + EXPIRE` orqali, `Retry-After` header bilan.

### 8.11. Pagination

Cursor-based pagination (offset emas, chunki feed va xabarlarda yangi yozuvlar paydo bo'ladi):

```
GET /messages/with/abc?limit=20&cursor=01HXYZ...
→
{
  "data": [...],
  "meta": {
    "nextCursor": "01HABC...",
    "hasMore": true
  }
}
```

### 8.12. OpenAPI

Swagger UI: `/api/docs` (staging/dev). NestJS dekoratorlari orqali avtomatik. Production'da YAML eksport qilinadi va GitHub'da saqlanadi.

---

## 9. Autentifikatsiya va xavfsizlik

### 9.1. Ro'yxatdan o'tish jarayoni

```
┌─────────┐    1. POST /auth/register       ┌──────────┐
│ Browser │ ──────────────────────────────► │   API    │
└─────────┘    { phone, password }          └──────────┘
                                                   │
                                                   │ 2. Validate, Argon2id hash
                                                   │ 3. OTP yaratish (6 raqam, 5 daqiqa)
                                                   │ 4. otpToken (signed, 10 daqiqa)
                                                   │ 5. SMS yuborish
                                                   ▼
                                            ┌──────────┐
                                            │ Eskiz.uz │
                                            └──────────┘
                                                   │
                                                   ▼
                                            ┌──────────┐
                                            │   User   │ (SMS qabul qiladi)
                                            └──────────┘
                                                   │
┌─────────┐   6. POST /auth/verify-otp       ┌──────────┐
│ Browser │ ──────────────────────────────► │   API    │
└─────────┘   { otpToken, code }            └──────────┘
                                                   │
                                                   │ 7. Tasdiqlash
                                                   │ 8. User yaratish
                                                   │ 9. JWT (access 15min, refresh 30d)
                                                   │ 10. httpOnly cookie set
                                                   ▼
                                            { user, accessToken }
```

### 9.2. JWT strategiyasi

| Token | Davomiylik | Saqlash | Foydalanish |
|-------|-----------|---------|-------------|
| Access | 15 daqiqa | httpOnly + Secure cookie | API so'rovlari |
| Refresh | 30 kun | httpOnly + Secure + SameSite=Strict | Access yangilash |

**Refresh Token Rotation (zamonaviy xavfsizlik):**

- Har refresh'da **yangi refresh token** beriladi, eskisi bekor qilinadi
- Bekor qilingan token qayta ishlatilsa → **butun token oilasi bekor qilinadi** + audit log
- Bu **token theft**'ni aniqlash mexanizmi

### 9.3. Parol siyosati

| Talab | Qiymat |
|-------|--------|
| Min uzunlik | 8 belgi |
| Murakkablik | Kamida 1 raqam, 1 katta harf |
| Maksimal uzunlik | 128 (DoS himoya) |
| Hash algoritmi | **Argon2id** |
| Memory cost | 64 MiB |
| Time cost | 3 |
| Parallelism | 4 |
| Salt | 16 bayt random |
| Common passwords | `zxcvbn` skor ≥ 3 talab |

### 9.4. RBAC (Role-Based Access Control)

| Rol | Imkoniyatlar |
|-----|--------------|
| `USER` | O'z profilini boshqarish, video ko'rish, chat |
| `ADMIN` | Userlarni ko'rish/tahrirlash, video yuklash, sayt biriktirish |
| `SUPER_ADMIN` | Hammasi + audit log + admin yaratish |

NestJS guard:

```typescript
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Post('users/:id')
adminAction() { ... }
```

### 9.5. Input validatsiya

**Har endpoint** — Zod schema yoki class-validator. Hech qachon ishonmasdan trust:

- SQL injection — Prisma parametrizatsiya
- XSS — frontend React avto-escape, server JSON faqat
- Path traversal — fayl yo'llarni `path.normalize` + `startsWith(STORAGE_ROOT)`
- File upload — magic bytes orqali turini tekshirish (faqat extension emas)
- ReDoS — regex'lar tekshirilgan

### 9.6. Maxfiy ma'lumotlar

| Ma'lumot | Saqlash |
|----------|---------|
| Parollar | Argon2id hash |
| OTP kodlari | bcrypt hash, 5 daqiqa TTL |
| Refresh tokenlar | SHA-256 hash |
| Telefon raqamlari | Plain (DB), userlarga ko'rinmaydi |
| Sirlar (.env) | Server FS, 0600 ruxsat |

### 9.7. CORS

```javascript
{
  origin: [
    'https://biznesjon.uz',
    'https://www.biznesjon.uz',
    /^https:\/\/.*\.biznesjon\.uz$/,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Request-Id'],
  maxAge: 86400,
}
```

### 9.8. Security headers

```
Content-Security-Policy: default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  media-src 'self' https://cdn.biznesjon.uz;
  connect-src 'self' wss://api.biznesjon.uz https://api.biznesjon.uz;
  frame-ancestors 'none';
  upgrade-insecure-requests;
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(self), geolocation=()
```

### 9.9. OWASP Top 10 muvofiqlik

| Risk | Yumshatish |
|------|------------|
| A01 Broken Access Control | RBAC + RLS-style queries (har query'da `userId`) |
| A02 Cryptographic Failures | Argon2id, TLS 1.3, secure cookie |
| A03 Injection | Prisma ORM, Zod validatsiya |
| A04 Insecure Design | Threat modeling, secure-by-default |
| A05 Security Misconfiguration | Helmet, CSP, audit |
| A06 Vulnerable Components | Dependabot + Snyk |
| A07 Auth Failures | Rate limit, MFA via OTP |
| A08 Software Integrity | Signed deploys, SRI |
| A09 Logging Failures | Pino + Loki + Sentry + audit log |
| A10 SSRF | URL validatsiya, allowlist |

---

## 10. Video infratuzilmasi

> **Eng kritik bo'lim** — VPSda fayl tizimida HLS streaming.

### 10.1. To'liq pipeline

```
┌─────────────┐
│   ADMIN     │  1. Video yuklaydi (chunked, max 5 GB)
│  (browser)  │
└──────┬──────┘
       │ POST /admin/uploads/video (TUS protocol yoki chunked)
       ▼
┌──────────────────┐
│   API server     │  2. /var/biznesjon/storage/uploads/{tempId}/source.{ext}
│   (NestJS)       │  3. ffprobe → metadata (duration, codec, resolution)
│                  │  4. DB: Lesson { status: PROCESSING }
│                  │  5. BullMQ: enqueue video-transcode { lessonId, sourcePath }
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Worker (BullMQ) │  6. FFmpeg ishga tushadi (sequential 480→720→1080)
│   FFmpeg         │
└──────────────────┘
       │
       ├── Thumbnail: ffmpeg -ss {25%} -frames 1 → thumb_1.jpg (3 ta)
       ├── 480p HLS: 700 kbps  → /storage/videos/{id}/480p/playlist.m3u8 + .ts
       ├── 720p HLS: 1500 kbps → /storage/videos/{id}/720p/...
       ├── 1080p HLS: 3000 kbps → /storage/videos/{id}/1080p/...
       └── master.m3u8 yaratiladi
       │
       │ 7. DB: Lesson { status: PUBLISHED, hlsManifest: '/storage/videos/{id}/master.m3u8' }
       │ 8. Source fayl Backblaze B2'ga ko'chiriladi (backup), VPSdan o'chiriladi
       │ 9. Cache invalidate (Redis)
       │ 10. Bildirishnoma: bo'limga "yangi dars chiqdi"
       ▼
┌──────────────────┐
│  FOYDALANUVCHI   │  11. /lessons/123 sahifa
│   Browser        │  12. HLS.js → master.m3u8 (Cloudflare cached)
│                  │  13. ABR: tarmoq tezligiga qarab sifat tanlash
│                  │  14. .ts segmentlar 6 sekunddan
│                  │  15. POST /lessons/123/progress (har 10 sek, debounced)
└──────────────────┘
```

### 10.2. FFmpeg konfiguratsiyasi

**720p variant misol:**

```bash
ffmpeg -i source.mp4 \
  -c:v libx264 -preset medium -crf 23 \
  -profile:v main -level 4.0 \
  -vf "scale=-2:720" \
  -b:v 1500k -maxrate 1600k -bufsize 3000k \
  -g 48 -keyint_min 48 -sc_threshold 0 \
  -c:a aac -b:a 128k -ar 48000 \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_segment_filename "720p/seg_%04d.ts" \
  -f hls \
  720p/playlist.m3u8
```

**Master playlist (master.m3u8):**

```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=830000,RESOLUTION=854x480,CODECS="avc1.4d401e,mp4a.40.2"
480p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1700000,RESOLUTION=1280x720,CODECS="avc1.4d401f,mp4a.40.2"
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3300000,RESOLUTION=1920x1080,CODECS="avc1.4d4028,mp4a.40.2"
1080p/playlist.m3u8
```

### 10.3. BullMQ worker

```typescript
// workers/video-transcode.worker.ts
import { Worker } from 'bullmq';

const worker = new Worker(
  'video-transcode',
  async (job) => {
    const { lessonId, sourcePath } = job.data;
    const outputDir = `/var/biznesjon/storage/videos/${lessonId}`;

    await mkdir(outputDir, { recursive: true });

    // Progress 0–10%: thumbnails
    await generateThumbnails(sourcePath, outputDir);
    await job.updateProgress(10);

    // 10–40%: 480p
    await transcodeVariant(sourcePath, outputDir, '480p', 700);
    await job.updateProgress(40);

    // 40–70%: 720p
    await transcodeVariant(sourcePath, outputDir, '720p', 1500);
    await job.updateProgress(70);

    // 70–95%: 1080p
    await transcodeVariant(sourcePath, outputDir, '1080p', 3000);
    await job.updateProgress(95);

    // Master playlist
    await writeMasterPlaylist(outputDir);

    // DB update
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: 'PUBLISHED',
        hlsManifest: `/storage/videos/${lessonId}/master.m3u8`,
        publishedAt: new Date(),
      },
    });

    // Source backup → Backblaze B2
    await uploadToB2(sourcePath, `originals/${lessonId}.${ext}`);
    await unlink(sourcePath);

    await job.updateProgress(100);
  },
  {
    connection: redisConnection,
    concurrency: 1, // FFmpeg CPU-intensive, parallel emas
    limiter: { max: 1, duration: 1000 },
  },
);

worker.on('failed', async (job, err) => {
  await prisma.lesson.update({
    where: { id: job.data.lessonId },
    data: { status: 'FAILED' },
  });
  Sentry.captureException(err, { extra: job.data });
});
```

### 10.4. Nginx konfiguratsiyasi (video xizmati)

```nginx
# /etc/nginx/sites-available/biznesjon-storage
server {
  listen 443 ssl http2;
  server_name cdn.biznesjon.uz;

  ssl_certificate     /etc/letsencrypt/live/cdn.biznesjon.uz/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/cdn.biznesjon.uz/privkey.pem;
  ssl_protocols       TLSv1.2 TLSv1.3;

  root /var/biznesjon/storage;

  # CORS — HLS.js range requests uchun
  add_header Access-Control-Allow-Origin "*" always;
  add_header Access-Control-Allow-Headers "Range" always;
  add_header Access-Control-Allow-Methods "GET, OPTIONS" always;

  # Hotlink himoyasi (Cloudflare cache + biznesjon.uz domenlari)
  valid_referers none blocked
                 *.biznesjon.uz biznesjon.uz
                 *.cloudflare.com;

  # Videolar
  location /videos/ {
    if ($invalid_referer) { return 403; }

    location ~* \.m3u8$ {
      expires 5s;
      add_header Cache-Control "public, max-age=5";
    }

    location ~* \.ts$ {
      expires 7d;
      add_header Cache-Control "public, immutable, max-age=604800";
    }

    location ~* \.(jpg|webp)$ {
      expires 30d;
      add_header Cache-Control "public, max-age=2592000";
    }
  }

  # Avatarlar va boshqa media
  location /avatars/ {
    expires 7d;
    add_header Cache-Control "public, max-age=604800";
  }

  # Mening saytim — alohida — keyingi bo'lim
  # /sites/ uchun maxfiy auth subrequest

  # Performance
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;

  # Yuklab olishni qiyinlashtirish
  add_header Content-Disposition "inline";
}
```

### 10.5. Cloudflare CDN sozlash

| Sozlama | Qiymat | Sabab |
|---------|--------|-------|
| Caching Level | Standard | URL bo'yicha kesh |
| Browser Cache TTL | Respect Existing | Origin'ga ishonish |
| Edge Cache TTL `.ts` | 7 kun | Segmentlar o'zgarmaydi |
| Edge Cache TTL `.m3u8` | 5 sek | Master tez yangilansin |
| Bot Fight Mode | On | Scraping himoya |
| HTTP/3 | On | Tezlik |
| Brotli | On | Compression |
| Page Rule | `cdn.biznesjon.uz/videos/*.ts` → Cache Everything, TTL 7d | Egress tejash |
| WAF Rule | `cf.threat_score > 30` → Challenge | Bot himoya |

**Natija:** UZ foydalanuvchilari uchun video Cloudflare PoP'idan keladi (~20–50ms), VPS faqat birinchi marta hit oladi.

### 10.6. Saqlash hajmi rejasi

| Sifat | Bitrate | MB/daqiqa |
|-------|---------|-----------|
| 480p | 700 kbps | ~5.3 |
| 720p | 1500 kbps | ~11.3 |
| 1080p | 3000 kbps | ~22.5 |
| **Jami** | — | **~39 MB/daqiqa** |

| Stsenariy | Hajm |
|-----------|------|
| 100 ta dars × 20 daqiqa | ~78 GB |
| 500 ta dars × 20 daqiqa | ~390 GB |
| 1000 ta dars × 20 daqiqa | ~780 GB |

> Contabo VPS L = **800 GB NVMe** — MVP va 1-yil uchun yetarli.
> Original fayllar B2'da saqlanadi (qayta transcode kerak bo'lsa).

### 10.7. Yuklab olishdan himoya (best-effort)

| Texnika | Effekt |
|---------|--------|
| Hotlink protection (Referer) | Oddiy embedlash to'sib qo'yiladi |
| Signed URLs (JWT, 5 daqiqa TTL) | URL nusxalansa ham tezda muddati o'tadi |
| `Content-Disposition: inline` | "Save as" qiyinlashadi |
| `oncontextmenu` o'chirilgan | UI darajasida |
| Browser fingerprinting (kelajak) | Sessiya bog'lash |

> **Ochiq haqiqat:** HLS oqim har qanday foydalanuvchi tomonidan yt-dlp orqali yuklab olinishi mumkin. To'liq himoya faqat **DRM (Widevine)** bilan, MVP'da kerak emas.

### 10.8. Worker resurs ehtiyoji

| Resurs | Min |
|--------|-----|
| CPU | 4 yadro (FFmpeg parallel) |
| RAM | 4–8 GB |
| Disk I/O | NVMe SSD |
| Concurrency | 1 ish bir vaqtda (CPU-bound) |

20-daqiqalik 1080p video transcoding ~15–20 daqiqa oladi. Bir kunda ~50 video.

---

## 11. Real-time tizim

### 11.1. Socket.io arxitekturasi

```
┌─────────────┐
│   Browser   │
│  socket.io- │
│   client    │
└──────┬──────┘
       │ WSS (wss://api.biznesjon.uz/ws)
       │ Cookie: refreshToken
       │ Auth: handshake bilan accessToken
       ▼
┌─────────────────┐
│     Nginx       │  proxy_pass + Upgrade headers
└──────┬──────────┘
       ▼
┌─────────────────┐
│  Socket.io      │
│  Gateway        │
│  (NestJS)       │
└──────┬──────────┘
       ▼
┌─────────────────┐
│  Redis Adapter  │  ← Pub/Sub (multi-node uchun)
│   (ioredis)     │
└─────────────────┘
```

### 11.2. Connection lifecycle

```typescript
// gateways/chat.gateway.ts
@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: ['https://biznesjon.uz'], credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  async handleConnection(socket: Socket) {
    // 1. JWT verify (handshake.auth.token)
    const user = await this.authService.verifyToken(socket.handshake.auth.token);
    if (!user) return socket.disconnect();

    socket.data.user = user;

    // 2. Rooms join
    socket.join(`user:${user.id}`);

    // Foydalanuvchining barcha guruhlariga avtomatik qo'shilish (faol a'zoligi)
    const activeGroups = await this.prisma.groupMembership.findMany({
      where: { userId: user.id, leftAt: null },
      select: { groupId: true },
    });
    for (const { groupId } of activeGroups) {
      socket.join(`group:${groupId}`);
    }

    socket.join('presence');

    // 3. Presence update
    await this.presence.setOnline(user.id);
    socket.broadcast.to('presence').emit('presence:update', {
      userId: user.id,
      online: true,
    });
  }

  async handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    if (!user) return;
    await this.presence.setOffline(user.id);
    socket.broadcast.to('presence').emit('presence:update', {
      userId: user.id,
      online: false,
      lastSeen: new Date(),
    });
  }
}
```

> **Muhim:** Bo'limga avtomatik qo'shilish YO'Q (eski spec'dan farqli). Foydalanuvchi faqat **o'zi qo'shilgan guruhlar** room'lariga ulanadi. Yangi guruhga qo'shilganda `socket.join` xizmat darajasida triggered bo'ladi (joinGroup service event emit qiladi).

### 11.3. Eventlar (kontrakt)

**Klient → Server (acknowledge bilan):**

| Event | Payload | Acknowledge |
|-------|---------|-------------|
| `message:send` | `{ recipientUsername, type, body?, mediaUrl?, mediaMeta?, replyToId? }` | `{ messageId, status, createdAt }` |
| `message:typing` | `{ recipientUsername }` | — |
| `message:read` | `{ messageIds: [] }` | — |
| `group:send` | `{ groupId, type, body?, mediaUrl?, mediaMeta?, replyToId?, mentions? }` | `{ messageId, createdAt }` |
| `group:typing` | `{ groupId }` | — |
| `group:read` | `{ groupId, lastReadMessageId }` | — |

**Server → Klient (push):**

| Event | Payload | Kim oladi |
|-------|---------|-----------|
| `message:new` | `{ message }` | Recipient va sender (multi-tab uchun) |
| `message:typing` | `{ from, isTyping }` | Recipient |
| `message:status` | `{ messageId, status: 'DELIVERED' \| 'READ' }` | Sender |
| `message:reaction:added` | `{ messageId, userId, emoji }` | Sender + recipient |
| `message:reaction:removed` | `{ messageId, userId, emoji }` | Sender + recipient |
| `message:deleted` | `{ messageId }` | Recipient |
| `group:new` | `{ groupId, message }` | Barcha guruh a'zolari |
| `group:mention` | `{ groupId, message, mentionedUserIds }` | Faqat mention bo'lganlar (push uchun) |
| `group:member:joined` | `{ groupId, member }` | Barcha a'zolar |
| `group:member:left` | `{ groupId, userId }` | Barcha a'zolar |
| `group:member:role-changed` | `{ groupId, userId, role }` | Barcha a'zolar |
| `group:updated` | `{ groupId, changes }` | Barcha a'zolar |
| `group:deleted` | `{ groupId }` | Barcha a'zolar |
| `group:reaction:added` | `{ groupId, messageId, userId, emoji }` | Barcha a'zolar |
| `notification:new` | `{ notification }` | Tegishli user |
| `presence:update` | `{ userId, online, lastSeen }` | Suhbatdoshlar |

### 11.3a. Yangi guruh qo'shilganda — socket join

```typescript
// service: groupsService.joinGroup
async joinGroup(userId: string, groupId: string) {
  // Transaction: memberCount tekshirish (200 limit)
  const result = await this.prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${groupId}))`;
    const group = await tx.groupChat.findUnique({ where: { id: groupId } });
    if (group.memberCount >= 200) throw new ConflictError('groups.maxReached');

    await tx.groupMembership.upsert({
      where: { userId_groupId: { userId, groupId } },
      create: { userId, groupId, role: 'MEMBER' },
      update: { leftAt: null }, // qaytib kirsa
    });
    await tx.groupChat.update({
      where: { id: groupId },
      data: { memberCount: { increment: 1 } },
    });
    return tx.groupMembership.findUnique({ where: { userId_groupId: { userId, groupId } } });
  });

  // Foydalanuvchining barcha socket'larini guruh room'iga qo'shish
  const sockets = await this.io.in(`user:${userId}`).fetchSockets();
  for (const sock of sockets) sock.join(`group:${groupId}`);

  // Barcha a'zolarga event
  this.io.to(`group:${groupId}`).emit('group:member:joined', { groupId, member: result });
}
```

> **Lock:** `pg_advisory_xact_lock` — bir vaqtda 2 user bir guruhga qo'shilsa, memberCount race condition'siz tekshiriladi.

### 11.4. Presence tizimi

**Redis sxemasi:**

```
SET presence:{userId} '{"online":true,"lastSeen":"2026-..."}'  EX 60
```

- Heartbeat har 30 sekund
- TTL 60 sekund → heartbeat yo'qolsa offline
- `GET presence:{userId}` chat ochilganda
- `presence:update` event broadcast — faqat suhbatdoshlarga

### 11.5. Reliability

| Muammo | Yechim |
|--------|--------|
| Connection drop | Socket.io avto-reconnect (exponential backoff) |
| Xabar yo'qolishi | REST fallback: `POST /messages` (xuddi shu effekt) |
| Multi-tab | `user:{userId}` room — barcha tab xabar oladi |
| Multi-device | Refresh token har qurilma uchun |
| Spam | Rate limit (Redis): 30 xabar/daqiqa |

---

## 12. Fayl saqlash strategiyasi

### 12.1. Filesystem tuzilishi

```
/var/biznesjon/
├── storage/
│   ├── videos/                          # HLS dars videolari
│   │   └── {lessonId}/
│   │       ├── master.m3u8
│   │       ├── 480p/, 720p/, 1080p/
│   │       ├── subtitles/               # uz-Latn.vtt, uz-Cyrl.vtt, ru.vtt, en.vtt
│   │       └── thumbnails/
│   │
│   ├── promo-videos/                    # "Mening saytim" PromoVideo'lar
│   │   └── {promoVideoId}/
│   │       ├── master.m3u8
│   │       ├── 480p/, 720p/, 1080p/
│   │       ├── subtitles/               # 4 ta VTT
│   │       └── thumbnails/
│   │
│   ├── avatars/                         # Profil rasmlari
│   │   └── {userId}/
│   │       ├── original.{ext}
│   │       ├── 256.webp
│   │       └── 64.webp
│   │
│   ├── messages/                        # Chat media
│   │   ├── images/
│   │   │   └── {YYYY}/{MM}/{messageId}.{ext}
│   │   ├── audio/                       # Ovozli xabar (Opus)
│   │   │   └── {YYYY}/{MM}/{messageId}.opus
│   │   ├── video/                       # Oddiy video
│   │   │   └── {YYYY}/{MM}/{messageId}.mp4
│   │   └── video-notes/                 # Aylanacha (yumaloq) video
│   │       └── {YYYY}/{MM}/{messageId}.mp4
│   │
│   ├── group-avatars/                   # Guruh chat avatarlari
│   │   └── {groupId}.webp
│   │
│   └── uploads/                         # Vaqtinchalik
│       └── {tempId}/
│
├── backups/                             # Mahalliy backup (kunlik)
│   ├── postgres/
│   │   └── biznesjon_{YYYY-MM-DD}.dump
│   └── redis/
│
└── logs/                                # Application logs (Promtail o'qiydi)
    ├── api/
    └── nginx/
```

### 12.2. Ruxsatlar

```bash
# Foydalanuvchilar
useradd --system --no-create-home --shell /usr/sbin/nologin biznesjon

# Egalar
chown -R biznesjon:biznesjon /var/biznesjon/storage
chmod -R 750 /var/biznesjon/storage

# Nginx faqat o'qiydi
usermod -aG biznesjon www-data

# .env fayl
chmod 600 /var/biznesjon/.env
chown biznesjon:biznesjon /var/biznesjon/.env
```

### 12.3. Hajm boshqaruvi

| Resurs | Saqlash muddati | Cleanup mexanizmi |
|--------|-----------------|-------------------|
| Vaqtinchalik upload | 24 soat | Cron worker |
| Chat media | 30 kun | Cleanup worker (kunlik) |
| Bildirishnomalar | 30 kun | DB + worker |
| Audit log | 1 yil | DB + worker |
| Soft-deleted user | 30 kun | DB cron |
| Application logs | 14 kun | Loki retention |
| Original videolar | Doimiy (B2'da) | — |

### 12.4. Disk monitoring

| Threshold | Harakat |
|-----------|---------|
| > 70% | Email ogohlantirish |
| > 85% | Telegram alert + Grafana panel red |
| > 95% | Critical alert + auto-cleanup eski uploads |

Prometheus `node_exporter` + Grafana alert rule.

---

## 13. Bildirishnomalar tizimi

### 13.1. Kanallar

| Kanal | Texnologiya | Qo'llanish |
|-------|-------------|------------|
| In-app real-time | Socket.io | Foydalanuvchi onlayn |
| In-app saqlanadi | DB `Notification` jadvali | Hammasi |
| Web Push | VAPID + Service Worker | Foydalanuvchi ruxsat berdi |
| Email (kelajak) | Resend | Faqat kritik |

### 13.2. Web Push subscribe

```typescript
// frontend
async function subscribeToPush() {
  const reg = await navigator.serviceWorker.ready;
  const { vapidPublicKey } = await api.push.getPublicKey();
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
  await api.push.subscribe({
    endpoint: sub.endpoint,
    p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
    auth: arrayBufferToBase64(sub.getKey('auth')),
    userAgent: navigator.userAgent,
  });
}
```

### 13.3. Server push

```typescript
// infrastructure/push/push.service.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:hello@biznesjon.uz',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

async sendToUser(userId: string, payload: PushPayload) {
  const subs = await this.prisma.pushSubscription.findMany({ where: { userId } });
  await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
      ).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Endpoint expired → o'chirish
          return this.prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      })
    ),
  );
}
```

### 13.4. Service Worker — push handler

```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { link: data.link },
      tag: data.tag,        // bir xil tag bilan eski almashtiriladi
      renotify: false,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      const link = event.notification.data.link;
      for (const client of clients) {
        if (client.url.includes(link)) return client.focus();
      }
      return self.clients.openWindow(link);
    })
  );
});
```

### 13.5. Bildirishnoma turlari

| Type | Kim oladi | Trigger |
|------|-----------|---------|
| `NEW_MESSAGE` | DM oluvchisi | Yangi shaxsiy xabar |
| `GROUP_MENTION` | Mention'langan user | Guruh chatda @mention |
| `GROUP_INVITE` | Taklif olgan user | Private guruhga taklif yuborildi |
| `PROMO_VIDEO_PUBLISHED` | Egasi | Admin "Mening saytim" videosi biriktirdi |
| `NEW_LESSON` | Bo'lim a'zolari | Admin dars videosi published |
| `ADMIN_ANNOUNCEMENT` | Hamma | Admin e'lon yubordi |
| `ACCOUNT_RESTORED` | Egasi | 30 kun ichida login orqali hisob tiklandi |

### 13.6. Foydalanuvchi sozlamalari

`NotificationPreferences` jadval (har user uchun 1:1):

```typescript
{
  pushNewMessage:   boolean,   // DM
  pushGroupMention: boolean,   // @mention
  pushNewLesson:    boolean,   // Yangi dars bo'limga
  pushPromoVideo:   boolean,   // "Mening saytim" yangi video
  pushAnnouncement: boolean,   // Admin e'lonlari
  inAppAll:         boolean,   // In-app bildirishnoma umuman
}
```

Har push kanal uchun alohida toggle Sozlamalar > Bildirishnomalar sahifasida. In-app default har doim yoqilgan (foydalanuvchi panel ichida ko'radi).

---

## 14. Qidiruv va filtratsiya

### 14.1. MVP: PostgreSQL Full-Text Search

```sql
-- Migration
ALTER TABLE user_profiles
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(first_name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(last_name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(business_name, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(city, '')), 'C')
) STORED;

CREATE INDEX user_search_idx ON user_profiles USING gin(search_vector);
```

> `simple` config — kirill, lotin va rusni bir xil ishlovga oladi (har til uchun alohida config'dan ko'ra MVP uchun amaliy).

### 14.2. Tartiblash mantiqi

```sql
-- Tadbirkorlarni topish
WITH user_section AS (
  SELECT industry_id, section_id FROM users WHERE id = $1
)
SELECT u.*,
  CASE
    WHEN u.section_id = (SELECT section_id FROM user_section) THEN 1
    WHEN u.industry_id = (SELECT industry_id FROM user_section) THEN 2
    ELSE 3
  END AS rank
FROM users u
LEFT JOIN user_profiles p ON p.user_id = u.id
WHERE u.deleted_at IS NULL
  AND ($2::text IS NULL OR p.search_vector @@ plainto_tsquery('simple', $2))
  AND ($3::text IS NULL OR u.section_id = $3)
ORDER BY rank, u.last_active_at DESC NULLS LAST
LIMIT 20 OFFSET 0;
```

### 14.3. Filterlar

- Soha (industry)
- Bo'lim (section)
- Shahar (city)
- Onlayn ekanligi (kelajakda)

### 14.4. Skala bosqich

50K+ user'da — **Meilisearch** o'rnatish:

- Self-hosted, kichik xotira
- Typo-tolerant
- Kirill/lotin/rus yaxshi
- 1ms javob vaqti

Migration plani: foydalanuvchi yaratilganda BullMQ orqali Meilisearch'ga indekslash, eski PostgreSQL FTS bir muddat parallel ishlatiladi.

---

## 15. Lokalizatsiya (i18n)

### 15.1. Tillar — 4 ta

| Til | Kod | Default | URL prefix |
|-----|-----|---------|-----------|
| O'zbek (lotin) | `uz-Latn` | ✅ | `/uz-Latn/...` |
| O'zbek (kirill) | `uz-Cyrl` | — | `/uz-Cyrl/...` |
| Русский | `ru` | — | `/ru/...` |
| English | `en` | — | `/en/...` |

### 15.2. Frontend (next-intl)

```
src/messages/
├── uz-Latn.json
├── uz-Cyrl.json
├── ru.json
└── en.json
```

Misol (`uz-Latn.json`):

```json
{
  "auth": {
    "register": {
      "title": "Ro'yxatdan o'tish",
      "phoneLabel": "Telefon raqami",
      "passwordHint": "Kamida 8 belgi, 1 raqam, 1 katta harf",
      "submit": "Davom etish"
    },
    "errors": {
      "phoneTaken": "Bu raqam allaqachon ro'yxatdan o'tgan",
      "weakPassword": "Parol talablariga javob bermaydi",
      "usernameTaken": "Bu username band, boshqasini tanlang"
    }
  },
  "home": {
    "mySite": "Mening saytim",
    "continueWatching": "Davom ettirish",
    "newLessons": "Yangi darslar",
    "popularLessons": "Mashhur darslar",
    "myGroups": "Mening guruhlarim",
    "newEntrepreneurs": "Yangi tadbirkorlar"
  },
  "groups": {
    "create": "Guruh yaratish",
    "join": "Qo'shilish",
    "members": "{count, plural, one {# a'zo} other {# a'zo}}",
    "maxReached": "Guruh to'lgan (max 200 a'zo)"
  },
  "lesson": {
    "subtitleOff": "Subtitle o'chirilgan",
    "audioInUzbek": "Audio o'zbek tilida"
  }
}
```

### 15.3. URL strategiyasi va default

```
https://biznesjon.uz/uz-Latn/home   ← default lotin
https://biznesjon.uz/uz-Cyrl/home
https://biznesjon.uz/ru/home
https://biznesjon.uz/en/home
```

**Yo'lni aniqlash tartibi:**
1. URL prefix bor bo'lsa — shu
2. Auth bo'lsa — `User.language`
3. Cookie `NEXT_LOCALE`
4. `Accept-Language` header
5. Default — `uz-Latn`

### 15.4. Backend — server tarjima qilmaydi

Sohalar va bo'lim nomlari `names` JSON ustunda 4 til bilan:

```json
{
  "uz-Latn": "Tadbirkorlik",
  "uz-Cyrl": "Тадбиркорлик",
  "ru": "Предпринимательство",
  "en": "Entrepreneurship"
}
```

API javobi — kalit qaytaradi, frontend tarjima qiladi:

```json
{
  "type": "https://biznesjon.uz/errors/validation",
  "title": "Validation failed",
  "status": 422,
  "errorCode": "auth.errors.phoneTaken",
  "errors": [{ "field": "phone", "code": "invalid_format" }]
}
```

### 15.5. Video kontent — audio o'zbek, subtitle 4 til

**Asosiy printsip:**
- **Audio** har dars uchun yagona — o'zbek tilida (lotin yoki kirill talaffuz farqi yo'q — bir audio)
- **Sarlavha va tavsif** har dars uchun 4 tilda (Lesson `titles`, `descriptions` JSON)
- **Subtitle** har dars uchun 4 ta VTT fayl: `uz-Latn`, `uz-Cyrl`, `ru`, `en`
- Foydalanuvchi tilini UI'da o'zgartirsa, **avtomatik shu til subtitlesi yoqiladi**
- Player'da subtitle tilini qo'lda ham o'zgartirish mumkin (UI tilidan mustaqil)

```sql
-- Filter: faqat status (til endi lesson'da yo'q)
SELECT * FROM lessons WHERE status = 'PUBLISHED' AND section_id = $1;

-- Tarjima foydalanuvchi tilida ko'rsatish:
-- titles->>'uz-Latn'  yoki  titles->>$userLanguage
```

### 15.6. Subtitle format — WebVTT (HLS-native)

SRT emas, **WebVTT** ishlatiladi — HLS o'rnatilgan qo'llab-quvvatlash:

```vtt
WEBVTT

00:00:01.000 --> 00:00:04.000
Salom! Bu darsda biz biznes rejani o'rganamiz.

00:00:05.000 --> 00:00:08.000
Birinchi bo'lib, maqsadlaringizni aniqlang.
```

Admin SRT yuklasa, server avtomatik VTT'ga konvert qiladi (FFmpeg).

HLS playlist'da subtitle track:

```
#EXTM3U
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="O'zbek (lotin)",LANGUAGE="uz-Latn",DEFAULT=YES,AUTOSELECT=YES,URI="subtitles/uz-Latn.m3u8"
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="O'zbek (kirill)",LANGUAGE="uz-Cyrl",AUTOSELECT=YES,URI="subtitles/uz-Cyrl.m3u8"
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Русский",LANGUAGE="ru",AUTOSELECT=YES,URI="subtitles/ru.m3u8"
#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="English",LANGUAGE="en",AUTOSELECT=YES,URI="subtitles/en.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=1700000,RESOLUTION=1280x720,CODECS="avc1.4d401f,mp4a.40.2",SUBTITLES="subs"
720p/playlist.m3u8
```

### 15.7. Sana, vaqt, son formatlash

`Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.RelativeTimeFormat` — barcha 4 til uchun browser native qo'llab-quvvatlash bor.

| Locale | "5 daqiqa oldin" |
|---|---|
| uz-Latn | 5 daqiqa oldin |
| uz-Cyrl | 5 дақиқа олдин |
| ru | 5 минут назад |
| en | 5 minutes ago |

### 15.8. Tarjima jarayoni

- Bosh til — `uz-Latn`
- Boshqa tillarga tarjima — professional tarjimon (yoki AI + human review)
- Tarjima yo'q kalitlar — `uz-Latn` fallback (next-intl `fallbackLocale: 'uz-Latn'`)
- CI'da tekshirish — har til JSON struktura bir xilligi (kalitlar shu)

---

## 16. PWA imkoniyatlari

### 16.1. Manifest

```typescript
// app/manifest.ts
export default function manifest() {
  return {
    name: 'Biznesjon',
    short_name: 'Biznesjon',
    description: 'Tadbirkorlar uchun bepul ta\'lim platformasi',
    start_url: '/home',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    lang: 'uz-Latn',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Xabarlar', url: '/messages', icons: [...] },
      { name: 'Darslar', url: '/lessons', icons: [...] },
    ],
    screenshots: [
      { src: '/screenshots/home-mobile.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow' },
    ],
  };
}
```

### 16.2. Service Worker (Serwist)

| Resurs | Strategy | TTL |
|--------|----------|-----|
| HTML | NetworkFirst (offline fallback) | — |
| Statik (JS, CSS, fonts) | CacheFirst | 30 kun |
| Tasvirlar | StaleWhileRevalidate | 7 kun |
| API GET (idempotent) | NetworkFirst, fallback cache | 5 daqiqa |
| API POST/PATCH/DELETE | NetworkOnly + Background Sync | — |
| HLS segmentlari | Browser cache (SW emas) | — |

### 16.3. Offline experience

- Bosh sahifa, oxirgi ko'rilgan darslar — offline ko'rinadi
- Yangi xabar yozish offline → Background Sync orqali keyin yuboriladi
- "Offlinе rejim" indikatori (banner)

### 16.4. Install prompt

```typescript
// hooks/useInstallPrompt.ts
export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent>();
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    setPrompt(undefined);
  };
  return { canInstall: !!prompt, install };
}
```

UX: 3-marta tashrifdan keyin "Ilovani o'rnatish" banner ko'rsatiladi.

### 16.5. iOS xususiyatlari

iOS PWA cheklovlari:

- Push 16.4+ talab qiladi
- Splash screen — `apple-touch-startup-image` har ekran o'lchami uchun alohida
- Status bar — `apple-mobile-web-app-status-bar-style`
- 50 MB cache limit

---

## 17. "Mening saytim" tizimi

> Loyihaning o'ziga xos xususiyati — **mijoz biznesi haqida professional video** foydalanuvchi profiliga biriktiriladi.

### 17.1. Tushuncha

**"Mening saytim"** — bu HTML sayt EMAS, balki **mijoz biznesi/sayti/xizmati haqida jamoa tomonidan yaratilgan professional video**(lar).

Jarayon:
1. Mijoz jamoaga **buyurtma beradi** (platforma tashqarisida — alohida shartnoma)
2. Jamoa **professional video tayyorlaydi** (mijoz biznesi, sayti, mahsuloti haqida)
3. Admin panel orqali **video mijozning profiliga biriktiriladi** (`PromoVideo` jadval)
4. Mijoz o'z profilida **bu videolarni ko'radi** (Bosh sahifada "⭐ Mening saytim" bloki)
5. Mijoz xohlasa **public link orqali boshqalar bilan ulashishi mumkin**

### 17.2. Bir foydalanuvchi — bir nechta video

`PromoVideo` jadval `userId` bo'yicha N:1. Bitta mijoz uchun bir nechta video bo'lishi mumkin (turli xizmatlar yoki mahsulotlar uchun). Tartibi `uploadedAt DESC` bo'yicha.

### 17.3. Video pipeline — Lesson bilan bir xil

PromoVideo yuklash va transcoding aynan Lesson kabi:
- Admin upload (TUS, max 5 GB)
- FFmpeg HLS transcoding (480p, 720p, 1080p)
- 4 til VTT subtitle (ixtiyoriy)
- Thumbnail avtomatik
- Storage: `/var/biznesjon/storage/promo-videos/{id}/`

Yagona farq — `Lesson` o'rniga `PromoVideo` jadvali va boshqa storage prefiks.

### 17.4. Ulashish (sharing) tizimi

**Foydalanuvchi (egasi) videoni ulashishni boshqaradi:**

```typescript
// Egasi "Ulashish" tugmasini bosadi
POST /me/promo-videos/:id/enable-sharing
→ Server: shareToken = nanoid(24)
→ PromoVideo.isShareable = true
→ PromoVideo.shareToken = shareToken
→ Response: { shareUrl: 'https://biznesjon.uz/share/promo/{token}' }

// Egasi ulashishni o'chiradi
POST /me/promo-videos/:id/disable-sharing
→ shareToken = null
→ isShareable = false
→ Eski link 404 qaytaradi
```

**Public sahifa** (`/share/promo/[token]`):

- Auth talab qilmaydi — kim link bilan kelsa ko'radi
- `noindex, nofollow` meta tag — qidiruv tizimlarida ko'rinmaydi
- robots.txt'da `/share/*` bloklangan
- Egasining ismi + biznes nomi ko'rsatiladi (CTA: "Bu tadbirkor bilan bog'lanish")
- Agar viewer auth qilingan bo'lsa — to'g'ridan-to'g'ri DM yuborish tugmasi

```tsx
// app/share/promo/[token]/page.tsx
export default async function PromoSharePage({ params }) {
  const promo = await api.public.getPromoVideo(params.token);
  if (!promo) return notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <VideoPlayer hlsUrl={promo.signedHlsUrl} subtitles={promo.subtitles} />
      <AuthorCard user={promo.owner} />
      {/* "Bog'lanish" — auth bo'lsa DM, yo'q bo'lsa register */}
    </div>
  );
}

export const metadata = { robots: { index: false, follow: false } };
```

### 17.5. Maxfiylik kafolatlari

- Birinchi yuklanganda `isShareable = false`, `shareToken = null` — **faqat egasi ko'radi**
- Egasi yoqmaguncha — boshqa hech kim ko'rmaydi (URL ham yo'q)
- Yoqgandan keyin ham — sitemap'da yo'q, qidiruv tizimlarida indekslanmagan
- Egasi o'chirsa — shareToken yo'qoladi, eski link 404
- Admin video o'chirsa — barcha share linklar yo'q bo'ladi
- Telefon raqami hech qachon public sahifada ko'rsatilmaydi

### 17.6. Admin "Mening saytim" video yuklash

```
1. Admin: /admin/promo-videos/new
2. Forma:
   - Foydalanuvchini tanlash (@username yoki telefon orqali izlash)
   - Video fayl (max 5 GB, MP4/MOV/AVI/MKV)
   - Sarlavhalar (4 tilda): uz-Latn, uz-Cyrl, ru, en
   - Tavsiflar (4 tilda)
   - Subtitle VTT/SRT (ixtiyoriy, 4 til) — server VTT'ga konvert qiladi
   - Thumbnail (avtomatik yoki qo'lda)
3. Server:
   - PromoVideo { status: PROCESSING, isShareable: false } yaratiladi
   - BullMQ: video transcoding queue
   - Transcoding tugagandan keyin: status = PUBLISHED
4. Foydalanuvchiga avtomatik bildirishnoma: NotifType.PROMO_VIDEO_PUBLISHED
5. Audit log: action = "PROMO_VIDEO.UPLOAD", target = "promo:abc", metadata = { userId }
```

### 17.7. Bosh sahifada ko'rinishi

```tsx
// app/(main)/home/page.tsx
const myPromos = await api.me.getPromoVideos();

return (
  <>
    {myPromos.length > 0 && (
      <section className="mb-8">
        <h2 className="flex items-center gap-2">
          <Star /> Mening saytim
        </h2>
        <PromoVideoCarousel videos={myPromos} />
      </section>
    )}
    {/* Davom ettirish, Yangi darslar, ... */}
  </>
);
```

`PromoVideo` yo'q bo'lsa — "Mening saytim" bloki Bosh sahifada umuman ko'rsatilmaydi (boshqa user'lar uchun ham, agar boshqalar yo'q kontentni shunchaki ko'rmaydi).

### 17.8. Nima endi YO'Q (eski spec'dan)

- ❌ `Site` jadval (EXTERNAL/HOSTED)
- ❌ Statik HTML/CSS/JS ZIP upload
- ❌ Nginx `auth_request` (statik sayt egasini tekshirish uchun edi)
- ❌ `sites.biznesjon.uz` subdomain
- ❌ iframe sandbox (external URL uchun edi)

Sabab — foydalanuvchi (mahsulot egasi) yangi modelni tasdiqladi: "Mening saytim" = video xizmati, sayt qurish emas.

---

## 18. Admin panel

### 18.1. Imkoniyatlar

| Bo'lim | Funksiya |
|--------|----------|
| Dashboard | Kunlik DAU, yangi userlar, video views |
| Foydalanuvchilar | Ro'yxat, filter, qidiruv, tahrirlash, soft delete |
| Darslar | Yuklash, tahrirlash, status (DRAFT → PUBLISHED), o'chirish |
| Saytlar | Userga sayt biriktirish, tahrirlash |
| Xabarlar | User'ga to'g'ridan-to'g'ri yuborish, e'lon |
| Audit log | Faqat super-admin |

### 18.2. Statistika

```
Bosh dashboard:
┌─ DAU/MAU ─────┐  ┌─ Yangi userlar (7d) ─┐
│   1,247       │  │      +234            │
└───────────────┘  └──────────────────────┘
┌─ Aktiv chatlar ┐  ┌─ Video views (24h) ─┐
│     342        │  │      4,892           │
└────────────────┘  └──────────────────────┘
```

Manbalar: Postgres aggregation + Redis (kunlik counter).

### 18.3. RBAC matritsasi

| Action | USER | ADMIN | SUPER_ADMIN |
|--------|:----:|:-----:|:-----------:|
| Profilni ko'rish | ✅ | ✅ | ✅ |
| Boshqa user profilini tahrirlash | — | ✅ | ✅ |
| Video yuklash | — | ✅ | ✅ |
| Sayt biriktirish | — | ✅ | ✅ |
| Audit log | — | — | ✅ |
| Admin yaratish | — | — | ✅ |

### 18.4. Audit log

Har admin amali **avtomatik** yoziladi:

```typescript
@AuditLog('USER.UPDATE')
@Patch('users/:id')
updateUser(@Param('id') id, @Body() dto, @CurrentUser() admin) {
  // ...
}
// Decorator ichidagi interceptor:
// - actor: admin.id
// - action: 'USER.UPDATE'
// - target: `user:${id}`
// - metadata: { changes: dto }
// - ip, userAgent
```

---

## 19. Server konfiguratsiyasi

### 19.1. Contabo VPS spetsifikatsiyasi

| Resurs | Min (MVP) | Tavsiya |
|--------|-----------|---------|
| CPU | 6 vCPU | 10 vCPU (VPS L) |
| RAM | 16 GB | 30 GB |
| SSD | 400 GB NVMe | 800 GB NVMe |
| Tarmoq | 1 Gbit | 1 Gbit |
| Trafik | 32 TB/oy | 32 TB/oy |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |

### 19.2. OS hardening

```bash
# Standart user
adduser deploy
usermod -aG sudo deploy

# SSH
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP (Let's Encrypt)
ufw allow 443/tcp    # HTTPS
ufw enable

# fail2ban
apt install -y fail2ban
systemctl enable --now fail2ban

# Avto yangilanishlar
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades

# Swap (RAM yetmasa)
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Limits
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf
```

### 19.3. Nginx asosiy konfiguratsiya

```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_rlimit_nofile 65535;

events {
  worker_connections 4096;
  multi_accept on;
}

http {
  # Performance
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  client_max_body_size 100M;
  client_body_buffer_size 128k;

  # Compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
  brotli on;
  brotli_types text/plain text/css application/json application/javascript;

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;
  limit_req_zone $binary_remote_addr zone=auth:10m rate=2r/s;

  # Logs (Loki o'qiydi)
  log_format json escape=json '{"time":"$time_iso8601","ip":"$remote_addr","method":"$request_method","path":"$request_uri","status":$status,"size":$body_bytes_sent,"rt":$request_time,"ua":"$http_user_agent","referer":"$http_referer"}';
  access_log /var/log/nginx/access.json json;

  # Servers
  include /etc/nginx/sites-enabled/*;
}
```

### 19.4. Asosiy server bloki

```nginx
# /etc/nginx/sites-available/biznesjon
server {
  listen 80;
  server_name biznesjon.uz www.biznesjon.uz api.biznesjon.uz;
  return 301 https://$host$request_uri;
}

# Frontend
server {
  listen 443 ssl http2;
  server_name biznesjon.uz www.biznesjon.uz;

  ssl_certificate /etc/letsencrypt/live/biznesjon.uz/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/biznesjon.uz/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
  ssl_session_cache shared:SSL:10m;

  # Security headers (qisqartirilgan)
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
  add_header X-Frame-Options DENY always;
  add_header X-Content-Type-Options nosniff always;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

# API
server {
  listen 443 ssl http2;
  server_name api.biznesjon.uz;

  # Rate limit
  limit_req zone=api burst=40 nodelay;

  location /api/v1/auth {
    limit_req zone=auth burst=5 nodelay;
    proxy_pass http://127.0.0.1:4000;
    # ... proxy headers
  }

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # WebSocket
  location /ws {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;
  }
}
```

### 19.5. PostgreSQL tuning

```ini
# /etc/postgresql/17/main/postgresql.conf
# 30 GB RAM uchun

shared_buffers = 8GB              # 25% of RAM
effective_cache_size = 22GB       # 75%
work_mem = 32MB
maintenance_work_mem = 2GB
wal_buffers = 16MB
max_connections = 200
random_page_cost = 1.1            # NVMe
effective_io_concurrency = 200
checkpoint_completion_target = 0.9
default_statistics_target = 100

# Logging
log_min_duration_statement = 500ms   # Sekin querylar
log_checkpoints = on
log_lock_waits = on
log_temp_files = 0
```

### 19.6. Redis konfiguratsiya

```ini
# /etc/redis/redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec

# Xavfsizlik
bind 127.0.0.1
requirepass <strong-password>
```

---

## 20. DevOps va deployment

### 20.1. Repository struktura

```
biznesjon/
├── apps/
│   ├── web/                    # Next.js
│   └── api/                    # NestJS
├── packages/
│   ├── shared/                 # Umumiy tiplar
│   ├── ui-tokens/              # Dizayn tokenlar
│   └── eslint-config/
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   └── Dockerfile.workers
│   ├── nginx/
│   ├── postgres/
│   └── grafana/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── pr.yml
├── docs/
│   ├── texnik.md
│   └── RUNBOOK.md
├── package.json (workspaces)
├── pnpm-workspace.yaml
└── turbo.json
```

**Monorepo:** Turborepo + pnpm workspaces.

### 20.2. Docker Compose (prod)

```yaml
# infra/docker/docker-compose.prod.yml
services:
  postgres:
    image: postgres:17-alpine
    restart: always
    volumes:
      - pg_data:/var/lib/postgresql/data
      - /var/biznesjon/backups/postgres:/backups
    env_file: .env.prod
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U biznesjon']
      interval: 10s

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 4gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data

  api:
    image: ghcr.io/biznesjon/api:${IMAGE_TAG}
    restart: always
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_started }
    env_file: .env.prod
    ports:
      - '127.0.0.1:4000:4000'
    volumes:
      - /var/biznesjon/storage:/var/biznesjon/storage
    deploy:
      resources:
        limits: { cpus: '4', memory: 4G }

  web:
    image: ghcr.io/biznesjon/web:${IMAGE_TAG}
    restart: always
    env_file: .env.prod
    ports:
      - '127.0.0.1:3000:3000'
    deploy:
      resources:
        limits: { cpus: '2', memory: 2G }

  worker:
    image: ghcr.io/biznesjon/api:${IMAGE_TAG}
    restart: always
    command: ['node', 'dist/workers/main.js']
    depends_on: [postgres, redis]
    env_file: .env.prod
    volumes:
      - /var/biznesjon/storage:/var/biznesjon/storage
    deploy:
      resources:
        limits: { cpus: '6', memory: 8G }

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prom_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports: ['127.0.0.1:3001:3000']
    volumes: [grafana_data:/var/lib/grafana]

  loki:
    image: grafana/loki:latest
    volumes: [loki_data:/loki]

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log:ro
      - /var/biznesjon/logs:/biznesjon/logs:ro

volumes:
  pg_data: {}
  redis_data: {}
  prom_data: {}
  grafana_data: {}
  loki_data: {}
```

### 20.3. CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - run: |
          docker build -f infra/docker/Dockerfile.api -t ghcr.io/biznesjon/api:${{ github.sha }} .
          docker build -f infra/docker/Dockerfile.web -t ghcr.io/biznesjon/web:${{ github.sha }} .
          docker push ghcr.io/biznesjon/api:${{ github.sha }}
          docker push ghcr.io/biznesjon/web:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/biznesjon
            export IMAGE_TAG=${{ github.sha }}
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml run --rm api pnpm prisma migrate deploy
            docker compose -f docker-compose.prod.yml up -d --no-deps web api worker
            docker image prune -af
```

### 20.4. Zero-downtime deploy

NestJS — graceful shutdown:

```typescript
const app = await NestFactory.create(AppModule);
app.enableShutdownHooks();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing gracefully...');
  await app.close();      // davom etayotgan so'rovlarni tugatadi
  process.exit(0);
});
```

Nginx upstream'da bir vaqtda eski va yangi konteynerlar — request'lar yangiga o'tadi.

### 20.5. Migration deployment

```
1. CI testlar o'tdi
2. Build → image push
3. Deploy server SSH:
   a. docker compose pull
   b. docker compose run --rm api prisma migrate deploy   ← migration
   c. docker compose up -d --no-deps web api worker        ← rolling restart
4. Health check
5. Slack/Telegram bildirishnoma
```

Migration **buzuvchi** bo'lsa — expand-and-contract bosqichma-bosqich (har biri alohida deploy).

### 20.6. Atroflar (environments)

| Env | Domen | Maqsad |
|-----|-------|--------|
| Local | `localhost:3000` | Dev |
| Staging | `staging.biznesjon.uz` | Pre-production sinov |
| Production | `biznesjon.uz` | Live |

Staging — alohida Contabo VPS S yoki bitta serverda alohida portda.

---

## 21. Kuzatuv va Observability

### 21.1. Uchburchak: Logs + Metrics + Traces

```
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │   Logs   │   │ Metrics  │   │  Traces  │
   │  (Loki)  │   │(Prometh.)│   │  (OTel)  │
   └─────┬────┘   └────┬─────┘   └─────┬────┘
         └──────┬──────┴──────┬────────┘
                ▼             ▼
            ┌─────────────────────┐
            │      GRAFANA        │
            │   (Yagona dashboard)│
            └─────────────────────┘
                       │
                       ▼ alert
            ┌─────────────────────┐
            │  Telegram bot       │
            └─────────────────────┘

   ┌──────────┐
   │  Errors  │ → Sentry
   └──────────┘
```

### 21.2. Loglar

**Pino structured logging:**

```typescript
logger.info({
  userId: user.id,
  lessonId,
  duration: Date.now() - start,
  traceId: req.headers['x-trace-id'],
}, 'lesson.viewed');
```

Promtail → Loki → Grafana — to'liq tekstli qidiruv `{app="api"} |= "lesson.viewed" | json`.

### 21.3. Metrik (Prometheus)

**Asosiy metriklar:**

| Metrik | Turi | Manba |
|--------|------|-------|
| `http_requests_total` | Counter | Endpoint, method, status |
| `http_request_duration_seconds` | Histogram | p50, p95, p99 |
| `db_query_duration_seconds` | Histogram | Prisma middleware |
| `cache_hits_total / cache_misses_total` | Counter | Redis |
| `bullmq_jobs_processed` | Counter | Worker |
| `bullmq_jobs_failed` | Counter | Worker |
| `bullmq_jobs_active` | Gauge | Worker |
| `socket_connections_active` | Gauge | Socket.io |
| `node_*` (CPU, RAM, disk) | — | node_exporter |

### 21.4. Tracing (OpenTelemetry)

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('biznesjon-api');

async function getLesson(id: string) {
  return tracer.startActiveSpan('lessons.getById', async (span) => {
    span.setAttribute('lesson.id', id);
    try {
      const result = await prisma.lesson.findUnique({ where: { id } });
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    } finally {
      span.end();
    }
  });
}
```

Kelajakda — Tempo + Grafana integratsiyasi.

### 21.5. Errorlar (Sentry)

Frontend va backend ham Sentry'ga ulanadi. PII (telefon raqami) avto-scrub qilinadi:

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    if (event.user?.phone) delete event.user.phone;
    return event;
  },
});
```

### 21.6. Asosiy dashboardlar

| Dashboard | Panellar |
|-----------|----------|
| **Overview** | RPS, p95 latency, error rate, DAU |
| **API** | Endpoint tezligi, eng sekin querylar |
| **Database** | Connection pool, slow queries, replication lag |
| **Workers** | Queue depth, success/fail rate, processing time |
| **Infrastructure** | CPU, RAM, disk, tarmoq |
| **Business** | Yangi userlar, video views, xabarlar |

### 21.7. Alert qoidalari

| Alert | Threshold | Channel |
|-------|-----------|---------|
| API error rate | > 5% (5 daqiqa) | Telegram |
| API p95 latency | > 1s (5 daqiqa) | Telegram |
| Disk usage | > 85% | Telegram |
| RAM usage | > 90% | Telegram |
| BullMQ failed jobs | > 10/daqiqa | Telegram |
| Postgres down | har qanday | Telegram + SMS |
| SSL muddat | 14 kun qoldi | Email |

---

## 22. Backup va falokat tiklash

### 22.1. Backup strategiyasi

| Resurs | Chastotasi | Saqlash | Joy |
|--------|-----------|---------|-----|
| Postgres (full) | Kunlik | 30 kun | Local + B2 |
| Postgres (WAL) | Doimiy | 7 kun | Local + B2 |
| Redis (RDB) | Soatlik | 7 kun | Local |
| Fayllar (storage) | Haftalik | 4 hafta | B2 |
| Konfiguratsiya | Git | Doimiy | GitHub |

### 22.2. Postgres backup skript

```bash
#!/bin/bash
# /opt/biznesjon/scripts/backup-postgres.sh

set -euo pipefail

BACKUP_DIR=/var/biznesjon/backups/postgres
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="biznesjon_${DATE}.dump"

# Dump
docker exec postgres pg_dump -U biznesjon -F c biznesjon > "${BACKUP_DIR}/${FILENAME}"

# Compress
gzip "${BACKUP_DIR}/${FILENAME}"

# Upload to B2
rclone copy "${BACKUP_DIR}/${FILENAME}.gz" b2:biznesjon-backups/postgres/

# Retention (local 7d, B2 30d)
find "${BACKUP_DIR}" -name "*.dump.gz" -mtime +7 -delete

# Notify
curl -X POST "${TELEGRAM_API}/sendMessage" \
  -d "chat_id=${ADMIN_CHAT}" \
  -d "text=✅ Postgres backup ok: ${FILENAME}"
```

Cron: `0 3 * * * /opt/biznesjon/scripts/backup-postgres.sh`

### 22.3. RPO va RTO

| Metrik | Maqsad | Realizatsiya |
|--------|--------|--------------|
| **RPO** (max ma'lumot yo'qotish) | 1 soat | Soatlik DB snapshot + WAL |
| **RTO** (tiklanish vaqti) | 4 soat | Runbook + avtomatlashtirilgan tiklash skripti |

### 22.4. Restore protsedurasi (RUNBOOK)

```bash
# 1. Yangi VPS ishga tushirish
# 2. Docker o'rnatish
# 3. .env, docker-compose.yml git'dan
# 4. Backup yuklab olish
rclone copy b2:biznesjon-backups/postgres/biznesjon_LATEST.dump.gz /tmp/

# 5. DB tiklash
gunzip /tmp/biznesjon_LATEST.dump.gz
docker compose up -d postgres
docker exec -i postgres pg_restore -U biznesjon -d biznesjon < /tmp/biznesjon_LATEST.dump

# 6. Fayllarni tiklash
rclone copy b2:biznesjon-backups/files/ /var/biznesjon/storage/

# 7. Servislarni ishga tushirish
docker compose up -d

# 8. DNS yangilash (Cloudflare)
# 9. Health check
```

### 22.5. DR drill

Har **3 oyda bir marta** to'liq restore drill:
- Yangi VPS olinadi
- Backup'dan tiklanadi
- Smoke test
- Hujjatlash (vaqt, muammolar)
- VPS o'chiriladi

---

## 23. Skalalash strategiyasi

### 23.1. Kapasitet bosqichlari

| Bosqich | DAU | Yondashuv |
|---------|-----|-----------|
| MVP | 0–500 | Bitta VPS L |
| Boshlang'ich | 500–5K | VPS XL + Cloudflare Pro |
| O'sish | 5K–20K | + Read replica + alohida worker VPS |
| Kengayish | 20K–100K | Migration: AWS/Hetzner Dedicated, k3s |
| Enterprise | 100K+ | Multi-region, mikroservislar |

### 23.2. Vertikal skala (oddiy)

- Contabo Storage VPS: 10 vCPU → 16 vCPU
- RAM: 30 GB → 64 GB
- Disk: 800 GB → 2.4 TB
- Hech qanday kod o'zgartirish kerak emas

### 23.3. Gorizontal skala (modular monolitdan ajratish)

**1-bosqich:** Workers alohida VPSga
- Video transcoding alohida machine — asosiy server osongina

**2-bosqich:** Read replica
- PostgreSQL streaming replication
- Read-only querylar replica'ga (Prisma `replicas`)

**3-bosqich:** Socket.io alohida
- WebSocket gateway alohida konteyner
- Redis adapter — multi-node coordination

**4-bosqich:** Mikroservislar
- Chat — alohida servis
- Video — alohida servis
- API gateway oldida

### 23.4. Bottleneck analiz

| Bottleneck | Sabab | Yechim |
|------------|-------|--------|
| Postgres CPU | Murakkab querylar | Index, query plan, replica |
| FFmpeg CPU | Transcoding navbat | Alohida worker pool |
| Disk I/O | Ko'p video read | Cloudflare CDN, NVMe |
| Tarmoq | Ko'p video traffik | CDN — VPS faqat origin |
| Memory | Cache + Node | Redis cluster, Node cluster |

---

## 24. Xavfsizlik checklist

### 24.1. Kod va dependency

- [x] Strict TypeScript (`"strict": true`)
- [x] ESLint security plugin
- [x] Dependabot avto patch
- [x] Snyk dependency scan
- [x] CodeQL SAST (GitHub Actions)
- [x] Pre-commit hooks (husky + lint-staged)
- [x] Sirlar `.env`'da, git'da emas
- [x] `.env.example` shablon

### 24.2. Auth va session

- [x] Argon2id parol hash
- [x] JWT httpOnly Secure SameSite=Strict cookie
- [x] Refresh token rotation
- [x] OTP urinishlari cheklangan (5/OTP, 10/soat)
- [x] Brute-force himoyasi (rate limit + fail2ban)
- [x] Session DB (Redis) — boshqarish mumkin

### 24.3. Network

- [x] HTTPS hamma joyda (HTTP → 301)
- [x] HSTS preload
- [x] TLS 1.3
- [x] CSP strict
- [x] CORS allowlist
- [x] Rate limit (Nginx + app)
- [x] DDoS — Cloudflare
- [x] WAF — Cloudflare
- [x] Firewall (ufw) — faqat 22, 80, 443

### 24.4. Ma'lumotlar

- [x] DB encryption at rest (LUKS)
- [x] Backup encryption (B2 + GPG)
- [x] PII minimallashtirilgan (telefon yashirin)
- [x] SQL injection — Prisma parametrizatsiyasi
- [x] XSS — React escape
- [x] CSRF — SameSite cookie
- [x] File upload — magic bytes + extension allowlist
- [x] Path traversal — normalize + validate

### 24.5. Operatsion

- [x] SSH faqat key, root login yopiq
- [x] Auto patch (unattended-upgrades)
- [x] fail2ban
- [x] Audit log barcha admin amallari
- [x] Sentry — xato tracking
- [x] Backup test 3 oyda bir
- [x] Incident response plan

### 24.6. Compliance

- [x] GDPR-style: foydalanuvchi ma'lumotlarini eksport qila oladi
- [x] Hisobni o'chirish (30 kun keyin to'liq)
- [x] Maxfiylik siyosati (ommaviy)
- [x] Cookie banner (kerak bo'lsa)
- [x] Yosh chegarasi (16+) — ToS

---

## 25. Yetkazib berish strategiyasi — To'liq professional, bir martada

> **Asosiy qoida:** Biznesjon **MVP, V1, V2 bosqichlari bilan emas, bir martada to'liq professional** ravishda ishga tushiriladi. Bu CLAUDE.md global "Sifat tezlikdan ustun" va "Adversarial QA majburiy" qoidalariga muvofiq.

### 25.1. "Done" ning ta'rifi (har funksiya uchun majburiy)

Bironta ham funksiya **hammasi yashil bo'lmaguncha "done" deb hisoblanmaydi**:

**Development gate (syntactic):**
1. TypeScript typecheck — 0 xato
2. ESLint — 0 xato, 0 warning
3. Unit testlar — happy path yashil
4. Build muvaffaqiyatli
5. Husky pre-commit hooks o'tdi
6. Conventional Commits format

**QA gate (semantic) — MAJBURIY:**
7. **Real-data smoke test** — production-size ma'lumotlar bilan manual sinov
8. **Adversarial review** — quyidagi savollarga "ha" javob bo'lishi shart
9. **Concurrent test** — multi-user scenariylar
10. **Edge case exploration** — null, empty, unicode, overflow, RTL, BOM

**A11y va Performance:**
11. Lighthouse 90+ (Performance, A11y, SEO, Best Practices, PWA)
12. WCAG 2.1 AA muvofiqlik (axe-core CI'da)
13. LCP < 2.5s (4G), CLS < 0.1, INP < 200ms

**Xavfsizlik:**
14. OWASP Top 10 muvofiqlik
15. Snyk + CodeQL — 0 high/critical
16. Penetration test (OWASP ZAP) — 0 critical finding

### 25.2. Adversarial savollar (har funksiya uchun)

Har feature uchun **avval kod yozishdan oldin** o'zimizdan so'raymiz:

**Concurrency:**
- 2 yoki N user parallel bajarsa nima bo'ladi? Lost update? Race condition? Deadlock?
- Transaction isolation yetarlimi? `SELECT ... FOR UPDATE` yoki advisory lock kerakmi?
- Misol: 2 user bir vaqtda guruhga qo'shilsa, memberCount 200+ bo'ladimi? → advisory lock kerak

**Timeout va network:**
- Client timeout server processing vaqti bilan mosmi?
- Internet mid-operation uzilsa ma'lumot qayerda qoladi?
- Abort/cancel mexanizm bormi?
- Retry logic infinite loop yaratmaydimi?

**Data integrity:**
- View count deduplication qoidasi (per user per kun)
- Soft vs hard delete tartibi
- Cascade delete mid-way fail bo'lsa orphan qoladimi?

**Input edges:**
- null, undefined, empty string, "0", whitespace farqi
- Unicode (emoji, RTL, Cyrl↔Latn), BOM, zero-width
- Username regex `/^[a-z0-9_]{3,20}$/` — `___` yoki `999` ham mosmi? Reserved namelar (admin, biznesjon, ...)?
- Date — timezone, DST
- Phone format — +998, 998, 8998

**Authorization edges:**
- Admin foydalanuvchi profilini tahrirlay olsa, foydalanuvchi xabar oladimi?
- 30 kun ichida soft-deleted user login qilsa — avto tiklanadimi?
- Guruh OWNER chiqib ketsa, OWNER yo'q guruh qoladimi?

**UX edges:**
- Generic "Xato" emas — real sabab ko'rsatish
- Loading state — modal-ichida-modal holatlar
- Back button, refresh mid-form, copy-paste katta matn
- `window.confirm()` ishlatilmaydi — `ConfirmDialog` komponent

### 25.3. Yetkazib berish fazalari

| Faza | Maqsad | Yakunlash mezoni |
|---|---|---|
| **Phase 1 — Development** | Hamma feature implement qilingan | Hammasi 25.1 development gate'dan o'tdi |
| **Phase 2 — QA** | Adversarial, concurrent, real-data, edge case | 25.1 QA gate hammasi yashil; 25.2 savollarga javob bor |
| **Phase 3 — Staging** | Production-like environment, monitoring, ichki jamoa sinovi | 99.5% uptime 2 hafta, error budget < 1% |
| **Phase 4 — Public launch** | Feature flag bilan gradual rollout, kuzatuv | 0 critical bug 1 hafta, kanareyka 100% |

### 25.4. Modullar (ishlab chiqish tartibi — parallel ham qilinishi mumkin)

| # | Modul | Bog'liqlik |
|---|---|---|
| 1 | **Tayyorgarlik** (monorepo, CI/CD, infra, design tokens) | — |
| 2 | **Auth + Onboarding** (register, OTP, login, profil + username) | 1 |
| 3 | **Foydalanuvchilar** (profil, qidiruv, @username sahifa) | 2 |
| 4 | **i18n + Theme** (4 til, light/dark) | 1 |
| 5 | **Darslar** (admin upload + 4 til subtitle, transcoding, player, progress) | 2 |
| 6 | **Shaxsiy chat (DM)** (Socket.io, REST fallback, media, video note) | 2 |
| 7 | **Guruh chat** (Telegram-style CRUD, invite link, role, 200 limit) | 6 |
| 8 | **"Mening saytim" (PromoVideo)** (admin upload, share token, public sahifa) | 5 |
| 9 | **Bildirishnomalar** (in-app + Web Push, preferences) | 6 |
| 10 | **PWA** (manifest, SW, install prompt, offline) | 5 |
| 11 | **Admin panel** (foydalanuvchilar, lesson/promo upload, audit log) | 2, 5, 8 |
| 12 | **Global qidiruv** (Cmd+K, darslar+tadbirkorlar+guruhlar) | 3, 5, 7 |
| 13 | **Observability** (Prometheus, Grafana, Loki, Sentry, OTel) | 1 |
| 14 | **Backup + DR** (kunlik dump, B2, restore drill) | 1 |
| 15 | **Security audit** (Snyk, CodeQL, OWASP ZAP, fail2ban) | hammasi |
| 16 | **Performance** (Lighthouse, k6 yuk testi, real-data) | hammasi |
| 17 | **A11y** (WCAG 2.1 AA, axe-core, screen reader) | hammasi |

### 25.5. Yetkazib berish tartibi qoidalari

1. **Hech bir feature "70% tayyor" deb yopilmaydi** — yo to'liq professional, yo bekor
2. **Bug topilganda — fix + adversarial kuzatuv pattern** (CLAUDE.md):
   > *"Bu bug qaysi pattern'ning misoli? Shu pattern boshqa qaysi joyda takrorlanadi?"*
3. **Subagent dispatch'da har doim quality gates** (CLAUDE.md):
   - Aniq scope, mavjud pattern (file:line), quality gate (typecheck+test+lint+visual), DO NOT list
4. **Trust but verify** — agent natijasi har doim mustaqil tekshiriladi (`git status`, `git diff`, sinov qayta ishga tushirish)

### 25.6. Launch checklist (Phase 4 oldidan)

- [ ] Hamma modul 25.1 ta'rifi bo'yicha "done"
- [ ] Lighthouse 90+ har sahifa
- [ ] k6 yuk testi 500 RPS yashil
- [ ] OWASP ZAP — 0 critical
- [ ] Penetration test (tashqi auditor) — yashil
- [ ] Backup va DR drill o'tdi (real restore)
- [ ] Monitoring dashboard tayyor (Grafana)
- [ ] Alert qoidalari ishlaydi (Telegram bot test)
- [ ] RUNBOOK to'liq (incident response, deploy, rollback)
- [ ] ToS, Maxfiylik siyosati ommaviy
- [ ] Domain, SSL, DNS — Cloudflare orqali
- [ ] Eskiz.uz hisob faollashtirilgan
- [ ] B2 backup hisob faollashtirilgan
- [ ] 4 til UI tarjimasi 100% (har til JSON kalit soni teng)
- [ ] Kamida 20 ta professional dars yuklangan (kontent zaxirasi)
- [ ] 4 til subtitle har dars uchun yuklangan
- [ ] Admin hisoblari yaratilgan, parollar 1Password'da
- [ ] Audit log yozilmoqda

### 25.7. Beta yo'q — ichki jamoa testi bor

**Beta dasturi yo'q.** Lekin Phase 3 Staging'da **ichki jamoa (5-10 odam) real foydalanish** qiladi 2 hafta:
- Real telefon raqamlari bilan ro'yxatdan o'tish
- Real chat, guruh yaratish
- Admin video yuklash
- "Mening saytim" video biriktirish
- 4 til UI ishlash

Bu Phase 4 public launch'dan oldin oxirgi smoke test. Public foydalanuvchilarga **chala mahsulot ko'rsatilmaydi**.

### 25.8. Post-launch yangilanishlar

Launch'dan keyin yangi feature qo'shilsa — har biri uchun aynan shu 25.1-25.7 protokol amal qiladi. "Tezroq qo'shish uchun sifatdan kechish" yo'q.

Kelajakda mumkin (lekin launch uchun shart emas):
- Meilisearch'ga migratsiya (Postgres FTS o'rniga, 50K+ user'da)
- Analitika dashboardi (Plausible, self-hosted)
- Email digest (haftalik)
- Mobile native ilova (React Native — talab bo'lsa)
- Chat moderatsiyasi (AI moderation API)

---

## 26. Ochiq savollar (launch oldidan hal qilinadi)

Hujjat v2.0'da hal qilingan qarorlar (avvalgi versiyadan):
- ✅ Til tizimi — 4 til (uz-Latn, uz-Cyrl, ru, en)
- ✅ Yosh chegarasi — yo'q
- ✅ Multi-device — cheklov yo'q
- ✅ "Mening saytim" — PromoVideo (sayt qurish emas)
- ✅ Block/Report — yo'q
- ✅ Username — auto suggestion bilan
- ✅ Guruh tizimi — Telegram-style, 200 a'zo, public/private
- ✅ Parol unutilsa — faqat admin manual reset
- ✅ Beta dasturi — yo'q, lekin ichki jamoa staging testi bor
- ✅ Brending — Indigo + Zinc, Inter font, dark+light
- ✅ Bo'lim o'zgarganda — barcha tarix saqlanadi, cooldown yo'q
- ✅ Launch strategiyasi — to'liq professional bir martada (MVP/V1/V2 yo'q)

Hali aniqlanmagan qarorlar (operatsion va bo'rni darajada):

### 26.1. Mahsulot va kontent

1. **OTP byudjet limiti?** Hozir blocker emas — rate limit qattiq (1/daqiqa, 3/soat/telefon). Real foydalanuvchi kuzatuv asosida byudjet aniqlanadi.
2. **Chat moderatsiya siyosati?** Block/Report yo'q — admin proaktiv moderatsiya qiladi. Spam ko'paysa AI moderation API (OpenAI Moderation, bepul) qo'shilishi mumkin.
3. **Video maksimal davomiyligi?** Tavsiya: dars 60 daqiqa, promo video 10 daqiqa. Aniqlash kerak.
4. **Username reserved namelar?** `admin`, `biznesjon`, `support`, `help`, `api` va h.k. — band qilib qo'yish kerak.
5. **Username o'zgartirish cooldown?** 30 kunda 1 marta yetarli (eski URL'lar 7 kun redirect).

### 26.2. Texnik

1. **PromoVideo subtitle ixtiyoriy?** Admin uchun majburiy emas, lekin ko'rsatma sifatida tavsiya etiladi.
2. **GDPR muvofiqlik?** Yevropa serverida — best practice sifatida implement qilamiz (data export, delete, audit).
3. **Cloudflare Free → Pro o'tish chegarasi?** Bandwidth 100 GB/oy bo'lganda yoki advanced rate limit/WAF kerak bo'lganda. Hozircha Free.
4. **Reserved tokens (`shareToken`, `inviteToken`)** — nanoid uzunligi 24 bo'lsin (288 bit entropy — guessing'ga immune).
5. **Avatar default color** — username'dan hash → 12 ta brand-friendly rang.

### 26.3. Operatsion

1. **Aloqa kanal foydalanuvchilar uchun?** Telegram bot (`@biznesjon_support_bot`) + in-app "Yordam" tugma (mailto link bo'lsa ham). Aniqlash kerak.
2. **Incident response — kim navbatchi?** Telegram alert kanal + jamoa rotation. Aniqlash kerak.
3. **Status sahifasi (status.biznesjon.uz)?** Uptime Kuma'dan public dashboard.
4. **Server xarajat?** "Keyin hal qilinadi" — foydalanuvchi tasdiqladi.
5. **Marketing landing kerakmi?** `biznesjon.uz` ildiz — to'g'ridan-to'g'ri ilova yoki marketing landing? Aniqlash kerak.

### 26.4. Kontent strategiyasi

1. **Launch kontent zaxirasi** — har bo'lim uchun kamida 5 ta dars (10 soha × ~5 bo'lim × 5 dars = 250 dars 4 til subtitle bilan). Realistik vaqt?
2. **Logo va brend qoidalari?** Designer kerak. Hozircha typography-based logo (`Biznesjon` Inter Bold).
3. **Ijtimoiy tarmoqlar?** Telegram kanal `@biznesjon` (kontent va e'lon), Instagram (ko'rgazma).

---

## 27. Atamalar lug'ati

| Atama | Ma'no |
|-------|-------|
| **ABR** | Adaptive Bitrate — tarmoq tezligiga qarab video sifati o'zgaradi |
| **Argon2id** | Eng zamonaviy parol hashing algoritmi (OWASP tavsiyasi) |
| **BullMQ** | Redis asosidagi Node.js navbat tizimi |
| **CDN** | Content Delivery Network — kontentni global tarqatuvchi |
| **CSP** | Content Security Policy — XSS himoya headeri |
| **DAU / MAU** | Daily / Monthly Active Users |
| **DI** | Dependency Injection — NestJS asosida yotuvchi naqsh |
| **DR** | Disaster Recovery |
| **DTO** | Data Transfer Object |
| **FFmpeg** | Video/audio transcoding kutubxonasi |
| **GIN** | PostgreSQL inverted index — full-text search uchun |
| **HLS** | HTTP Live Streaming — Apple, video oqim formati |
| **HSTS** | HTTP Strict Transport Security |
| **HTTP/3** | Eng yangi HTTP protokoli (QUIC asosida) |
| **i18n** | Internationalization — lokalizatsiya |
| **IaC** | Infrastructure as Code |
| **JWT** | JSON Web Token |
| **k6** | Yuk testi vositasi |
| **Loki** | Grafana log aggregator |
| **LTS** | Long Term Support |
| **MVP** | Minimum Viable Product |
| **NFR** | Non-Functional Requirements |
| **OAuth** | Auth standartlari (kelajakda) |
| **OpenTelemetry** | Distributed tracing standarti (CNCF) |
| **OTel** | OpenTelemetry qisqa |
| **OTP** | One-Time Password (SMS kod) |
| **OWASP** | Open Web Application Security Project |
| **PoP** | Point of Presence (CDN edge) |
| **PWA** | Progressive Web App |
| **RBAC** | Role-Based Access Control |
| **RPO / RTO** | Recovery Point / Time Objective |
| **RSC** | React Server Components |
| **Sentry** | Real-time error tracking |
| **SSR / SSG** | Server-Side Rendering / Static Site Generation |
| **TUS** | Resumable upload protokoli |
| **VAPID** | Web Push uchun shaxsiy/ommaviy kalit standarti |
| **WAF** | Web Application Firewall |
| **WAL** | PostgreSQL Write-Ahead Log |
| **Zod** | TypeScript schema validatsiya kutubxonasi |

---

> *Ushbu hujjat Biznesjon platformasini noldan yetkazib berishgacha bo'lgan butun yo'lni qamrab oladi. Versiya yangilanishlari Git tarixida.*

**Hujjat versiyasi:** 1.0 Final · **Sana:** 2026 · **Holat:** Implementatsiya uchun tasdiqlangan
