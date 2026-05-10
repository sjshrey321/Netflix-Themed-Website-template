# 🎬 Your Love Story — A Netflix-Themed Memory Site

> A static, fork-friendly Netflix-themed website for celebrating your relationship milestones. No build step. No backend. Just edit one file, drop your photos, push, and you're live.

![Netflix Boot → Profiles → Home → Credits](https://img.shields.io/badge/scenes-4-E50914?style=flat-square)
![No Build](https://img.shields.io/badge/build-none-success?style=flat-square)
![GitHub Pages Ready](https://img.shields.io/badge/GitHub_Pages-ready-success?style=flat-square)

---

## ✨ What is this?

A four-scene experience inspired by Netflix's UI, rebuilt as a love letter:

1. **Boot** — Tap to begin. Your custom intro video plays with sound.
2. **Profiles** — "Who's watching?" with 4 timeline avatars (1 month, 3 months, 6 months, 1 year).
3. **Home** — Per-profile hero (with playable fullscreen video), Netflix-style memory rows.
4. **Credits** — Cinematic rolling credits (movie-style!) with a floating clip player.

All driven by a single `config.js` — change names, descriptions, and personal credits without touching any code.

---

## 🚀 Quick Start (Forking)

### 1. Fork this repo
Click **Fork** at the top of this page on GitHub.

### 2. Edit `config.js`
Open `config.js` and fill in your names + favorite spot:
```js
partners: {
  you:  "Aryan",
  them: "Jia"
},
location: "Goa",
```

That's it for words — every `{you}`, `{them}`, `{location}` template in the site auto-fills.

If you want to customize hero descriptions or personal credits, scroll through `config.js` — every editable string is there with comments.

### 3. Drop your assets

Use these **exact filenames** in the `assets/` folder:

| Folder | File | What it is |
|---|---|---|
| `assets/intro/` | `intro.mp4` | Your custom Netflix-style intro (3–5s, with the iconic "ta-dum") |
| `assets/profiles/` | `profile-1month.jpg`, `profile-3month.jpg`, `profile-6month.jpg`, `profile-1year.jpg` | A photo of you two for each timeline |
| `assets/heroes/` | `hero-1month.mp4` (or `.jpg`), same for 3month/6month/1year | Big hero media shown on each profile's home page. Video preferred — falls back to image if `.mp4` is missing. |
| `assets/memories/1month/` | `popular-1.jpg` ... `popular-6.jpg`, `recent-1.jpg` ... `recent-6.jpg`, `continue-1.jpg` ... `continue-6.jpg` | 18 memory thumbnails per profile. Repeat for `3month/`, `6month/`, `1year/` |
| `assets/credits/` | `credits-bg.jpg`, `credits-clip.mp4` | Backdrop image + small looping clip for the credits page |

🎯 **Don't have all the assets yet?** No problem — every missing asset gracefully falls back to a colored placeholder. The site never breaks.

### 4. Enable GitHub Pages
- Go to your forked repo's **Settings → Pages**
- **Source:** "Deploy from a branch"
- **Branch:** `main` / root
- Save. After ~1 minute your site is live at `https://<your-username>.github.io/<repo-name>`.

---

## 🗂️ Project Structure

```
.
├── index.html              # Main entry — all 4 scenes in one file
├── config.js               # ← EDIT THIS — all content
├── styles.css              # All styles
├── app.js                  # Scene transitions + rendering logic
├── assets/                 # ← drop your media here
│   ├── intro/
│   ├── profiles/
│   ├── heroes/
│   ├── memories/{1month,3month,6month,1year}/
│   └── credits/
├── docs/superpowers/specs/ # Design spec (for the curious)
└── README.md
```

---

## 🎨 Customization Tips

- **Names everywhere**: Use `{you}`, `{them}`, `{location}` in any string in `config.js`. They auto-substitute.
- **Add custom credits**: Open the `customCredits` array in `config.js` and add as many `{ label, value }` pairs as you want.
- **Change accent color**: Edit `--netflix-red: #E50914;` in `styles.css` to use your own color theme.
- **Roll speed**: Change `rollDuration: 75` (seconds) in `config.js` to make credits roll faster or slower.

---

## 🛠️ Tech Stack

- **HTML / CSS / Vanilla JS** — zero dependencies
- **No build step** — what you see is what runs
- **Static** — perfect for GitHub Pages, Netlify, Vercel, S3, anywhere
- **Modern browsers** (Chrome, Safari, Firefox, Edge)

---

## ⚠️ Browser Audio Policy

The boot intro requires a click to play with sound — modern browsers block autoplay-with-audio for first-time visitors. The "Tap to Begin" gate handles this gracefully, just like real cinema sites.

---

## 💡 Why this exists

Most "couple websites" are static, generic, and feel like greeting cards. This is built to feel like opening a Netflix series of your own life — cinematic, polished, and uniquely yours.

Made with love. Ship it to your person. 💝

---

## 📜 License

MIT — fork it, edit it, share it, gift it.
