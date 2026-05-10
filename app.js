/* ═══════════════════════════════════════════════════════════════════
   YOUR LOVE STORY — APP LOGIC
   - Scene transitions (boot → profiles → home → credits)
   - Profile state + sidebar nav
   - Hero per-profile rendering
   - Memory rows with graceful image fallback
   - Fullscreen video player
   - Rolling credits + clip player controls
   - Template substitution ({you}, {them}, {location})
   ═══════════════════════════════════════════════════════════════════ */

(() => {
  const cfg = window.SITE_CONFIG;
  if (!cfg) {
    console.error('config.js failed to load — site cannot start');
    return;
  }

  // ──────────────────────────────────────────────────────────────────
  // Template helper: replace {you}, {them}, {location} anywhere
  // ──────────────────────────────────────────────────────────────────
  const tpl = (str = '') => String(str)
    .replaceAll('{you}',      cfg.partners.you)
    .replaceAll('{them}',     cfg.partners.them)
    .replaceAll('{location}', cfg.location);

  // Look up dotted path on config (e.g. "boot.tagline")
  const dotPath = (path) => path.split('.').reduce((o, k) => o?.[k], cfg);

  // ──────────────────────────────────────────────────────────────────
  // Apply data-text bindings from HTML to config values
  // ──────────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-text]').forEach(el => {
    const v = dotPath(el.dataset.text);
    if (v != null) el.textContent = tpl(v);
  });

  // ──────────────────────────────────────────────────────────────────
  // Format-tolerant image loader.
  // User drops a photo named `popular-4.jpg` — but if they saved it as
  // .jpeg / .png / .webp / .JPG / .JPEG instead, we still find it.
  // The img element starts with the `.jpg` URL; if it 404s we walk
  // through fallbacks before giving up and revealing the placeholder.
  // ──────────────────────────────────────────────────────────────────
  const IMG_EXT_FALLBACKS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];
  function setupTolerantImg(img, basePath, opts = {}) {
    let i = 0;
    // Performance: async decode never blocks the main thread.
    img.decoding = 'async';
    // Lazy-load by default for off-screen / horizontally-scrolled images;
    // critical above-the-fold images opt out via opts.eager = true.
    if (!opts.eager) img.loading = 'lazy';
    if (opts.priority) img.setAttribute('fetchpriority', opts.priority);
    img.src = basePath + IMG_EXT_FALLBACKS[i];
    img.addEventListener('load', () => {
      img.classList.add('loaded');
      const parent = img.parentElement;
      if (parent) parent.classList.add('has-image');
    });
    img.addEventListener('error', () => {
      i++;
      if (i < IMG_EXT_FALLBACKS.length) {
        img.src = basePath + IMG_EXT_FALLBACKS[i];
      } else {
        img.remove();
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // Scene management
  // ──────────────────────────────────────────────────────────────────
  const scenes = {
    boot:     document.getElementById('sceneBoot'),
    profiles: document.getElementById('sceneProfiles'),
    home:     document.getElementById('sceneHome'),
    credits:  document.getElementById('sceneCredits')
  };

  let creditsAssetsKicked = false;
  function showScene(name) {
    Object.entries(scenes).forEach(([k, el]) => {
      if (k === name) el.classList.add('active');
      else el.classList.remove('active');
    });
    document.body.dataset.scene = name;
    window.scrollTo(0, 0);

    // Hero audio policy: only the home scene should be heard.
    const hv = document.getElementById('heroVideo');
    if (hv) {
      if (name === 'home') {
        hv.muted = heroMutedByUser;
        const p = hv.play(); if (p && p.catch) p.catch(() => {});
      } else {
        hv.pause();
      }
    }
    // Defer credits-only assets until first navigation to credits
    if (name === 'credits' && !creditsAssetsKicked) {
      creditsAssetsKicked = true;
      const bg = document.getElementById('creditsBgImg');
      if (bg && !bg.src) bg.src = 'assets/credits/credits-bg.jpg';
      // Force the clip video to actually fetch frames now (preload="metadata"
      // means it hasn't pulled video data yet). Without this the audio can
      // start while the frames are still buffering and the placeholder
      // stays on top.
      const ccFirst = document.getElementById('creditsClip');
      if (ccFirst) {
        ccFirst.load();
      }
    }
    // Pause credits clip too when not on credits
    const cc = document.getElementById('creditsClip');
    if (cc) {
      if (name === 'credits') {
        const p = cc.play();
        if (p && p.catch) {
          p.catch(() => {
            cc.muted = true;
            if (typeof updateClipMuteUI === 'function') updateClipMuteUI();
            cc.play().catch(() => {});
          });
        }
      } else {
        cc.pause();
      }
    }
  }

  // User-controlled mute state for the hero video. Default = unmuted (sound on),
  // because the user passed the "Tap to Begin" gate which counts as a gesture.
  let heroMutedByUser = false;

  // ══════════════════════════════════════════════════════════════════
  // SCENE 1 — BOOT
  // ══════════════════════════════════════════════════════════════════
  const entryGate    = document.getElementById('entryGate');
  const bootVideo    = document.getElementById('bootVideo');
  const bootFallback = document.getElementById('bootFallback');

  let bootVideoOk = true;
  bootVideo.addEventListener('error', () => { bootVideoOk = false; });

  entryGate.addEventListener('click', async () => {
    entryGate.classList.add('hide');

    if (bootVideoOk) {
      try {
        bootVideo.muted = false;
        bootVideo.volume = 1;
        await bootVideo.play();
        bootVideo.addEventListener('ended', () => showScene('profiles'), { once: true });
        // Safety: also advance after 8s in case browser denied playback silently
        setTimeout(() => {
          if (document.body.dataset.scene === 'boot') showScene('profiles');
        }, 8500);
        return;
      } catch (err) {
        bootVideoOk = false;
      }
    }

    // Fallback: show animated NETFLIX logo
    bootVideo.hidden = true;
    bootFallback.hidden = false;
    setTimeout(() => showScene('profiles'), 4000);
  });

  // ══════════════════════════════════════════════════════════════════
  // SCENE 2 — PROFILES (rendered from config)
  // ══════════════════════════════════════════════════════════════════
  const profilesContainer = document.getElementById('profilesContainer');

  cfg.profileOrder.forEach(id => {
    const p = cfg.profiles[id];
    if (!p) return;

    const card = document.createElement('div');
    card.className = 'profile';
    card.dataset.id = id;
    card.dataset.name = p.label;

    // Build a placeholder text like "1 / MONTH" or "1 / YEAR"
    const m = id.match(/^(\d+)(month|year)/);
    const num  = m ? m[1] : '?';
    const unit = m ? (m[2].toUpperCase() + (m[1] !== '1' ? 'S' : '')) : '';

    card.innerHTML = `
      <div class="avatar">
        <div class="avatar-placeholder">
          <span class="pl-num">${num}</span>
          <span class="pl-unit">${unit}</span>
        </div>
        <img alt="${p.label}">
      </div>
      <div class="profile-name">${p.label}</div>
    `;
    // Profile avatars are above-the-fold on the "Who's watching" screen → eager + high priority
    setupTolerantImg(card.querySelector('.avatar img'), `assets/profiles/profile-${id}`,
                     { eager: true, priority: 'high' });

    card.addEventListener('click', () => loadProfile(id));
    profilesContainer.appendChild(card);
  });

  // ══════════════════════════════════════════════════════════════════
  // SIDEBAR — render profile shortcuts in both sidebars
  // ══════════════════════════════════════════════════════════════════
  function renderSidebarProfiles(target) {
    target.innerHTML = '';
    cfg.profileOrder.forEach(id => {
      const p = cfg.profiles[id];
      const m = id.match(/^(\d+)(month|year)/);
      const short = m ? (m[1] + (m[2][0].toUpperCase())) : id;

      const item = document.createElement('div');
      item.className = 'sb-item';
      item.dataset.profile = id;
      item.innerHTML = `
        <div class="sb-icon-wrap">
          <div class="sb-icon-placeholder p-${id}">${short}</div>
          <img class="sb-icon-img" alt="">
        </div>
        <div class="sb-label">${p.label}</div>
      `;
      // Sidebar icons are tiny + always visible → eager
      setupTolerantImg(item.querySelector('.sb-icon-img'), `assets/profiles/profile-${id}`,
                       { eager: true });
      item.addEventListener('click', () => loadProfile(id));
      target.appendChild(item);
    });
  }
  renderSidebarProfiles(document.getElementById('sidebarProfiles'));
  renderSidebarProfiles(document.getElementById('sidebarProfilesCredits'));

  // Sidebar Home / Credits nav links
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.nav;
      // Home = the "Who's watching?" profile picker (Netflix-style)
      if (target === 'home')    showScene('profiles');
      if (target === 'credits') showScene('credits');
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // SCENE 3 — HOME (rendered per profile)
  // ══════════════════════════════════════════════════════════════════
  let currentProfile = null;

  const heroVideo       = document.getElementById('heroVideo');
  const heroImg         = document.getElementById('heroImg');
  const heroPlaceholder = document.getElementById('heroPlaceholder');

  // Safety net: if any browser ever fires 'ended' on a looping video
  // (rare edge cases), restart from the top.
  heroVideo.addEventListener('ended', () => {
    heroVideo.currentTime = 0;
    heroVideo.play().catch(() => {});
  });
  const heroLabelText   = document.getElementById('heroLabelText');
  const heroTitle       = document.getElementById('heroTitle');
  const heroDesc        = document.getElementById('heroDesc');
  const rowsContainer   = document.getElementById('rows');

  function loadProfile(id) {
    const profile = cfg.profiles[id];
    if (!profile) return;

    currentProfile = id;

    // Hero text
    heroLabelText.textContent = profile.heroLabel || 'SERIES';
    heroTitle.textContent     = tpl(cfg.heroTitleTemplate);
    heroDesc.textContent      = tpl(profile.heroDescription);

    // Hero media — try video first, then jpg, else placeholder
    heroPlaceholder.style.display = '';
    heroImg.hidden = true;
    heroVideo.style.display = '';
    heroVideo.pause();
    heroVideo.removeAttribute('src');
    heroVideo.querySelectorAll('source').forEach(s => s.remove());

    const videoSrc = `assets/heroes/hero-${id}.mp4`;
    const imgSrc   = `assets/heroes/hero-${id}.jpg`;

    const source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';
    heroVideo.appendChild(source);
    // Bulletproof loop — set property in addition to the HTML attribute,
    // and re-trigger play if any browser ever fires 'ended'.
    heroVideo.loop = true;
    heroVideo.load();

    heroVideo.addEventListener('loadeddata', () => {
      heroPlaceholder.style.display = 'none';
      heroImg.hidden = true;
      // Try to play with the user's chosen mute state. If the browser blocks
      // it (no gesture yet), retry muted so it at least plays visually.
      heroVideo.muted = heroMutedByUser;
      const p = heroVideo.play();
      if (p && p.catch) p.catch(() => {
        heroVideo.muted = true;
        heroMutedByUser = true;
        updateHeroMuteUI();
        heroVideo.play().catch(() => {});
      });
    }, { once: true });

    heroVideo.addEventListener('error', () => {
      // Try image fallback
      heroVideo.style.display = 'none';
      heroImg.src = imgSrc;
      heroImg.hidden = false;
      heroImg.addEventListener('load', () => { heroPlaceholder.style.display = 'none'; }, { once: true });
      heroImg.addEventListener('error', () => { heroImg.hidden = true; }, { once: true });
    }, { once: true });

    // Rows
    rowsContainer.innerHTML = '';
    Object.entries(profile.rows).forEach(([rowKey, row]) => {
      const sec = document.createElement('div');
      sec.className = `row ${rowKey}`;
      sec.innerHTML = `<h2 class="row-title">${row.title}</h2><div class="row-cards"></div>`;
      const cards = sec.querySelector('.row-cards');
      for (let i = 1; i <= (row.count || 6); i++) {
        const basePath = `assets/memories/${id}/${rowKey}-${i}`;
        const card = document.createElement('div');
        card.className = 'card';
        // Reserve aspect ratio so lazy-loading works correctly without layout shift
        card.innerHTML = `
          <div class="card-placeholder">${rowKey}-${i}.jpg</div>
          <img alt="" width="230" height="130">
        `;
        // Memory cards: lazy + low priority (most are off-screen in horizontal scroll).
        // Only the first card in each row gets normal priority so the row has something visible fast.
        setupTolerantImg(card.querySelector('img'), basePath,
                         { priority: i === 1 ? 'auto' : 'low' });
        cards.appendChild(card);
      }
      rowsContainer.appendChild(sec);
    });

    // Mark active sidebar profile (the active *thing* is the profile, not Home)
    document.querySelectorAll('.sb-item[data-profile]').forEach(el => {
      el.classList.toggle('active', el.dataset.profile === id);
    });
    document.querySelectorAll('.sb-item[data-nav="home"]').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sb-item[data-nav="credits"]').forEach(el => el.classList.remove('active'));

    showScene('home');
  }

  // ══════════════════════════════════════════════════════════════════
  // FULLSCREEN PLAYER (Play button on hero)
  // ══════════════════════════════════════════════════════════════════
  const fsPlayer  = document.getElementById('fsPlayer');
  const fsVideo   = document.getElementById('fsVideo');
  const fsClose   = document.getElementById('fsClose');
  const fsNoVideo = document.getElementById('fsNoVideo');
  const heroPlayBtn = document.getElementById('heroPlayBtn');

  heroPlayBtn.addEventListener('click', async () => {
    if (!currentProfile) return;

    // Pause inline hero so audio doesn't double up with the fullscreen player
    heroVideo.pause();

    // Reset
    fsVideo.pause();
    fsVideo.querySelectorAll('source').forEach(s => s.remove());
    fsVideo.removeAttribute('src');

    const src = `assets/heroes/hero-${currentProfile}.mp4`;
    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    fsVideo.appendChild(source);
    fsVideo.loop = true;
    fsVideo.load();

    fsPlayer.classList.add('active');
    fsNoVideo.hidden = true;
    fsVideo.style.display = '';

    try { await fsPlayer.requestFullscreen?.(); } catch (e) { /* ignore */ }

    fsVideo.addEventListener('error', () => {
      fsVideo.style.display = 'none';
      fsNoVideo.hidden = false;
    }, { once: true });

    try {
      fsVideo.muted = false;
      await fsVideo.play();
    } catch (e) {
      // user gesture should suffice; if denied, leave paused
    }
  });

  function closeFullscreen() {
    fsPlayer.classList.remove('active');
    fsVideo.pause();
    if (document.fullscreenElement) document.exitFullscreen?.();
    // Resume the inline hero with the user's chosen mute state
    if (document.body.dataset.scene === 'home') {
      heroVideo.muted = heroMutedByUser;
      heroVideo.play().catch(() => {});
    }
  }
  fsClose.addEventListener('click', closeFullscreen);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fsPlayer.classList.contains('active')) closeFullscreen();
  });

  // ══════════════════════════════════════════════════════════════════
  // SCENE 4 — CREDITS (rolling)
  // ══════════════════════════════════════════════════════════════════
  const creditsRoll = document.getElementById('creditsRoll');
  const credits = cfg.credits;

  function renderCredits() {
    const allItems = [...credits.items, ...credits.customCredits];

    let html = `
      <div class="credits-intro">
        <div class="intro-tag">${tpl(credits.introTag || '')}</div>
        <div class="intro-title">${tpl(credits.introTitle || '')}</div>
      </div>
      <div class="credits-list">
    `;

    let inCustom = false;
    const customStart = credits.items.length;
    allItems.forEach((item, idx) => {
      if (idx === customStart) inCustom = true;
      if (item.heading) {
        html += `<div class="cr-heading${inCustom && idx === customStart ? ' is-custom' : ''}">${tpl(item.heading)}</div>`;
      } else {
        html += `
          <div class="cr-label">${tpl(item.label)}</div>
          <div class="cr-value">${tpl(item.value)}</div>
        `;
      }
    });

    html += `
      </div>
      <div class="credits-end">${tpl(credits.endText || '')}</div>
    `;
    creditsRoll.innerHTML = html;
    creditsRoll.style.setProperty('--roll-duration', `${credits.rollDuration || 75}s`);
  }
  renderCredits();

  // ─── Credits clip player controls ───
  const clip       = document.getElementById('creditsClip');
  const clipPh     = document.getElementById('creditsClipPlaceholder');
  const clipPause  = document.getElementById('clipPauseBtn');
  const clipMute   = document.getElementById('clipMuteBtn');
  const clipProg   = document.querySelector('.clip-progress');

  // Credits clip default: audio ON. The user has already tapped "Tap to Begin",
  // so the document has a gesture and the browser should allow autoplay-with-sound.
  // Fall back to muted only if the browser still blocks it.
  clip.muted = false;

  // Reveal the video frame as soon as ANY of these signals fire — the most
  // reliable being `playing` (frames are actually being painted).
  // We don't trust just `loadeddata` because with preload="metadata" some
  // browsers fire it inconsistently when the element starts hidden.
  function revealClip() {
    clip.style.display = '';
    clipPh.style.display = 'none';
  }
  clip.addEventListener('loadeddata', revealClip);
  clip.addEventListener('canplay',    revealClip);
  clip.addEventListener('playing',    revealClip);

  clip.addEventListener('error', () => {
    // Only hide the video if it truly failed to ever load metadata
    if (clip.readyState === 0) clip.style.display = 'none';
  });
  clip.addEventListener('timeupdate', () => {
    if (clip.duration) {
      clipProg.style.setProperty('--progress', `${(clip.currentTime / clip.duration) * 100}%`);
    }
  });

  function updateClipMuteUI() {
    clipMute.classList.toggle('is-muted', clip.muted);
    clipMute.title = clip.muted ? 'Unmute' : 'Mute';
  }

  const pauseSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  const playSvg  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

  clipPause.addEventListener('click', () => {
    if (clip.paused) { clip.play(); clipPause.innerHTML = pauseSvg; clipPause.title = 'Pause'; }
    else             { clip.pause(); clipPause.innerHTML = playSvg;  clipPause.title = 'Play';  }
  });

  clipMute.addEventListener('click', () => {
    clip.muted = !clip.muted;
    // Always make sure it's playing after a user gesture
    clip.play().catch(() => {});
    updateClipMuteUI();
  });
  updateClipMuteUI();

  // ══════════════════════════════════════════════════════════════════
  // HERO VIDEO MUTE TOGGLE (per-profile audio)
  // ══════════════════════════════════════════════════════════════════
  const heroMuteBtn = document.getElementById('heroMuteBtn');

  function updateHeroMuteUI() {
    if (!heroMuteBtn) return;
    heroMuteBtn.classList.toggle('is-muted', heroMutedByUser);
    heroMuteBtn.title = heroMutedByUser ? 'Unmute' : 'Mute';
  }

  if (heroMuteBtn) {
    heroMuteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      heroMutedByUser = !heroMutedByUser;
      heroVideo.muted = heroMutedByUser;
      // Always make sure it's playing after a user gesture
      heroVideo.play().catch(() => {});
      updateHeroMuteUI();
    });
    updateHeroMuteUI();
  }
})();
