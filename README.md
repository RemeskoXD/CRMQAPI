# CRMQ - CRM & ERP Systém

B2B/B2C CRM a ERP systém pro firmu zaměřenou na montáž a servis garážových vrat, oken a stínící techniky.

## Spuštění

```bash
# Instalace všech závislostí
npm install && cd server && npm install && cd ../client && npm install && cd ..

# Spustit obě části najednou
npm run dev

# Nebo jednotlivě
npm run dev:server   # API na http://localhost:3001
npm run dev:client   # Frontend na http://localhost:5173
```

## Architektura

```
CRMQAPI/
├── server/                # Express API (TypeScript)
│   └── src/
│       ├── db/            # PostgreSQL schéma + seed data
│       ├── models/        # Typové definice (User, Client, Project...)
│       ├── repositories/
│       │   ├── interfaces.ts   # Repository rozhraní
│       │   ├── mock/           # Mock implementace (aktuální)
│       │   └── index.ts        # Factory - přepne mock/PostgreSQL
│       ├── middleware/    # Auth (JWT) + RBAC
│       └── routes/        # REST API endpointy + PDF generátor
│
├── client/                # React 19 + Vite + Tailwind CSS
│   └── src/
│       ├── contexts/      # AuthContext (RBAC) + ToastContext
│       ├── components/    # Layout, navigace
│       ├── pages/         # Všechny moduly
│       └── services/      # API klient
```

## Funkce

| Modul | Popis |
|---|---|
| **Dashboard** | Dynamický dle role (Admin/Sales/Technik/Účetní/Infolinka) |
| **Adresář klientů** | Fulltext vyhledávání, 360° karta klienta |
| **Kanban** | Drag & Drop správa zakázek, filtrování dle typu, tvorba zakázek |
| **Detail zakázky** | Úkoly, faktury, klient, změna stavu, přidávání úkolů |
| **Úkoly** | Filtrování, přiřazování, checklist, prioritizace |
| **Kalendář** | Měsíční pohled, filtr dle osoby, tvorba událostí, detail dne |
| **Fakturace** | Tabulka dokladů, detail s položkami, PDF export ve firemním designu |
| **Sklad** | Vyhledávání, kategorie, upozornění na nízký stav |
| **Správa uživatelů** | Admin panel, přehled dle rolí, zakládání uživatelů |
| **Technik (mobilní)** | Optimalizované rozhraní - úkoly na dnes, odškrtávání, poznámky |
| **Toast notifikace** | Globální systém úspěch/chyba/info zpráv |

## Demo přihlášení (heslo: admin123)

| Email | Role | Pohled |
|---|---|---|
| admin@crmq.cz | Root | Plný přístup, admin panel |
| marek@crmq.cz | Team Leader | Tým, projekty, úkoly, uživatelé |
| andrej@crmq.cz | Obchodní zástupce | Klienti, nabídky, vlastní zakázky |
| petr@crmq.cz | Technik | Mobilní dashboard, úkoly na dnes |
| eva@crmq.cz | Analytik | Reporty, read-only přehled |
| lucie@crmq.cz | Infolinka | Zakládání klientů a poptávek |
| martin@crmq.cz | Účetní | Fakturace, přehledy plateb |

## API Endpointy

| Metoda | Endpoint | Popis |
|---|---|---|
| POST | `/api/auth/login` | Přihlášení (JWT) |
| GET | `/api/auth/me` | Aktuální uživatel |
| GET | `/api/dashboard` | Dashboard data dle role |
| CRUD | `/api/clients` | Klienti (GET detail = 360° karta) |
| CRUD | `/api/projects` | Zakázky (GET detail = úkoly + faktury) |
| CRUD | `/api/tasks` | Úkoly |
| CRUD | `/api/invoices` | Faktury/doklady |
| CRUD | `/api/inventory` | Sklad |
| CRUD | `/api/calendar` | Kalendářní události |
| CRUD | `/api/locations` | Místa realizace |
| CRUD | `/api/users` | Uživatelé (admin) |
| GET | `/api/pdf/invoice/:id` | HTML/PDF export faktury |

## Barevné schéma

- **Hlavní tmavá:** `#0B1126` (hlavička, texty)
- **Akcentní zlatá:** `#D4AF37` (tlačítka, aktivní prvky, hover)

## PostgreSQL

Systém využívá **Repository Pattern** pro snadný přechod na reálnou DB.

```bash
# Vytvořit databázi
createdb crmq
psql -d crmq -f server/src/db/schema.sql
psql -d crmq -f server/src/db/seed.sql
```

Pro přepnutí: vytvořte PG implementace v `server/src/repositories/pg/` a změňte factory v `index.ts`.

Schéma obsahuje:
- Všechny tabulky s relacemi a FK constraints
- Full-text search index na klientech
- Automatické `updated_at` triggery
- Activity log (audit trail)
- Tabulka příloh (attachments) pro fotky/dokumenty
