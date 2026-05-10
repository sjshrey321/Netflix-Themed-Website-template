/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║   YOUR LOVE STORY — CONFIG                                     ║
 * ║   This is the ONLY file you (mostly) need to edit.             ║
 * ║   Then drop your photos/videos in /assets/ — done!             ║
 * ╚════════════════════════════════════════════════════════════════╝
 *
 * Templates: anywhere you see {you}, {them}, {location} in text below,
 * they will be replaced automatically. Edit once at the top, applied everywhere.
 */

const config = {

  // ── 1. Your names + favorite place ────────────────────────────
  partners: {
    you:  "[Your Name]",       // e.g. "Aryan"
    them: "[Partner]"          // e.g. "Jia"
  },
  location: "[your fav location]",  // e.g. "Goa"

  // ── 2. Site title (shows on hero) ─────────────────────────────
  // Use {you} and {them} for automatic name substitution
  heroTitleTemplate: "Life of\n{you} & {them}",

  // ── 3. Boot screen ────────────────────────────────────────────
  boot: {
    tagline: "A Love Story",                   // shown if intro.mp4 missing
    tapPrompt: "Tap to Begin",
    soundHint: "🔊 Best Experienced With Sound On"
  },

  // ── 4. Profile screen ─────────────────────────────────────────
  profileScreen: {
    heading: "Who's watching?",
    manageButton: "Manage Profiles"
  },

  // ── 5. The 4 profiles ─────────────────────────────────────────
  // Each profile pulls its own assets from /assets/ by convention:
  //   profiles/profile-{id}.jpg
  //   heroes/hero-{id}.mp4   (or .jpg)
  //   memories/{id}/popular-1..6.jpg, recent-1..6.jpg, continue-1..6.jpg
  profiles: {
    "1month": {
      label: "1 Month",
      heroLabel: "SERIES",
      heroDescription: "Where it all began — the awkward first hellos, the unstoppable laughs, and the moments we knew this was something special.",
      rows: {
        popular:  { title: "Popular on Netflix", count: 6 },
        recent:   { title: "Recently Watched",  count: 6 },
        continue: { title: "Continue Watching", count: 6 }
      }
    },
    "3month": {
      label: "3 Months",
      heroLabel: "SERIES",
      heroDescription: "Three months in. The texts got longer, the silences got cozier, and somewhere between the late-night calls and shared memes, this became home.",
      rows: {
        popular:  { title: "Popular on Netflix", count: 6 },
        recent:   { title: "Recently Watched",  count: 6 },
        continue: { title: "Continue Watching", count: 6 }
      }
    },
    "6month": {
      label: "6 Months",
      heroLabel: "SERIES",
      heroDescription: "Half a year. Half a thousand inside jokes. We've fought, we've forgiven, we've grown — and somehow, you still make me laugh like it's day one.",
      rows: {
        popular:  { title: "Popular on Netflix", count: 6 },
        recent:   { title: "Recently Watched",  count: 6 },
        continue: { title: "Continue Watching", count: 6 }
      }
    },
    "1year": {
      label: "1 Year",
      heroLabel: "SERIES",
      heroDescription: "365 days of choosing each other. Every season, every storm, every soft Sunday morning — we built something steady. And we're just getting started.",
      rows: {
        popular:  { title: "Popular on Netflix", count: 6 },
        recent:   { title: "Recently Watched",  count: 6 },
        continue: { title: "Continue Watching", count: 6 }
      }
    }
  },

  // Order shown in profile screen and sidebar
  profileOrder: ["1month", "3month", "6month", "1year"],

  // ── 6. Hero buttons ────────────────────────────────────────────
  hero: {
    playLabel: "▶  Play",
    infoLabel: "ⓘ  More Info"
  },

  // ── 7. Credits ─────────────────────────────────────────────────
  credits: {
    introTag: "★ A Netflix Original ★",
    introTitle: "Life of\n{you} & {them}",
    endText: "— THE END —",

    // Roll speed in seconds (lower = faster)
    rollDuration: 75,

    // Default cute credits — edit any line you want
    items: [
      { label: "Directed by",            value: "God" },
      { heading: "Cast" },
      { label: "Boyfriend",              value: "{you}" },
      { label: "Girlfriend",             value: "{them}" },
      { label: "Written by",             value: "Fate & destiny" },
      { label: "Produced by",            value: "Patience & support" },
      { label: "Director of photography",value: "Our camera rolls" },
      { label: "Location",               value: "{location}" },
      { label: "Chief editor",           value: "Our favorite memories" },
      { label: "Soundtrack",             value: "Melodies of us" },
      { label: "Executive producers",    value: "Shared Future Plans" },
      { label: "Technical advisor",      value: "Honest communication" },
      { label: "Catering by",            value: "Midnight cravings" },
      { label: "Stunt coordinators",     value: "Arguments & Fights" },
      { label: "Time management",        value: "\"Five more minutes\"" },
      { label: "Wardrobe designer",      value: "Each other's hoodies" },
      { label: "Chief motivator",        value: "Family & friends" },
      { label: "Script consultants",     value: "Our everyday magic" },
      { label: "VFX & graphics",         value: "Better posture checks" },
      { label: "Lifestyle coach",        value: "The entire universe" },
      { label: "Special thanks",         value: "Mom & Dad" },
      { label: "Distributed by",         value: "Your creative bf/gf" }
    ],

    // Personal credits — your unique moments. Add/remove as many as you want.
    customCredits: [
      { heading: "★ Personal Credits ★" },
      { label: "Best memory",       value: "[Your favorite moment]" },
      { label: "First \"I love you\"", value: "[Where it happened]" },
      { label: "Inside joke",       value: "[Your inside joke]" },
      { label: "Future plan",       value: "[A dream you share]" }
    ]
  }
};

// Make config available to app.js
window.SITE_CONFIG = config;
