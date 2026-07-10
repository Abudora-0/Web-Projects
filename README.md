<div align="center">

# Web Projects

**27 hand-built web projects — each with its own design identity.**

Games, tools, UI clones, and full websites, written from scratch in HTML, CSS & vanilla JavaScript.
No frameworks. No bundlers. No two projects that look alike.

[**Browse the live gallery →**](https://abudora-0.github.io/Web-Projects/)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-2946ff?style=flat-square)
![Projects](https://img.shields.io/badge/Projects-27-16130e?style=flat-square)

</div>

---

## The idea

Most project collections share one template and one color scheme. This one doesn't.
Every project here was designed as its own small product, with a deliberate visual
direction — a Braun-inspired calculator, a Nokia-LCD snake, a detective-noir privacy
page, a banker's-ledger budget book. The code stays simple; the design does the talking.

---

## 🎮 Games

| Project | Design identity | Highlights |
|---|---|---|
| [Dino Game](Dino%20Game/) | Pixel desert sunset, handheld-console shell | Canvas engine, power-ups, combo system, day/night |
| [Snake Game](Snake%20Game/) | Nokia 3310 olive LCD in a candybar phone | Canvas, special food, levels, touch D-pad |
| [Tic Tac Toe](Tic%20Tac%20Toe/) | Schoolyard chalkboard in a wooden frame | Minimax AI (3 difficulties), confetti, sound |
| [Animated Car](Animated%20Car/) | "Neon Drive" synthwave highway | Pure-SVG car, gears & turbo, rain & night modes |
| [Arcade Hub](Arcade%20Hub/) | CRT arcade cabinet with scanlines | 8 mini-games: Wordle, 2048, Simon, Memory & more |

## 🛠️ Tools & Apps

| Project | Design identity | Highlights |
|---|---|---|
| [Budget Tracker](Personal%20Budget%20Expense%20Tracker/) | Banker's ledger | Charts, budgets, insights, CSV export |
| [Movie Finder](Movie%20Recommendation%20App/) | Cinema noir picture palace | TMDB API, watchlist, favorites, surprise-me |
| [Album Player](Album%20Player/) | Warm analog listening room | Custom audio engine, album studio, per-album accents |
| [Weather App](Wheather%20App/) | "Skydeck" avionics instrument panel | Live weather, hourly tape, 5-day forecast |
| [Xchange](Xchange/) | FX trading terminal | 160+ currencies, live rates, quote board |
| [Password Manager](Password%20Manager/) | Bank vault | Generator, strength audit, local-only storage |
| [To Do List](To%20Do%20List/) | Stationery legal pad + clipboard | Priorities, categories, drag & drop, undo |
| [De Calc](De%20Calc/) | Dieter Rams / Braun hardware | Scientific mode, memory keys, history |
| [Email Validator](Email%20Validator/) | "The Sorting Office" postal desk | Typo fixes, disposable detection, batch CSV |
| [Analog Clock](Analog%20Clock/) | "Meridian" luxury horology | SVG watchface, timezones, five dial finishes |

## 🎭 UI Clones & Templates

| Project | Description | Stack |
|---|---|---|
| [Netflix Clone](Netflix%20Clone/) | Landing page — hero, feature rows, FAQ, title modal | HTML · CSS · JS |
| [Spotify Clone](Spotify%20Clone/) | Web player — sidebar, playlists, functional audio | HTML · CSS · JS |
| [Myntra Clone](Myntra%20Clone/) | Fashion e-commerce storefront | HTML · CSS · JS |
| [X / Twitter Clone](X%20%26%20Twitter%20Clone/) | Feed UI in the dark theme | HTML · Tailwind |
| [Windows 11 UI Clone](WIndow%2011%20UI%20Clone/) | Desktop with taskbar, start menu & apps | HTML · CSS · JS |
| [Bootstrap Website](BootStrap%20Website/) | Tech-news zine on Bootstrap 5, restyled as an acid dev-zine | Bootstrap 5 |
| [Cheatsheet Template](CheatSheet%20Template/) | Amber-phosphor manpage terminal, 6 languages | Prism.js |
| [Incognito Mode](Incognito%20Mode/) | "Off the Record" — private browsing as detective noir | HTML · CSS · JS |

## 🌐 Websites

| Project | Design identity | Highlights |
|---|---|---|
| [Portfolio](Portfolio/) | Editorial ink & ivory studio | Typing hero, numbered sections, project index |
| [Blog Website](Blog%20Website/) | Broadsheet newspaper | 5 pages, search, dark "evening edition" |
| [Landing Page](Landing%20Page/) | Brutalist gym poster | AI workout planner, BMI gauge, countdown |
| [Foodies](Foodies/) | Warm artisan eatery | Menu cards with price leaders, map, contact |

---

## Tech at a glance

- **Structure** — semantic HTML5, inline SVG icons & artwork, data-URI favicons
- **Styling** — modern CSS: custom properties, grid/flexbox, animations, `mask`, `clip-path`
- **Logic** — vanilla ES6+: Canvas, Web Audio, IntersectionObserver, localStorage, drag & drop
- **APIs** — TMDB (movies), OpenWeatherMap (weather), open.er-api.com (currency)
- **Libraries** — used sparingly, only where they earn their place: Chart.js, Prism.js, Bootstrap 5, Tailwind

---

## Run locally

Everything is static — no build step.

```bash
git clone https://github.com/Abudora-0/web-projects.git
cd web-projects
npx serve .        # then open http://localhost:3000
```

You can also open any project's `index.html` directly, but a local server is
recommended (a few projects `fetch()` local files, which browsers block on `file://`).

> **API projects** (Weather App, Movie Finder, Xchange) need an internet
> connection and may need a valid API key in their `script.js`.

<details>
<summary><strong>🎵 Adding songs locally (Spotify Clone & Album Player)</strong></summary>

<br>

MP3 files are excluded from the repo (too large for GitHub), so the audio
projects show empty libraries on GitHub Pages. Locally:

1. Drop your `.mp3` files into the matching artist folders:

   ```
   Spotify Clone/songs/
   ├── billie/    ├── drake/    ├── dua/    ├── eminem/
   ├── kenny/     ├── taylor/   └── weeknd/
   ```

2. Each folder ships with `info.json` metadata and a `cover.svg` placeholder —
   add a `cover.jpg` for full album art.
3. Serve with `npx serve .` and open `http://localhost:3000/Spotify%20Clone/`.
4. The **Album Player** picks the songs up automatically via relative paths.

</details>

<details>
<summary><strong>📁 Repository structure</strong></summary>

<br>

```
web-projects/
├── index.html                        ← the live project gallery
├── README.md
├── LICENSE
├── Album Player/        ├── Landing Page/
├── Analog Clock/        ├── Movie Recommendation App/
├── Animated Car/        ├── Myntra Clone/
├── Arcade Hub/          ├── Netflix Clone/
├── Blog Website/        ├── Password Manager/
├── BootStrap Website/   ├── Personal Budget Expense Tracker/
├── CheatSheet Template/ ├── Portfolio/
├── De Calc/             ├── Snake Game/
├── Dino Game/           ├── Spotify Clone/
├── Email Validator/     ├── Tic Tac Toe/
├── Foodies/             ├── To Do List/
├── Incognito Mode/      ├── WIndow 11 UI Clone/
├── Wheather App/        ├── X & Twitter Clone/
└── Xchange/
```

Every project folder is self-contained: `index.html` + `style.css` + `script.js`.

</details>

---

## License

Released under the [MIT License](LICENSE) — use anything here freely, with attribution.

Brand-clone projects (Netflix, Spotify, Myntra, X, Windows 11) are educational
UI studies; the names, logos, and imagery they imitate belong to their respective owners.

---

<div align="center">

**Abdullah Akbar** · [github.com/Abudora-0](https://github.com/Abudora-0) · [Live gallery](https://abudora-0.github.io/Web-Projects/)

*Built with HTML, CSS & JavaScript — and a different idea every time.*

</div>
