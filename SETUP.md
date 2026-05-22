# Prime Motors — Setup Guide

## Quick Start
```bash
npm install
cp .env.example .env    # fill in Supabase credentials
npm run dev             # http://localhost:3000
```

## Supabase Setup
1. [supabase.com](https://supabase.com) → New Project (region: Mumbai)
2. SQL Editor → paste `supabase/schema.sql` → Run
3. Settings → API → copy **Project URL** + **anon key** → paste in `.env`

## .env
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Config (`src/config.js`)
```js
ADMIN_PASSWORD: 'prime@2025',   // change this
WA_NUMBER:      '919700330087', // already correct
```

## Deploy (Netlify)
```bash
npm run build
# Drag dist/ to netlify.com
# Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in Site Settings → Env Vars
```

## Pages
| URL | Description |
|-----|------------|
| `/` | Public site |
| `/admin.html` | Admin panel (password protected) |
| `/invoice.html` | Create invoice |
| `/invoice.html?car=ID` | Invoice pre-filled from inventory |
| `/invoice.html?view=ID` | View/print existing invoice |

## Features

### Invoice (Delivery Note Cum Intermediator Receipt)
- Matches exact physical format
- Logo in header + watermark
- Multiple payment rows (Cash/Online/Cheque/Finance)
- Manual entry — no inventory car required
- Admin-only fields (brokerage, admin notes) — NOT printed
- Print-ready with `@media print`

### Business Type (Admin Only)
Each car has:
- `business_type`: owned / consignment
- `buy_price`, `brokerage`, `broker_name`
These never appear on the public site.

### Leads
- Auto-tracked on every WhatsApp + Call click
- Manual lead entry in admin → Leads tab
- Filter leads per car
- Source: whatsapp_card, whatsapp_detail, whatsapp_banner, call_card, call_detail, manual

### Dynamic Inventory Count
Hero shows `COUNT(*) WHERE status = 'available'` — live from Supabase.

### WhatsApp
All links use `getWhatsAppLink()` from `src/config.js`.
Number: `919700330087` → `https://wa.me/919700330087`
