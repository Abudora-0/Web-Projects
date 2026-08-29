# Halcyon - a window on the sky

A weather app where the page *is* the weather. There are no weather icons and no dashboard cards - the entire viewport is a living sky scene painted from real conditions and the real local time of the place you search: the gradient shifts through dawn, day, dusk, and night; the sun and moon sit where they actually are in the sky; clouds drift by cloud-cover percentage; rain streaks, snow drifts, lightning flickers, and stars come out on clear nights.

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![API Key](https://img.shields.io/badge/API%20Key-Not%20Required-f2b880)

## The idea

Weather apps tell you the weather. Halcyon shows it to you - big editorial serif type over the sky itself, with the condition written as a sentence ("rain on the rooftops over tokyo") instead of an icon. All the data lives in a frosted-glass deck below the fold.

## Features

- **Living sky engine** - 8 condition groups × dawn/day/dusk/night palettes; adaptive ink (dark text on pale skies, warm white on dark ones)
- **Real sun & moon position** - plotted along their actual arc from sunrise/sunset times; hidden when it's overcast
- **Weather effects** - CSS-generated clouds, drizzle, rain, snowfall, storm lightning, and a starfield on clear nights
- **Search autocomplete** - debounced place lookup with keyboard navigation (↑ ↓ Enter Esc)
- **Kept places** - pin places you care about, each shown with its own live temperature (persisted in `localStorage`)
- **24-hour temperature curve** - hand-drawn SVG line with rain-chance annotations, scrolls horizontally on narrow screens instead of squashing
- **7-day outlook** - condition words, highs/lows, rain probability, always starting from today
- **Yesterday, compared** - "2° warmer than this time yesterday," pulled from real hourly history
- **The best window today** - scans the remaining hours for the driest stretch: "dry 14:00–18:00, then rain returns"
- **8 years of history** - "3° above the 8-year average for july 17," or "the warmest july 17 in 8 years" on a record day - fetched quietly in the background from Open-Meteo's archive so it never blocks the first paint
- **Sun & air** - sunrise/sunset arc, total daylight duration, tonight's moon phase, and air quality spoken plainly: "the air is lovely / fine / poor…" with EAQI and PM2.5 underneath
- **The fine print** - wind (with compass words), gusts, humidity, pressure, UV, visibility, dew point, cloud cover - wind and visibility switch to mph/mi with the unit toggle instead of staying stuck in km
- **Live local clock** - ticking time and date at the searched place
- **Shareable links** - the URL updates to `#place@lat,lon`; paste it to anyone and it opens straight to that sky
- **Press `/`** anywhere to jump to search
- **Quietly refreshes** every 15 minutes so the sky stays current if you leave the tab open
- **Installable** - a real manifest, service worker, and hand-drawn PNG icons; add it to your home screen and the last sky you saw still opens offline
- **Geolocation on boot**, falling back to a shared link, then your last place, then London
- **°c / °f** toggle, persisted

## Running it

No build, no key, no config - data comes from [Open-Meteo](https://open-meteo.com/):

```bash
start index.html      # or: npx serve
```

## Data

| Endpoint | Used for |
|----------|----------|
| `api.open-meteo.com/v1/forecast` | current, hourly, daily, sunrise/sunset, UV, visibility |
| `geocoding-api.open-meteo.com/v1/search` | search + autocomplete |
| `air-quality-api.open-meteo.com/v1/air-quality` | European AQI, PM2.5 |
| `archive-api.open-meteo.com/v1/archive` | 8-year daily highs for this-date-in-history |

## Stack

Vanilla HTML / CSS / JS. Young Serif + Sora. Every visual - sky, sun, moon, clouds, precipitation, stars, grain, charts - is generated in the browser; the only external assets are the two typefaces.

## License

MIT - see [LICENSE](../LICENSE).
