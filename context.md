# Postly - Project Context

## Project Purpose
Postly is a professional, high-end social media automation dashboard designed to manage and schedule content across multiple social channels (X/Twitter, LinkedIn, Instagram). It leverages the **Buffer GraphQL API** to provide a seamless "Pitch Black" bento-grid experience for content creators and social media managers.

## Tech Stack
- **Frontend**: React (Vite-based)
- **Styling**: Tailwind CSS with `shadcn/ui` components.
- **API Communication**: `graphql-request` for interfacing with Buffer's GraphQL endpoint (`/graphql`).
- **Media Hosting**: **Cloudinary SDK** for secure, signed image uploads.
- **Icons**: `lucide-react`
- **Interactive Components**: `react-datepicker` for scheduling.
- **State Management**: **Zustand** for global state (Auth, Navigation, API Cache, UI Toasts), and React Hooks (useState) strictly for ephemeral UI state.

## Architecture Summary
The project follows a modular React architecture focused on performance and design consistency:
- **API Layer (Buffer)**: Centralized in `src/api/buffer.js`. Includes a **Hardened Caching & Deduplication Layer** and a **Strict Submission Throttle** (`isCreatingPost`) to prevent redundant requests.
- **API Layer (Cloudinary)**: Centralized in `src/api/cloudinary.js`. Handles browser-side signed uploads using SHA-1 signature generation.
- **Component Layer**: Reusable UI blocks in `src/components`. These are built as "Bento boxes" with high-fidelity padding (`2.5rem`) and large border-radius (`2.5rem`).
- **Store Layer**: Centralized Zustand state in `src/store/useStore.js` managing UI, auth, and data caching.
- **Page Layer**: Pages like `Dashboard.jsx` connect to the store to display data and manage granular loading states.
- **Utility Layer**: Shared logic for authentication (OAuth PKCE) and data formatting.

## Important Folders & Ownership
- **`/src/api`**: Owns the Buffer and Cloudinary API connections, mutations/queries, and error handling logic.
- **`/src/components`**: Owns the interactive modules (PostComposer, Sidebar, etc.).
- **`/src/pages`**: Owns the high-level layout and page-specific business logic.
- **`/src/store`**: Owns the centralized Zustand state (`useStore.js`) handling UI, auth, and buffer data cache.
- **`/src/utils`**: Owns the authentication flow and global helper functions.

## Coding Conventions
1. **Pitch Black Design**: Always use the core palette: `#000000` (Background), `#050505` (Bento Background), `#0a0a0a` (Component/Button Background).
2. **Premium Spacing**: Use `2.5rem` padding for bento items and `2.5rem` border-radius.
3. **Strict Concurrency Control**: All mutations (like `createPost`) MUST be guarded at both the UI level (using `useRef`) and the API level (using a global throttle flag). This prevents quota exhaustion from rapid clicks or race conditions.
4. **Sequential Requests**: Multi-channel operations must be processed sequentially (`for...of` with `await`), not in parallel, to avoid hitting per-second rate limits.
5. **Robust API Calls**: Use the `request` helper in `buffer.js`. Failed requests must NEVER overwrite the cache with empty arrays. Always implement "Stale-While-Error" fallback logic.
6. **Media Pipeline**: Local images are uploaded to **Cloudinary** first. The resulting secure URL is then passed to Buffer.

## What Not To Change
- **Buffer API Pathing**: The `API_URL` must include `/graphql` and route through the Vite proxy (`/api-buffer/graphql`).
- **Submission Guards**: Do not remove the `isSubmitting` (UI) or `isCreatingPost` (API) flags; they are essential for protecting the user's post quota.
- **Instagram Metadata Structure**: Instagram posts *must* be nested inside `metadata.instagram.type` and include the mandatory `shouldShareToFeed: true` boolean.
- **Theme Variables**: Do not change the CSS variables in `:root` (`index.css`) as they define the entire project's aesthetic.

## Common Pitfalls
- **Rate Limits**: Buffer has a strict 24-hour window for rate limits and a 100-post daily quota. If a `429` occurs, the app must rely on the persistent cache.
- **Empty States vs. Loading**: Always use `isLoadingChannels` to distinguish between "No data" and "Still fetching" to avoid UI flickering.
- **Bento Overlap**: Ensure bento grid spans (`span-2`, `row-2`) are correctly mapped in `index.css`.

## Security & Credentials
- **Environment Variables**: The `.env` file is ignored by Git to protect `ORG_ID` and `API_KEY`. Never commit secrets to the repository.

## Key Files to Read First
1. **`src/api/buffer.js`**: Hardened API logic including the caching and submission throttle layers.
2. **`src/store/useStore.js`**: The central Zustand state brain for auth, navigation, and data caching.
3. **`src/components/PostComposer.jsx`**: The core action component with multi-layered submission guards.
4. **`src/index.css`**: Review the design system, bento grid rules, and high-fidelity toggle styles.
5. **`src/api/cloudinary.js`**: Signed upload implementation for media assets.

---
*Last Updated: 2026-05-12 (v2.2 Quota Protection Update)*
