## Project Overview
We are building Postly, a professional, high-end social media automation dashboard designed to manage and schedule content across multiple social channels (X/Twitter, LinkedIn, Instagram).
The app includes:
- Seamless "Pitch Black" bento-grid experience
- Social media content scheduling (Buffer API)
- Media uploads via Cloudinary
- Multi-channel post creation (X, LinkedIn, Instagram)
- Quota protection and concurrent submission guards
Keep the implementation simple and readable.
---
## Tech Stack
- React (Vite-based)
- Vanilla JS (JSX)
- Vanilla CSS with custom utility classes (in `index.css`)
- `graphql-request` (Buffer API)
- Cloudinary SDK (Browser-side signed uploads)
- `lucide-react` (Icons)
Do not introduce new major libraries unless there is a strong reason.
Ask before installing anything new.
---
## Development Philosophy
Build feature by feature.
For every feature:
1. Read this file first.
2. Keep the implementation simple.
3. Avoid overengineering.
4. Prefer readable code over clever code.
5. Build the smallest useful version first.
6. Refactor only when repetition appears.
---
## Decision Making
If something is unclear or could be improved, suggest a better
approach. If a new library would significantly help, recommend it,
explain why, and ask before adding it.
Do not install new libraries without approval.
---
## Architecture
Use this folder structure:
```
src/
  api/
  assets/
  components/
  context/
  hooks/
  pages/
  utils/
```
**src/pages/** is for routes and views (like Dashboard, Compose). Screens compose components and call hooks or APIs.
**src/components/** is for reusable UI. Create a component when it is reused in multiple places. Examples for this app: `PostComposer`, `Sidebar`, `StatsCard`, `BentoGrid`.
**src/api/** holds Buffer and Cloudinary API connections, mutations/queries, caching logic, and submission throttles (`buffer.js`, `cloudinary.js`).
**src/utils/** holds shared logic, formatting, and authentication.
**src/index.css** is the core design system and utility classes.
---
## UI Rules
For any UI task:
- Always use the core Pitch Black palette: `#000000` (Background), `#050505` (Bento Background), `#0a0a0a` (Component/Button Background).
- Use premium spacing: `2.5rem` padding for bento items and `2.5rem` border-radius.
- Do not approximate. Do not simplify unless explicitly asked.
- Bento Overlap: Ensure bento grid spans (`span-2`, `row-2`) are correctly mapped in `index.css`.
---
## Styling Rules
Use Vanilla CSS with the custom-built utility system in `index.css`.
Do not use Tailwind CSS or CSS-in-JS libraries unless explicitly added.
Do not change the CSS variables in `:root` (`index.css`) as they define the entire project's aesthetic.
---
## Media Pipeline
Local images are uploaded to Cloudinary first. The resulting secure URL is then passed to Buffer.
Use `src/api/cloudinary.js` for signed upload implementations.
---
## State Management
- React Hooks (useState, useEffect, useContext) for component state.
- Persistent caching in the API layer.
- Ensure strict concurrency control: All mutations MUST be guarded at both the UI level (using `useRef`) and the API level (using a global throttle flag like `isCreatingPost`).
---
## API & Concurrency
- **Rate Limits**: Buffer has a strict 24-hour window for rate limits and a 100-post daily quota. If a `429` occurs, fallback to persistent cache.
- **Sequential Requests**: Multi-channel operations must be processed sequentially (`for...of` with `await`), not in parallel.
- **Empty States vs. Loading**: Always use loading flags to distinguish between "No data" and "Still fetching" to avoid UI flickering.
- **Buffer API Pathing**: Route through Vite proxy (`/api-buffer/graphql`).
- **Instagram Metadata**: Instagram posts must be nested inside `metadata.instagram.type` and include `shouldShareToFeed: true`.
---
## Feature Implementation
When building a feature:
1. Read this file first.
2. Identify the files to change.
3. Keep changes focused.
4. Do not rewrite unrelated code.
5. Follow existing patterns.
6. Make sure the feature works end to end.
---
## Secrets
- Never expose secret keys in client code.
- Environment Variables: `.env` protects `ORG_ID`, `API_KEY`, and Cloudinary secrets. Never commit secrets.
---
## Communication
Be concise. Explain what changed and how to test it.
---
## Final Reminder
Before every feature:
- Read this file and `context.md`.
- Follow strict submission throttles to protect Buffer quota.
- Build clean, simple code matching the Pitch Black Bento aesthetic.