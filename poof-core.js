/* PoofPos — unified position model + hash router + safe snapshot (schema v1).
 * No dependencies, no framework, no build step. Loaded as a classic script
 * BEFORE each page's own inline script so window.PoofPos always exists.
 *
 * Position shape (the ONLY shape pages should save):
 *   { v:1, page, section, cat, anchor, seen, selected, q, filter, sort,
 *     view, scrollY, ts }
 *   page     = file name, e.g. 'wortschatz.html' (never a row index source)
 *   section  = view inside the page, e.g. 'home' | 'reader' | 'quiz' | 'sheet'
 *   cat      = category/topic id, e.g. 'freq500_1' | 'start1' | 'A1'
 *   anchor   = NORMALIZED WORD KEY (e.g. 'ich', 'zwölf'), NEVER a row index.
 *              scrollY is only a supplement to the anchor, never a replacement.
 *   seen     = last word the user REACHED in a list (even if never opened)
 *   selected = word whose meaning sheet is open (kept SEPARATE from seen)
 *   q/filter/sort = active search text / filter / sort at that moment
 *   view     = sub-view, e.g. 'sheet' | 'flashcard' | 'quiz' | 'exercise'
 *   scrollY  = pixel scroll, supplement only
 *   ts       = save timestamp (ms)
 *
 * Storage keys (NEW model; legacy keys below are still READ, never deleted):
 *   poof_pos_v1        = { v:1, current: Position, stacks: {sectionKey: [Position...]} }
 *   poof_pos_tmp_v1    = same object, written FIRST (two-phase write)
 *   poof_pos_stacks_v1 = (unused; stacks live inside poof_pos_v1)
 * Legacy read-only sources (migration): poof_last_state, poof_practice_resume.
 * Existing user data keys are NEVER touched: poof_v2, poof_vocab_progress_v1,
 * poof_dict_cache2, poof_pack_de.
 *
 * Hash format (GitHub Pages static hosting: hash only, no server config):
 *   #/wortschatz/reader/freq500_1/ich?q=...&view=sheet
 *   #/app/review            (index.html maps to id 'app')
 * Setting the hash creates a history entry, so the browser/Android Back
 * button walks the position history. Scroll/seen updates use replaceState
 * (no history spam). Apply-handlers must NEVER call go() — they restore
 * from the hash; only user navigation actions call go().
 */
