# 🔐 Password Manager

Personal password manager built with **Next.js** that uses **Zero‑Knowledge encryption**. All cryptographic operations run in the browser via the **Web Crypto API**, so the server only stores encrypted data and never sees your passwords.

## Features

- Zero‑Knowledge Architecture (client‑side encryption & decryption)
- Offline‑first capabilities
- Secure Secret‑Key generator (local dictionary, 4 random words + numeric suffix)
- Customizable password generator (length, charset, symbols, exclusions)
- Real‑time password strength analysis
- Breach detection using k‑Anonymity (Have I Been Pwned API)
- Statistics dashboard (total, weak, compromised, duplicates, age, categories, health score)
- Import / Export (JSON & encrypted JSON)
- Category management, search, filter, bulk actions
- Modern UI built with Tailwind CSS, shadcn/ui, Neobrutalism UI, Radix UI, Lucide icons

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Neobrutalism UI, Radix UI, Lucide React
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack React Query, Zustand
- **Database**: Prisma ORM with SQLite and `@prisma/adapter-libsql`
- **Cryptography**: Web Crypto API, hash‑wasm, Argon2id, HKDF, AES‑256‑GCM
- **Utilities**: date‑fns, sonner, cmdk, nanoid

## Architecture Overview

1. **User enters** Master Password and Secret Key.
2. Both values are concatenated and salted, then fed to Argon2id to derive a Master Key.
3. Master Key is split via HKDF into an Encryption Key (`encKey`) and a MAC Key (`macKey`).
4. A random Vault Key is generated and encrypted with `encKey` (AES‑256‑GCM). The encrypted Vault Key and the salt are stored in the SQLite database.
5. All vault items (website, username, password, etc.) are encrypted with the Vault Key before being persisted.
6. Decryption follows the reverse flow; no secret material ever leaves the client.

The database only ever contains:
- `salt`
- `protectedVaultKey`
- Encrypted password items (nonce + ciphertext)

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd password-manager

# Install dependencies (pnpm is recommended)
pnpm install

# Apply database migrations
pnpm prisma migrate dev

# Start the development server
pnpm dev
```

Open **http://localhost:3000** in your browser to see the app.

## Scripts

- `pnpm dev` – Start development server
- `pnpm build` – Build production assets
- `pnpm start` – Run the built app
- `pnpm prisma migrate dev` – Run Prisma migrations locally

## Docker

### Build and Run

You can run the application with Docker. The repository contains a multi‑stage `Dockerfile` and a `docker-compose.yml` that sets up both the migration and the app service.

#### Using Docker Compose

```bash
# Build images and start services (migrations run automatically)
docker compose up --build

# Or run in detached mode
docker compose up -d --build
```

The `docker-compose.yml` defines two services:

- `migrate` – builds the `migrator` stage of the Dockerfile and runs `pnpm prisma migrate deploy` to apply database migrations. It uses a named volume `password_manager` to persist the SQLite database.
- `app` – builds the `production` stage and serves the Next.js app on port `3000`. It depends on the `migrate` service, so the database is ready before the app starts.

#### Using Docker directly

```bash
# Build the production image
docker build -t password-manager:latest --target production .

# Run migrations (once)
docker run --rm \
  -e DATABASE_URL=file:/app/database/passwordManager.db \
  -v password_manager:/app/data \
  password-manager:latest \
  pnpm prisma migrate deploy

# Run the app
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=file:/app/database/passwordManager.db \
  -v password_manager:/app/data \
  --name password-manager \
  password-manager:latest
```

The application will be available at **http://localhost:3000**. The SQLite database is stored in the Docker volume `password_manager`, so data persists across container restarts.

## Security & Privacy

- **Zero‑knowledge**: The backend never receives Master Password, Secret Key, Vault Key, or plaintext passwords.
- All keys are derived client‑side using Argon2id and HKDF.
- Only `salt` and the encrypted Vault Key are persisted.
- Password breach checks use k‑Anonymity: only the first 5 SHA‑1 hash characters are sent to the external API.
