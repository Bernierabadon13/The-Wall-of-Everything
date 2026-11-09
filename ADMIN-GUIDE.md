# Admin guide: removing harassment and abuse

You can delete any message, for everyone, at any time. Three tools, from quickest to most powerful.

## 1. Admin page (easiest)
1. In `Code.gs`, set `ADMIN_KEY` to a long secret phrase (not a password you use elsewhere). Save.
2. Deploy -> Manage deployments -> pencil -> Version: **New version** -> Deploy.
3. Open `https://YOUR-SITE.vercel.app/admin`, type the key, press **Load messages**.
4. Search by word or name. Press **Delete** on any message. It disappears from every visitor's wall within about 15 seconds.

The key is only typed by you. It is never saved in the page or on GitHub.

## 2. By hand in Google
Apps Script -> Project Settings (gear) -> Script Properties. Each message is one row starting with `m:`. Delete the row.

## 3. Block words before they are posted
In `Code.gs` fill `BLOCKED`, for example `const BLOCKED = ["word1", "word2"];` (lower-case). Messages containing them are refused. Redeploy as a New version.

## Good to know
- The wall does not collect IP addresses or accounts, so you cannot ban a person. Deleting is your main tool, plus the captcha and the 10-second wait between posts.
- Names are free text and unverified. Messages from "Anonymous" still show the typed name to you in the admin page.
- Check the wall once a day at first. Add a contact line to your README so people can tell you about abuse.
