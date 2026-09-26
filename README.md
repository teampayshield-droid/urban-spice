# Urban Spice — QR Restaurant Ordering System

A complete restaurant QR ordering + admin management app (Next.js, TypeScript, Tailwind, Prisma/SQLite).

## Requirements
- Node.js 18+ installed (https://nodejs.org)

## Setup (Windows CMD)

Open Command Prompt in this project folder, then run each command one by one:

```
npm install
```

```
npx prisma migrate dev --name init
```

```
npm run seed
```

```
npm run dev
```

## Using the app

1. Open your browser to: http://localhost:3000
2. Click "View Demo Menu (Table 1)" to see the customer ordering flow, or scan any table's QR code from the admin panel.
3. Go to http://localhost:3000/admin/login to manage the restaurant.
   - Email: admin@restaurant.com
   - Password: admin123
4. In Admin → Tables, each table has a QR code pointing to `/menu?table=<number>`. Print or display these at each table.
5. In Admin → Orders, update order status as the kitchen prepares food — the customer's tracking page updates automatically (polls every few seconds).

## Payments

Customers can select cash, UPI, or card at checkout. This project does not include a payment gateway, so the selection is saved as the order's payment method and staff collects payment at the restaurant. In Admin → Orders, staff can mark an order as paid after collection.

## Dish guide AI

Set `OPENAI_API_KEY` in `.env` to enable generated dish answers. `OPENAI_MODEL` is optional and defaults to `gpt-4o-mini`. Without a key, the guide answers from the dish's menu description, category, dietary label, preparation time, price, and availability. It does not provide recipes or cooking instructions; ask restaurant staff about ingredients and allergens.

## Notes
- Database file is `prisma/dev.db` (SQLite). Delete it and re-run migrate + seed to reset all data.
- GST percentage is configurable in Admin → Settings and is applied server-side to every order.
- All prices/totals are calculated on the server, never trusted from the browser.
