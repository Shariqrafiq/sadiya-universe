# Host on GitHub + connect the free database (step by step)

Total time: about 30 minutes. Cost: 0. You need a GitHub account and a Supabase account (sign in with GitHub).

---
## Part 1. Put the code on GitHub

1. Go to github.com, click **New repository**.
   - Name: for example `sadiya-universe`
   - Visibility: **Public** (GitHub Pages is free only for public repos. This is safe: the code contains no passwords. Your real text and photos live in the private database.)
   - Do not add a README (this project has one).
2. Unzip `sadiya-universe.zip` on your computer.
3. Upload the files. Either:
   - **Easy way:** on the empty repo page click **uploading an existing file**, drag in everything *inside* the unzipped folder (including the hidden `.github` and `.gitignore`; if your system hides them, use the command-line way), then **Commit changes**.
   - **Command-line way:**
     ```bash
     cd sadiya-universe
     git init
     git add .
     git commit -m "First version"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/sadiya-universe.git
     git push -u origin main
     ```
4. After the first successful build, run `npm install` once on your computer and commit the generated `package-lock.json` (it pins exact dependency versions).

---
## Part 2. Create the free database (Supabase)

1. Go to **supabase.com**, **Start your project**, sign in with GitHub.
2. **New project**. Choose the **Free** plan. Name it, set a database password (save it in a password manager), pick the region closest to you (for India: Mumbai or Singapore). Wait 1-2 minutes.
3. **Create the tables and private storage:**
   - Left menu **SQL Editor** > **New query**.
   - Open `supabase/schema.sql` from the project, copy everything, paste, click **Run**. You should see "Success".
   - Check: **Table Editor** shows `admins`, `site_content`, `gift_progress`. **Storage** shows a bucket `private-media` marked *private*.
4. **Lock down sign-ups:** **Authentication** > **Sign In / Providers** (or **Providers**) > **Email**:
   - Turn **off** "Allow new users to sign up".
   - Set minimum password length to 12 or more.
5. **Create the two accounts:** **Authentication** > **Users** > **Add user** > **Create new user**. Tick **Auto Confirm User**.
   - Account A, **Sadiya's login**: an email you own (e.g. `sadiya.site@gmail.com`) and the **secret password** you want her to type.
   - Account B, **your admin login**: your own email and a strong password.
6. **Make account B the admin:** SQL Editor > New query:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'YOUR_ADMIN_EMAIL';
   ```
   Run it. Check **Table Editor > admins** has one row.
7. **Copy your keys:** **Project Settings** > **API** (or **API Keys**):
   - **Project URL**, like `https://abcd1234.supabase.co`
   - **anon / public key** (long text starting `eyJ...` or `sb_publishable_...`)
   - NEVER use the `service_role` / secret key anywhere in this project.
   The anon key is meant to be public; the database rules (RLS) are what protect your data.

---
## Part 3. Give GitHub the keys

In your GitHub repo: **Settings** > **Secrets and variables** > **Actions** > **New repository secret**. Add three secrets:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | the Project URL |
| `VITE_SUPABASE_ANON_KEY` | the anon/public key |
| `VITE_LOGIN_EMAIL` | **Sadiya's** account email (Account A) |

---
## Part 4. Turn on the website

1. Repo **Settings** > **Pages** > **Build and deployment** > Source: **GitHub Actions**.
2. Go to the **Actions** tab. The "Deploy to GitHub Pages" workflow runs on every push to `main` (or click **Run workflow**). Wait for the green tick (about 2 minutes).
3. Your site: `https://YOUR_USERNAME.github.io/sadiya-universe/`
4. Back in Supabase: **Authentication** > **URL Configuration** > set **Site URL** to that address.

If the build fails with a red cross, open the failed run and read the error. Common causes: a secret is missing or misspelled, or a TypeScript error (send it to me and I will fix it).

---
## Part 5. Add your photos, voice and text

1. Open `https://YOUR_USERNAME.github.io/sadiya-universe/#/admin`
2. Sign in with **your admin** email and password (Account B).
3. You land in **Studio**:
   - **Memories**: add photos, choose a frame and colour, edit title, date, story, reorder.
   - **Gifts**: all 12, each with message and optional photo.
   - **Words**: main message, birthday, "together since" date (turns on the live Love Counter), cake wish, love letter, date-jar ideas, hidden notes.
   - **Voice**: upload a voice note or video; edit the caption.
   - **Look**: colour theme.
4. Press **Save changes** (bottom of the screen). Photos upload the moment you pick them; the text and the file list are saved when you press Save.
5. Sadiya opens the site address, taps **Enter**, types her secret. She cannot see the Studio.

### Where everything is stored
- Photo and voice **files**: Supabase **Storage** > bucket `private-media` (private; folders `photos/` and `voice/`).
- **Text**, frame choices, and file paths: Supabase **Table Editor** > `site_content` (one row, id `main`).
- Her opened-gifts progress: `gift_progress`.

### Free limits (as of Nov 2026, confirm at supabase.com/pricing)
1 GB files, 500 MB database, 50 MB per file, 5 GB downloads/month. Photos are auto-shrunk to about 300 KB, so roughly 3,000 photos fit.
**Important:** free projects **pause after 7 days with no activity**. Open the Supabase dashboard (or the site) at least once a week until after the birthday. If it pauses, click **Restore** on the dashboard.

---
## Part 6. Check that it is secure
1. Open the site in a private window and try `#/world`: you are sent back to the login.
2. Sign in as Sadiya, then try `#/studio`: you are sent to the admin sign-in.
3. In Supabase **Storage**, the `private-media` bucket must say **Private**.
4. In Supabase **Authentication**, sign-ups are off.
5. Never paste the `service_role` key anywhere.

## Updating later
Change code, then `git add . && git commit -m "update" && git push`. The site rebuilds automatically. Content changes made in the Studio need no rebuild.

## Common problems
| Problem | Fix |
|---|---|
| Blank page on GitHub Pages | Pages source must be **GitHub Actions**; check the Actions run is green |
| "The site is not set up yet" at login | A secret is missing; re-run the workflow after adding it |
| Wrong password message for the correct secret | `VITE_LOGIN_EMAIL` must be Sadiya's account email; reset her password in Supabase > Authentication > Users |
| Upload fails | You are not signed in as admin, or step 6 (admins insert) was skipped |
| Photos missing after a few days | Project was paused: restore it in the Supabase dashboard |
| Website looks unchanged after Save | Hard refresh (Ctrl+Shift+R) |
