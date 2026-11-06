# A Little Universe Made for Sadiya

React + TypeScript + Vite + Tailwind + Framer Motion + React Three Fiber + Supabase.
You edit everything (text, photos, frames, voice, theme) in the in-app **Studio**. No code changes needed.

> **Hosting on GitHub Pages?** Follow `docs/GUIDE.md` (step by step). The workflow in `.github/workflows/deploy.yml` builds and publishes automatically.

## How uploaded photos and voice are stored (free)

| What | Where | Why it is free |
|---|---|---|
| Photo and voice **files** | Supabase **Storage**, private bucket `private-media` | Free plan: 1 GB file storage, 50 MB max file, 5 GB egress per month |
| All **text**, frame choices, and the *paths* of the files | Supabase **Postgres**, table `site_content` (one JSON row) | Free plan: 500 MB database. Your text is a few KB |
| Who may do what | Postgres **Row Level Security** + Storage policies | Included |

Flow when you press **Save** in the Studio:
1. You pick a photo. The browser shrinks it to about 1400 px JPEG (roughly 150-400 KB) before upload.
2. It uploads to `private-media/photos/<random-id>.jpg`. Only the admin account is allowed to write.
3. The Studio stores the path in the `site_content` row, together with your text and frame choices.
4. When Sadiya signs in, the site loads that row, then asks Storage for a **signed URL** valid for 1 hour for each photo. The bucket is never public, so a copied link stops working.
5. Replaced or removed photos are deleted from Storage after a successful save, so you do not waste space.

Capacity: about 1 GB / 300 KB, so roughly 3,000 photos. A 12-memory + 12-gift site uses well under 20 MB.

Free-plan limits to know (checked against supabase.com/pricing, but limits can change):
- Free projects **pause after 7 days of inactivity**. Open the project dashboard once a week, or add a free weekly ping, until after the birthday.
- 2 active free projects per account.
- Backups are not included on Free. Keep your originals.

## Setup (about 15 minutes)

1. **Supabase project**: supabase.com, New project (Free plan).
2. **SQL Editor**: paste `supabase/schema.sql`, Run.
3. **Authentication > Providers > Email**: turn **off** "Allow new users to sign up". Set minimum password length to 12 or more.
4. **Authentication > Users > Add user** (twice, tick "Auto confirm"):
   - Sadiya's account: any email you control + the secret you will tell her. This is her "secret password".
   - Your admin account: your own email + a strong password.
5. **SQL Editor**, make yourself admin:
   `insert into public.admins (user_id) select id from auth.users where email = 'YOUR_ADMIN_EMAIL';`
6. **Project Settings > API**: copy the Project URL and the **anon** key (never the service_role key).
7. `cp .env.example .env.local` and fill `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_LOGIN_EMAIL` (Sadiya's account email), `VITE_DEMO_MODE=false`.
8. `npm install && npm run build && npm run audit`, then `npm run dev` to test.
9. Open `/admin`, sign in with your admin account, edit in **Studio**, press **Save changes**.
10. Sadiya opens the site, taps Enter, types the secret.

## Try it without Supabase (demo mode)
Set `VITE_DEMO_MODE=true` in `.env.local`, run `npm run dev`. Any password works, the Studio is open, text saves to localStorage, and photos live in memory (they vanish on refresh). Demo mode is disabled in production builds.

## Deploy free
GitHub Pages (recommended, see `docs/GUIDE.md`), or Vercel/Netlify. The site uses hash routes (`/#/login`) so it works on any static host. `vercel.json` is only needed on Vercel.

## Security model
- Sadiya's account can **read** content and files and write only her own gift progress. Only users in `public.admins` can write content or upload/delete files (enforced by RLS, not by the UI).
- No service-role key in the browser. Anonymous users can read nothing.
- Supabase Auth hashes passwords and rate-limits sign-ins (Authentication > Rate limits). Errors are generic.
- Files are type-checked (jpeg/png/webp/mp3/m4a/mp4/webm) and limited to 50 MB on the client and by the bucket.
- Session tokens live in localStorage (supabase-js default), not HttpOnly cookies. Fine for this use; for cookies you would need a small server layer.
- Text from the Studio is rendered by React (escaped). No `dangerouslySetInnerHTML`.

## Verify
1. Logged out, open `/studio` or `/world`: you are redirected.
2. Sign in as Sadiya, open `/studio`: redirected to `/admin` (not admin).
3. As Sadiya, try an upload from the browser console: Storage returns a policy error.
4. Open a photo's signed URL after an hour: it fails. Try the bucket's plain public URL: it fails.
5. `curl -I` your deployed site: check CSP, HSTS, nosniff, frame headers.

## Where things are
`src/lib/content.tsx` (content, uploads, signed URLs) · `src/pages/Studio.tsx` (editor) · `src/components/Frame.tsx` + `styles/globals.css` (photo frames, 4 colour themes) · `src/config/*` (starting defaults only) · `supabase/schema.sql` (tables, RLS, storage).
