# The Flatbed - an editing bench for your next film

A movie-discovery app built like a film editor's cutting bench. The header is a
clapperboard slate whose ROLL / SCENE / TAKE / TIMECODE fields report real state;
categories are *reels*, the filter panel is the *rig*, your lists are *bins*, and
the random button is *Splice*. Data comes from TMDB; no key needed - one is built in.

## What it does

- **Reels** - Trending, Popular, Top Rated, In Theatres, Coming Soon
- **Search** - type-ahead title search (press `/` to jump to it)
- **The filter rig** - genre, release-year range, runtime, rating, vote count,
  and sort order; a themed dropdown and `- / +` counters, not browser chrome
- **Recommendations** - a "Because you saved ..." reel on the home view, built
  from TMDB recommendations seeded by your Selects, well-rated Watched films, and Bin
- **Where to watch** - streaming / rent / buy provider logos for your region on
  each film's page, with a JustWatch link
- **The file (detail view)** - trailer that only loads on click, spec sheet,
  full cast (tap a face for their filmography), "more like this"
- **Bins** - *Bin* (queue), *Selects* (loved), *Watched* (a log with your own
  star rating and a note). Marking a film watched clears it from the queue.
- **Splice** - pull a film at random, obeying whatever the rig is set to (`R`)
- Everything persists in `localStorage`, in this browser only

## Keys

`/` search · `F` filter rig · `B` bins · `R` random splice · `Esc` close

## Running it

No build step. Open `index.html`, or serve the folder:

```bash
npx serve .
```

Needs an internet connection for TMDB. The bundled API key works out of the box;
swap in your own from [themoviedb.org](https://www.themoviedb.org/settings/api) if
you prefer.

## Stack

Vanilla HTML / CSS / JS. Barlow Condensed + Barlow + DM Mono. Data and images from
[TMDB](https://www.themoviedb.org/); trailers embedded from YouTube (no-cookie,
click-to-load). No framework, no bundler.