(function () {
  'use strict';
  var MAIN = 'poof_pos_v1';
  var TMP = 'poof_pos_tmp_v1';
  var SCHEMA = 1;
  var MAX_STACK = 3;
  var DEBOUNCE_MS = 300;
  var FADE_MS = 180;

  var PAGE_IDS = {
    'index.html': 'app',
    'wortschatz.html': 'wortschatz',
    'der-die-das.html': 'derdiedas',
    'studienkolleg-trainer.html': 'trainer',
    'placement-test.html': 'placement',
    'practice.html': 'practice',
    'wort-des-tages.html': 'wort'
  };
  var ID_PAGES = {};
  Object.keys(PAGE_IDS).forEach(function (p) { ID_PAGES[PAGE_IDS[p]] = p; });

  var validators = {}; /* page -> fn(pos) returns validated pos or null */
  var current = null;
  var debounceTimer = null;
  var applyHandler = null;
  var initPage = null;

  function isObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  function str(s) { return (typeof s === 'string') ? s : ''; }
  function read(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function parse(s) { try { return JSON.parse(s); } catch (e) { return null; } }
  function clone(o) { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return null; } }

  function shapeOk(p) {
    return isObj(p) && p.v === SCHEMA && typeof p.page === 'string' && !!PAGE_IDS[p.page] &&
      typeof p.section === 'string' && p.section.length > 0;
  }
  function sanitize(p) {
    if (!isObj(p)) return null;
    var out = {
      v: SCHEMA,
      page: str(p.page),
      section: str(p.section) || 'home',
      cat: str(p.cat),
      anchor: str(p.anchor),
      seen: str(p.seen),
      selected: str(p.selected),
      q: str(p.q),
      filter: str(p.filter),
      sort: str(p.sort),
      view: str(p.view),
      scrollY: (typeof p.scrollY === 'number' && isFinite(p.scrollY)) ? Math.max(0, Math.round(p.scrollY)) : 0,
      ts: (typeof p.ts === 'number' && isFinite(p.ts)) ? p.ts : Date.now()
    };
    if (p.legacy !== undefined) out.legacy = p.legacy;
    return shapeOk(out) ? out : null;
  }
  function validate(p) {
    var clean = sanitize(p);
    if (!clean) return null;
    var fn = validators[clean.page];
    if (typeof fn === 'function') {
      try {
        var v = fn(clean);
        if (!v) return null;
        var v2 = sanitize(v);
        return v2 || null;
      } catch (e) { return null; }
    }
    return clean;
  }

  function loadStore() {
    var main = parse(read(MAIN));
    if (isObj(main) && main.v === SCHEMA) return main;
    var tmp = parse(read(TMP));
    if (isObj(tmp) && tmp.v === SCHEMA) return tmp;
    return null;
  }
  function writeStore(store) {
    var json = JSON.stringify(store);
    write(TMP, json); /* phase 1: temp copy first */
    write(MAIN, json); /* phase 2: then the real key */
  }
  function getStacks() {
    var s = loadStore();
    return (s && isObj(s.stacks)) ? s.stacks : {};
  }
  function sectionKey(pos) { return pos.page + '::' + pos.section; }
  function samePos(a, b) {
    return !!a && !!b && a.page === b.page && a.section === b.section &&
      a.cat === b.cat && a.anchor === b.anchor && a.view === b.view &&
      a.selected === b.selected && a.q === b.q;
  }

  /* ---- legacy migration (READ-ONLY: old keys are never deleted) ---- */
  function legacyToPos() {
    try {
      var raw = read('poof_practice_resume');
      if (raw) {
        var m = parse(raw);
        if (m && typeof m.page === 'string' && PAGE_IDS[m.page] && isObj(m.state)) {
          var st = m.state;
          return sanitize({
            page: m.page,
            section: str(st.section) || str(st.view) || 'home',
            cat: str(st.topic) || str(st.category) || '',
            anchor: '',
            seen: '',
            selected: '',
            q: '',
            view: str(st.view) || '',
            scrollY: (typeof st.scroll === 'number') ? st.scroll : 0,
            legacy: st
          });
        }
      }
    } catch (e) {}
    try {
      var raw2 = read('poof_last_state');
      if (raw2) {
        var s = parse(raw2);
        if (s && isObj(s)) {
          return sanitize({
            page: 'index.html',
            section: 'tab:' + (str(s.tab) || 'cards'),
            cat: '',
            anchor: '',
            seen: '',
            selected: '',
            q: str(s.dictQ) || '',
            view: '',
            scrollY: (typeof s.scrollY === 'number') ? s.scrollY : 0,
            legacy: s
          });
        }
      }
    } catch (e) {}
    return null;
  }

  /* ---- hash router ---- */
  function toHash(pos) {
    if (!pos) return '';
    var id = PAGE_IDS[pos.page] || 'app';
    /* Segments are positional: [id, section, cat, anchor]. An empty cat
     * must still occupy its slot when anchor is set, otherwise the anchor
     * would shift into the cat slot on round-trip. Trailing empties are
     * omitted (a missing cat with a missing anchor is unambiguous). */
    var parts = [id, pos.section];
    if (pos.cat) parts.push(pos.cat);
    else if (pos.anchor) parts.push('');
    if (pos.anchor) parts.push(pos.anchor);
    var h = '#/' + parts.map(function (x) { return encodeURIComponent(x); }).join('/');
    var qs = [];
    if (pos.q) qs.push('q=' + encodeURIComponent(pos.q));
    if (pos.view) qs.push('view=' + encodeURIComponent(pos.view));
    if (qs.length) h += '?' + qs.join('&');
    return h;
  }
  function fromHash() {
    var h = window.location.hash || '';
    if (h.charAt(0) === '#') h = h.slice(1);
    if (h.charAt(0) === '/') h = h.slice(1);
    if (!h) return null;
    var qIndex = h.indexOf('?');
    var path = (qIndex >= 0) ? h.slice(0, qIndex) : h;
    var query = (qIndex >= 0) ? h.slice(qIndex + 1) : '';
    var segs = path.split('/').map(function (x) {
      try { return decodeURIComponent(x); } catch (e) { return x; }
    });
    var page = ID_PAGES[segs[0]];
    if (!page || !segs[1]) return null;
    var pos = {
      page: page, section: segs[1], cat: segs[2] || '', anchor: segs[3] || '',
      seen: '', selected: '', q: '', filter: '', sort: '', view: '', scrollY: 0
    };
    if (query) {
      query.split('&').forEach(function (kv) {
        var eq = kv.indexOf('=');
        if (eq < 0) return;
        var k = kv.slice(0, eq), v = kv.slice(eq + 1);
        try { v = decodeURIComponent(v); } catch (e) {}
        if (k === 'q') pos.q = v;
        if (k === 'view') pos.view = v;
      });
    }
    return pos;
  }
  function syncHash(pos) {
    if (!pos) return;
    var h = toHash(pos);
    try {
      if (window.location.hash !== h) window.history.replaceState(null, '', h);
    } catch (e) {}
  }

  /* ---- public API ---- */
  var api = {
    SCHEMA: SCHEMA,
    make: function (page, section, o) {
      o = o || {};
      return sanitize({
        page: page, section: section, cat: o.cat, anchor: o.anchor,
        seen: o.seen, selected: o.selected, q: o.q, filter: o.filter,
        sort: o.sort, view: o.view, scrollY: o.scrollY, ts: Date.now()
      });
    },
    registerValidator: function (page, fn) { validators[page] = fn; },
    saveNow: function (pos) {
      var clean = validate(pos);
      if (!clean) return false;
      clean.ts = Date.now();
      current = clean;
      var stacks = getStacks();
      var key = sectionKey(clean);
      var stack = stacks[key] || [];
      if (!stack.length || !samePos(stack[stack.length - 1], clean)) {
        stack.push(clone(clean));
        while (stack.length > MAX_STACK) stack.shift();
        stacks[key] = stack;
      }
      writeStore({ v: SCHEMA, current: clean, stacks: stacks });
      return true;
    },
    saveSoon: function (pos) {
      var self = this;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () { self.saveNow(pos); }, DEBOUNCE_MS);
    },
    /* User navigation action: saves + pushes a hash history entry. */
    go: function (pos) {
      if (!this.saveNow(pos)) return false;
      var h = toHash(pos);
      try {
        if (window.location.hash !== h) window.location.hash = h;
      } catch (e) {}
      return true;
    },
    /* Scroll/seen update: saves + replaces hash without history spam. */
    track: function (pos) {
      if (!this.saveNow(pos)) return false;
      syncHash(pos);
      return true;
    },
    syncHash: syncHash,
    toHash: toHash,
    fromHash: fromHash,
    load: function () {
      var s = loadStore();
      if (s && s.current) {
        var v = validate(s.current);
        if (v) return v;
      }
      return null;
    },
    loadLegacy: legacyToPos,
    /* Previous position in the same section stack (does not mutate). */
    prev: function (page, section) {
      var stacks = getStacks();
      var stack = stacks[page + '::' + section] || [];
      return stack.length >= 2 ? validate(stack[stack.length - 2]) : null;
    },
    current: function () { return current ? clone(current) : null; },
    /* Theme swap with a short scenic fade (CSS class .poof-theme-fading
     * must exist in the theme files; if absent, the swap still runs). */
    fadeThemeSwap: function (applyFn) {
      var root = document.documentElement;
      try { root.classList.add('poof-theme-fading'); } catch (e) {}
      setTimeout(function () {
        try { applyFn(); } catch (e) {}
        setTimeout(function () {
          try { root.classList.remove('poof-theme-fading'); } catch (e) {}
        }, 30);
      }, FADE_MS);
    },
    /* One-time page wiring. opts: { page, apply(pos) }.
     * Restore order: hash position -> snapshot -> legacy -> null.
     * apply() must restore WITHOUT calling go() (no history loop). */
    init: function (opts) {
      if (!opts || !opts.page) return;
      initPage = opts.page;
      applyHandler = (typeof opts.apply === 'function') ? opts.apply : null;
      var self = this;
      function restoreFromHash() {
        var raw = fromHash();
        if (!raw) return false;
        var v = validate(raw);
        if (!v) return false;
        if (applyHandler) { try { applyHandler(v); } catch (e) {} }
        current = v;
        return true;
      }
      window.addEventListener('hashchange', function () { restoreFromHash(); });
      function flush() {
        if (current) {
          try { self.saveNow(current); } catch (e) {}
        }
      }
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') flush();
      });
      window.addEventListener('pagehide', flush);
      window.addEventListener('beforeunload', flush);
      /* Restore on load: hash wins, then snapshot, then legacy. */
      var done = false;
      if (window.location.hash) done = restoreFromHash();
      if (!done) {
        var snap = self.load();
        if (snap && snap.page === initPage) {
          if (applyHandler) { try { applyHandler(snap); } catch (e) {} }
          current = snap;
          done = true;
        }
      }
      if (!done) {
        var leg = legacyToPos();
        if (leg && leg.page === initPage) {
          if (applyHandler) { try { applyHandler(leg); } catch (e) {} }
          current = leg;
        }
      }
    }
  };

  window.PoofPos = api;
})();
