# Postly - Project Context

## Project Purpose
Postly is a professional, high-end social media automation dashboard designed to manage and schedule content across multiple social channels (X/Twitter, LinkedIn, Instagram). It leverages the **Buffer GraphQL API** to provide a seamless "Pitch Black" bento-grid experience for content creators and social media managers.

## Tech Stack
- **Frontend**: React (Vite-based)
- **Styling**: Vanilla CSS with a custom-built utility system (Tailwind-style) in `index.css`.
- **API Communication**: `graphql-request` for interfacing with Buffer's GraphQL endpoint (`/graphql`).
- **Media Hosting**: **Cloudinary SDK** for secure, signed image uploads.
- **Icons**: `lucide-react`
- **Interactive Components**: `react-datepicker` for scheduling.
- **State Management**: React Hooks (useState, useEffect) with a modular API service layer and persistent caching.

## Architecture Summary
The project follows a modular React architecture focused on performance and design consistency:
- **API Layer (Buffer)**: Centralized in `src/api/buffer.js`. Includes a **Hardened Caching & Deduplication Layer** that handles rate-limiting (`429`) by falling back to stale cache instead of showing empty data.
- **API Layer (Cloudinary)**: Centralized in `src/api/cloudinary.js`. Handles browser-side signed uploads using SHA-1 signature generation.
- **Component Layer**: Reusable UI blocks in `src/components`. These are built as "Bento boxes" with high-fidelity padding (`2.5rem`) and large border-radius (`2.5rem`) to maintain a premium aesthetic.
- **Page Layer**: The `Dashboard.jsx` acts as the primary state controller, orchestrating data flow and managing granular loading states (`isLoadingChannels`).
- **Utility Layer**: Shared logic for authentication (OAuth PKCE) and data formatting.

## Important Folders & Ownership
- **`/src/api`**: Owns the Buffer and Cloudinary API connections, mutations/queries, and error handling logic.
- **`/src/components`**: Owns the interactive modules (PostComposer, Sidebar, etc.).
- **`/src/pages`**: Owns the high-level layout and page-specific business logic.
- **`/src/utils`**: Owns the authentication flow and global helper functions.
- **`/public`**: Owns static assets (logos, global icons).

## Coding Conventions
1. **Pitch Black Design**: Always use the core palette: `#000000` (Background), `#050505` (Bento Background), `#0a0a0a` (Component/Button Background).
2. **Premium Spacing**: Use `2.5rem` padding for bento items and `2.5rem` border-radius. Avoid "clustered" layouts; prioritize whitespace and high-end typography.
3. **Robust API Calls**: Use the `request` helper in `buffer.js`. Failed requests (e.g., 429s) must NEVER overwrite the cache with empty arrays. Always implement "Stale-While-Error" fallback logic.
4. **Utility-First CSS**: Prefer adding utility classes to `index.css` over writing inline styles. Maintain the naming convention (e.g., `w-32`, `h-32`, `bg-[#050505]`).
5. **Media Pipeline**: Local images are uploaded to **Cloudinary** first. The resulting secure URL is then passed to Buffer.
6. **Documentation First**: Always update `context.md` to reflect any architectural, logic, or convention changes made to the codebase. Documentation must remain the "source of truth" for the project's state.

## What Not To Change
- **Buffer API Pathing**: The `API_URL` must include `/graphql` and route through the Vite proxy (`/api-buffer/graphql`).
- **Surgical Cache Clearing**: The "Zap" button logic must only remove `postly_cache_*` keys; it must NOT clear authentication tokens (`buffer_tokens`).
- **Instagram Metadata Structure**: Instagram posts *must* be nested inside `metadata.instagram.type` and include the mandatory `shouldShareToFeed: true` boolean.
- **Theme Variables**: Do not change the CSS variables in `:root` (`index.css`) as they define the entire project's aesthetic.

## Common Pitfalls
- **Rate Limits**: Buffer has a strict 24-hour window for rate limits. If a `429` occurs, the app must rely on the persistent cache in `localStorage`.
- **Empty States vs. Loading**: Always use `isLoadingChannels` to distinguish between "No data" and "Still fetching" to avoid UI flickering.
- **Bento Overlap**: Ensure bento grid spans (`span-2`, `row-2`) are correctly mapped in `index.css` to prevent layout breaking on small screens.

## Security & Credentials
- **Environment Variables**: The `.env` file is ignored by Git to protect `ORG_ID` and `API_KEY`. Never commit secrets to the repository.

## Key Files to Read First
1. **`src/api/buffer.js`**: Hardened API logic including the caching/deduplication layer.
2. **`src/index.css`**: Review the design system, bento grid rules, and high-fidelity toggle styles.
3. **`src/pages/Dashboard.jsx`**: The unified state brain; handles the core dashboard lifecycle.
4. **`src/components/PostComposer.jsx`**: Manages complex multi-channel media scheduling.
5. **`src/api/cloudinary.js`**: Signed upload implementation for media assets.

---
*Last Updated: 2026-05-11 (v2.1 Security & Git Update)*
