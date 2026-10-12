# quicksell-backend-damping: the first QuickSell, a price-damping service for Kaspi.kz

This is an old project: the first version of QuickSell, built from December 2024 to June 2025.
Back then QuickSell was a **price-damping service** for sellers on [Kaspi.kz](https://kaspi.kz),
Kazakhstan's largest marketplace. A bot watched competitors' prices on each of the seller's products
and automatically set the seller's price just below them, within limits the seller chose, so the
seller stayed the cheapest offer.

QuickSell later changed direction and was rebuilt from scratch as profit analytics for Kaspi sellers:
[quicksell-backend](https://github.com/AkimovRatmir/quicksell-backend).

## How it works

```
seller ──► NestJS API (JWT) ──► MongoDB: organization, Kaspi login (encrypted), damping settings
              │
              └─ POST /organizations/start-bot
                    └──► Python bot (Playwright), one process per seller
                           1. signs in to the Kaspi seller cabinet
                           2. goes through every active product, page by page
                           3. opens the product on kaspi.kz and reads the lowest offer
                           4. sets the new price in the cabinet: competitor − step,
                              never below the product's min price (or above its max)
                           5. saves prices and products to MongoDB, repeats while the bot is on
```

- **Damping bot** (`src/magic/py_bot_mongo.py`): a Playwright bot that sets prices through the
  seller cabinet UI. Each product has its own settings: lower price on/off, raise price on/off,
  step, min and max price. New products get defaults from the seller's global percentages, up to
  the product limit of the seller's plan. It keeps cycling until the seller stops it or the plan is
  no longer paid. After page 10 of a catalog it starts a second browser to work in parallel.
- **Bot control** (`src/magic`, `src/organization`): the API starts the Python process for an
  organization and hands it a short-lived signed JWT instead of passing credentials on the command
  line. Start and stop are per organization.
- **Accounts** (`src/auth`, `src/organization`): registration creates an organization, JWT auth,
  bcrypt passwords. Kaspi cabinet passwords are stored encrypted (AES-256-CBC) and decrypted only by
  the bot.
- **Orders** (`src/kaspiApi`, `src/orderCollection`): orders pulled from the Kaspi Shop API by date
  and status, with accepting (moving to assembly) and cancelling orders, an archive and per-product
  sales totals.
- **Products** (`src/botbaza`): the seller's products with their damping settings, bulk update for
  all products, and an image proxy for the frontend.
- Swagger docs at `/api`.

## Stack

TypeScript · NestJS 10 · MongoDB / Mongoose · Passport JWT · bcrypt · Swagger · Python · Playwright ·
Kaspi Shop API · Docker

## Running it

Requires Node.js 18+, Python 3.10+, Docker, and a Kaspi seller account to actually run the bot.

```bash
npm install
cp .env.example .env
docker compose up -d mongodb          # MongoDB on localhost:27017

python3 -m venv venv                  # the API starts the bot with venv/bin/python3
venv/bin/pip install -r requirements.txt
venv/bin/playwright install chromium

npm run start:dev                     # http://localhost:3000, API docs at /api
```

Register, save the Kaspi cabinet login with `PUT /organizations/update`, then start the bot with
`POST /organizations/start-bot`.

The bot finds elements on Kaspi's pages by CSS selectors from 2025, so it will need updating to work
against today's Kaspi.

## Author

**Ratmir Akimov**: [github.com/AkimovRatmir](https://github.com/AkimovRatmir)

## License

All rights reserved. The code is published for viewing only. See [LICENSE](LICENSE).
