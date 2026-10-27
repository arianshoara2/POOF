# POOF — Learn German by Reading

<div align="center">

**An offline-first, installable PWA that turns real German content into personal flashcards — tap any word, learn it in context.**

🇬🇧 [English](#english) · 🇩🇪 [Deutsch](#deutsch)

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://arianshoara2.github.io/POOF/)
[![PWA](https://img.shields.io/badge/PWA-installable-blueviolet)](https://arianshoara2.github.io/POOF/)
[![Stack](https://img.shields.io/badge/stack-vanilla%20JS%20%E2%80%94%20zero%20build-orange)](https://github.com/arianshoara2/POOF)
[![License](https://img.shields.io/badge/license-open%20source-lightgrey)](./)
![Version](https://img.shields.io/badge/version-77-informational)

</div>

---

<a id="english"></a>
## 🇬🇧 English

### Overview

POOF is a **progressive web app for Persian-speaking learners of German**. Instead of memorizing isolated word lists, users read real German content — Wikipedia articles, YouTube subtitles, podcasts, or their own texts — **tap any word to look it up instantly**, and save it as a flashcard **together with the exact sentence where they found it**. Research is clear: words learned in context stick; words learned in lists fade.

Everything runs **client-side**: no accounts, no backend, no mandatory internet connection. All user data lives in the browser (`localStorage`), with optional **Google Drive sync** and portable **JSON/Anki backups** — the user's data always belongs to the user.

**Live demo:** https://arianshoara2.github.io/POOF/

### ✨ Key Features

#### 📖 Reading & Content Input
- Paste any German, English, or Persian text — or fetch **full Wikipedia articles** (DE / EN / FA)
- Import **YouTube subtitles** directly, with automatic retrieval or pasted transcripts; **timestamps are preserved**
- **Podcast search & playback** with live transcript following
- **Local video files** with interactive subtitle support (session-only, never uploaded)
- Movie/series discovery with CEFR-leveled content and interactive subtitle navigation

#### 👆 POOF Select — the core interaction
- Tap any word in a text → instant multi-source dictionary popup
- **Multi-word selection** with custom long-press drag handles (touch-optimized, replaces native selection)
- Inline **audio pronunciation** via TTS

#### 🔍 Multi-Source Dictionary with Offline Cache
- Aggregates **wort.app** (via a Cloudflare Worker CORS proxy), **Wiktionary**, **MyMemory**, and **Google Translate**
- Persian ↔ German ↔ English lookups in both directions
- Automatic response **caching** for offline reuse
- Optional **~78 MB offline German dictionary pack** (derived from Wiktionary data via kaikki.org, CC BY-SA 4.0)
- **"Ask POOF"** — AI-powered explanations of word usage and grammar

#### 🗂️ Flashcards & Spaced Repetition
- Save any word **with its original context sentence** attached automatically
- Custom decks, full-text search, editing, batch import/export (**JSON** and **Anki TSV**)
- **Leitner box** system with 5 compartments and smart review scheduling
- Review sessions with swipe gestures (Tinder-style card interface)

#### 🎓 Structured Learning
- Step-by-step **German and English learning paths** with built-in exercises
- **6 gamified practice modes**: multiple choice, typing, listening, fill-in-the-blank, matching, pronunciation
- **Placement test**, **der/die/das** article trainer, **word of the day**, and a **Studienkolleg** entrance-exam trainer
- Progress statistics with learning charts

#### 🌐 Platform
- **Installable PWA** with service worker — fully functional offline after first load
- Fully **RTL Persian UI** with two design themes (Classic / Snowy)
- **Google Drive sync** of cards and learning history
- **Premium tier** (subscription) with manual activation flow

### 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | **Vanilla HTML / CSS / JavaScript** — zero framework, zero build step |
| Persistence | `localStorage` (versioned data model), JSON backup/restore |
| Offline | Service Worker app-shell caching, dictionary response cache, offline dictionary pack |
| External APIs | Wiktionary, Wikipedia, MyMemory, Google Translate, YouTube transcripts, Google Drive API |
| Proxy | **Cloudflare Worker** as CORS proxy + API-key gateway for wort.app |
| Hosting | GitHub Pages with custom domain (CNAME) |

### 🏗️ Engineering Highlights

- **Offline-first architecture** — the app shell, cached dictionary responses, and the downloadable dictionary pack make every core feature work without a network
- **CORS-proxy design** — a lightweight Cloudflare Worker fronts third-party dictionary APIs, adding an optional shared-secret layer without a dedicated backend
- **Streaming subtitle parsing** (SRT/VTT) with timestamp preservation for sync between playback and text
- **Custom touch word-selection** — long-press drag handles over rendered text, replacing native selection which behaves inconsistently on mobile
- **Versioned client-side data model** with backup, restore, and merge-on-import semantics
- **Multi-source aggregation with fallback chains** — if one dictionary source fails or is rate-limited, others fill the gap transparently

### 📁 Repository Structure

```
├── index.html              # Main SPA — reader, dictionary, cards, Leitner, settings (v77)
├── learn.html              # German learning path with exercises
├── learn-en.html           # English learning path
├── practice.html           # 6 gamified practice modes
├── placement-test.html     # Level placement test
├── der-die-das.html        # German article (gender) trainer
├── wort-des-tages.html     # Word-of-the-day
├── wortschatz.html         # Vocabulary trainer
├── studienkolleg-trainer.html  # Studienkolleg entrance-exam trainer
├── poof-core.js            # Shared core utilities
├── sw.js                   # Service worker (offline shell)
├── manifest.webmanifest    # PWA manifest
├── dict-fa.jsonl           # Persian dictionary data (~1.7 MB)
├── theme-classic.css       # "Classic" theme (embedded artwork)
├── theme-snowy.css         # "Snowy" theme (embedded artwork)
├── mascot.css              # Mascot artwork
├── icon.svg / icon-*.png   # App icons
├── privacy.html            # Privacy policy
└── CNAME                   # Custom domain
```

### 🗺️ Roadmap

- [ ] Android release (APK / Play listing)
- [ ] Additional offline dictionary languages
- [ ] Shared deck discovery & community content

### 👤 Author

**Arian Shoara** — concept, product design, and development.
Built AI-assisted (Claude, ChatGPT, Mozi), shipped as open source for all German learners.
Telegram: [@ariansho](https://t.me/ariansho)

---

<a id="deutsch"></a>
## 🇩🇪 Deutsch

### Überblick

POOF ist eine **Offline-first Progressive Web App für persischsprachige Deutschlernende**. Statt isolierte Vokabellisten auswendig zu lernen, lesen die Nutzer echte deutsche Inhalte — Wikipedia-Artikel, YouTube-Untertitel, Podcasts oder eigene Texte — **tippen auf jedes Wort, um es sofort nachzuschlagen**, und speichern es als Karteikarte **zusammen mit dem genauen Satz, in dem sie es gefunden haben**. Wörter im Kontext bleiben hängen — Wörter aus Listen vergisst man schnell.

Alles läuft **clientseitig**: keine Konten, kein Backend, kein Pflicht-Internet. Alle Nutzerdaten bleiben im Browser (`localStorage`), optional mit **Google-Drive-Synchronisierung** sowie portablen **JSON-/Anki-Backups** — die Daten gehören immer dem Nutzer.

**Live-Demo:** https://arianshoara2.github.io/POOF/

### ✨ Hauptfunktionen

#### 📖 Lesen & Inhalte
- Beliebige deutsche, englische oder persische Texte einfügen — oder ganze **Wikipedia-Artikel** laden (DE / EN / FA)
- **YouTube-Untertitel** direkt importieren (automatischer Abruf oder eingefügtes Transkript); **Zeitstempel bleiben erhalten**
- **Podcast-Suche & -Wiedergabe** mit laufender Transkript-Verfolgung
- **Lokale Videodateien** mit interaktiver Unterstützung von Untertiteln (nur Sitzung, kein Upload)
- Film- und Serien-Entdeckung mit Niveau-stufigen Inhalten (CEFR) und interaktiver Untertitel-Navigation

#### 👆 POOF Select — die Kerninteraktion
- Tippen auf ein Wort → sofortiges Wörterbuch-Popup aus mehreren Quellen
- **Mehrwort-Auswahl** mit eigenen Langdrück-Bewegungsgriffen (Touch-optimiert, ersetzt die native Auswahl)
- **Audio-Aussprache** per TTS direkt im Text

#### 🔍 Mehrquellen-Wörterbuch mit Offline-Cache
- Bündelt **wort.app** (über einen Cloudflare-Worker-CORS-Proxy), **Wiktionary**, **MyMemory** und **Google Translate**
- Nachschlagen Persisch ↔ Deutsch ↔ Englisch in beide Richtungen
- Automatisches **Caching** der Antworten zur Offline-Nutzung
- Optionales **Offline-Wörterbuch-Paket (~78 MB, Deutsch)** (aus Wiktionary-Daten via kaikki.org, CC BY-SA 4.0)
- **„POOF fragen"** — KI-gestützte Erklärungen zu Wortgebrauch und Grammatik

#### 🗂️ Karteikarten & Wiederholung mit Abstand (Spaced Repetition)
- Jedes Wort wird **mit dem ursprünglichen Kontaktsatz** automatisch gespeichert
- Eigene Stapel (Decks), Volltextsuche, Bearbeitung, Stapel-Import/Export (**JSON** und **Anki TSV**)
- **Leitner-Kasten** mit 5 Fächern und intelligenter Wiederholungsplanung
- Wiederholungssitzungen mit Wischgesten (Karten-Oberfläche im Stil bekannter Swipe-Apps)

#### 🎓 Strukturiertes Lernen
- Schritt-für-Schritt-**Lernpfade für Deutsch und Englisch** mit integrierten Übungen
- **6 spielerische Übungsmodi**: Multiple Choice, Tippen, Hörverstehen, Lückentext, Zuordnen, Aussprache
- **Einstufungstest**, **der/die/das-Trainer**, **Wort des Tages** sowie ein **Studienkolleg**-Aufnahmetest-Trainer
- Lernstatistiken mit Fortschrittsdiagrammen

#### 🌐 Plattform
- **Installierbare PWA** mit Service Worker — nach dem ersten Laden vollständig offline nutzbar
- Vollständig **RTL-Persische Benutzeroberfläche** mit zwei Designthemen (Classic / Snowy)
- **Google-Drive-Synchronisierung** von Karten und Lernverlauf
- **Premium-Abo** (Subscription) mit manuellem Freischalt-Prozess

### 🧰 Technik-Stack

| Ebene | Technologie |
|---|---|
| Frontend | **Vanilla HTML / CSS / JavaScript** — kein Framework, kein Build-Schritt |
| Persistenz | `localStorage` (versioniertes Datenmodell), JSON-Backup/Wiederherstellung |
| Offline | Service-Worker-Caching des App-Shells, Wörterbuch-Antwort-Cache, Offline-Wörterbuchpaket |
| Externe APIs | Wiktionary, Wikipedia, MyMemory, Google Translate, YouTube-Transkripte, Google-Drive-API |
| Proxy | **Cloudflare Worker** als CORS-Proxy + API-Key-Gateway für wort.app |
| Hosting | GitHub Pages mit eigener Domain (CNAME) |

### 🏗️ Technische Highlights

- **Offline-first-Architektur** — App-Shell, Cache der Wörterbuch-Antworten und das herunterladbare Wörterbuchpaket machen jede Kernfunktion netzwerkunabhängig
- **CORS-Proxy-Design** — ein schlanker Cloudflare Worker kapselt Drittanbieter-Wörterbuch-APIs und ergänzt optional eine geteilte Geheimschicht — ohne eigenes Backend
- **Streaming-Parser für Untertitel** (SRT/VTT) mit Erhaltung der Zeitstempel zur Synchronisation von Wiedergabe und Text
- **Eigene Touch-Wortauswahl** — Langdrück-Bewegungsgriffe über gerendertem Text, ersetzt die auf Mobilgeräten inkonsistente native Auswahl
- **Versioniertes clientseitiges Datenmodell** mit Backup, Restore und Merge-beim-Import
- **Mehrquellen-Aggregation mit Fallback-Ketten** — fällt eine Quelle aus oder ist ratenlimitiert, springen andere transparent ein

### 🗺️ Roadmap

- [ ] Android-Version (APK / Play-Store-Eintrag)
- [ ] Weitere Offline-Wörterbuch-Sprachen
- [ ] Geteilte Stapel & Community-Inhalte

### 👤 Autor

**Arian Shoara** — Konzept, Produktdesign und Entwicklung.
KI-gestützt entwickelt (Claude, ChatGPT, Mozi), als Open Source für alle Deutschlernenden veröffentlicht.
Telegram: [@ariansho](https://t.me/ariansho)
