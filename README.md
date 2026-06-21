<div align="center">

# 🌌 Aurora Reader

**A glassy, dark/light e-book reader — log in, build your library, and read EPUB, PDF & TXT right in the browser.**
_read. easier._

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React%20Router-6-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.txt)

</div>

---

## ✨ Overview

Aurora Reader is a web-based e-book library and reader. Create an account, add your
books (with covers), and read them in a distraction-free view with adjustable
typography, bookmarks and saved reading progress — all wrapped in a glass-morphism UI
with an animated particle background and a full light/dark theme.

Originally a 2021–2022 student prototype (React 17 / Create React App / styled-components),
it has been rebuilt on a modern **TypeScript + Vite + Tailwind** stack with real,
working functionality.

> 🔒 **Where the data lives:** this is a **front-end-only** app. Accounts and book
> metadata are stored in `localStorage`; covers and book files are stored in
> **IndexedDB**. Everything works offline with no server. The auth and library layers
> are written behind a small async API so you can drop in a real backend (e.g. Supabase)
> without touching the UI — see [Going real](#-going-real).

## 🖥️ Features

| Feature           | Notes                                                                          |
| ----------------- | ------------------------------------------------------------------------------ |
| 🔐 **Accounts**   | Register / log in / log out, persisted session, protected routes               |
| 📚 **Library**    | Add / edit / delete books with cover + file upload (IndexedDB)                 |
| 🔎 **Organise**   | Search by title/author, filter by shelf (Unread / Reading / Finished), sort    |
| 📖 **Reader**     | Reads **EPUB** (epub.js), **PDF** (pdf.js / react-pdf) and **TXT**             |
| 🅰️ **Typography** | Adjustable font (serif/sans), size, line-height and column width               |
| 🔖 **Bookmarks**  | Add/jump/remove bookmarks per book                                             |
| 📈 **Progress**   | Reading position is saved and restored; auto-shelves to "Reading" / "Finished" |
| 🌗 **Theming**    | Light/dark toggle persisted to `localStorage`, system-preference aware         |
| ✨ **Particles**  | Animated cursor-trail canvas background (with proper teardown)                 |
| ♿ **Accessible** | Real buttons, keyboard nav (←/→ to page), focus states, ARIA labels            |
| ⚡ **Fast**       | Heavy reader engines are code-split and lazy-loaded on demand                  |

## 🛠️ Tech Stack

- **React 18** + **TypeScript 5**
- **Vite 5** (dev server + build)
- **Tailwind CSS 3** (`darkMode: 'class'`, design tokens ported from the original theme)
- **React Router 6**
- **epub.js** · **react-pdf** (pdf.js) — book rendering
- **idb-keyval** — IndexedDB blob storage
- **lucide-react** — icons

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:3000)
npm run dev

# 3. Type-check + production build  ->  /dist
npm run build

# 4. Preview the production build
npm run preview
```

No environment variables or backend are required — register an account and start adding books.

## 📂 Project Structure

```
aurora-reader/
├── index.html                 # Vite entry HTML (#root + #modal-root)
├── vite.config.ts             # Vite + React + "@/" path alias
├── tailwind.config.js         # theme tokens (accent / ink / graphite / paper / night)
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx               # React entry
    ├── App.tsx                # providers + Router 6 routes
    ├── index.css              # Tailwind layers + glass / button utilities
    ├── types.ts               # Book, User, Shelf, Bookmark, ReaderPrefs
    ├── lib/
    │   ├── storage.ts         # namespaced localStorage helpers
    │   ├── blobStore.ts       # IndexedDB blob store (covers + files)
    │   ├── crypto.ts          # password hashing + uid
    │   ├── auth.tsx           # AuthProvider / useAuth
    │   ├── library.tsx        # LibraryProvider / useLibrary (CRUD, progress, bookmarks)
    │   └── theme.tsx          # ThemeProvider / useTheme (dark mode)
    ├── hooks/
    │   ├── useBlobUrl.ts      # IndexedDB key -> object URL (auto-revoked)
    │   └── useReaderPrefs.ts  # persisted typography preferences
    ├── components/
    │   ├── ParticleBackground.tsx
    │   ├── Navbar.tsx · ThemeToggle.tsx · Dropdown.tsx · Modal.tsx
    │   ├── ProtectedRoute.tsx · PasswordInput.tsx
    │   ├── BookCard.tsx · BookFormModal.tsx
    │   └── readers/
    │       ├── types.ts           # shared ReaderHandle / ReaderViewProps
    │       ├── TxtReader.tsx
    │       ├── EpubReader.tsx
    │       ├── PdfReader.tsx
    │       └── ReaderControls.tsx  # typography + bookmarks + paging
    ├── pages/
    │   ├── Landing.tsx · Login.tsx · Register.tsx
    │   ├── Library.tsx         # the old "dashboard", now functional
    │   └── Reader.tsx          # picks a reader by file type
    └── Icons/                  # light/dark logo SVGs
```

## 🧭 Routes

| Path                  | Page    | Access                                        |
| --------------------- | ------- | --------------------------------------------- |
| `/`                   | Landing | public (redirects to `/library` if logged in) |
| `/login`, `/register` | Auth    | public                                        |
| `/library`            | Library | protected                                     |
| `/book/:id`           | Reader  | protected                                     |

## 🌐 Going real

Auth and library are isolated behind small async interfaces (`src/lib/auth.tsx`,
`src/lib/library.tsx`). To back the app with a real service (e.g. **Supabase**):

1. Re-implement `register` / `login` / `logout` against your auth provider.
2. Re-implement the library CRUD methods against your database + object storage,
   keeping the same method signatures.
3. The components, pages and routing stay exactly as they are.

> ⚠️ The client-side SHA-256 password hashing in `crypto.ts` exists only so a plaintext
> password is never written to `localStorage` in this prototype. Real authentication must
> be done server-side — delete it when you wire up a backend.

## 👥 Authors

Ula Mądzielewska · Pola Nadarzewska · Sandra Gołuńska · Krzysiek Wiłnicki

## 📄 License

Released under the [MIT License](LICENSE.txt). © 2021–2022 Aurora Reader.
