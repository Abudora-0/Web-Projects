# Cashbook - a personal ledger

A personal finance app styled as a banker's cashbook: cream ledger paper, a red margin
rule, running balances, and entries you write in plain words. Built with vanilla HTML,
CSS and JavaScript - no frameworks, no chart libraries, no server.

## The Quick Line

The heart of Cashbook is a single writing line. Type an entry the way you'd say it and
watch it get parsed live before you post it:

```
coffee 4.50                  → debit  4.50 · Food · today
+2500 salary                 → credit 2500 · Salary · today
groceries 82.13 #food friday → debit  82.13 · Food · last Friday
rent 900 monthly             → debit  900 · Housing · standing order, posts every month
netflix 11.99 12/7           → debit  11.99 · Subscriptions · 12 July
```

The parser understands:

| Element | Examples |
|---|---|
| Amounts | `4.50`, `1,200`, `+2500` (a `+` makes it income) |
| Categories | `#food`, `#tra` (prefix match), or guessed from keywords (`coffee` → Food, `uber` → Transport) |
| Dates | `today`, `yesterday`, weekday names (`friday` = the most recent one), `12/7` (day/month) |
| Standing orders | end the line with `monthly` |
| Particulars | everything else becomes the handwritten note |

## Features

- **A real ledger** - Date / Particulars / Debit / Credit / Balance columns with a
  running balance, *balance brought forward* and *carried forward* rows per month.
- **Folios** - each month is a page. Flip with the arrows or `[` / `]`.
- **Envelopes** - seal a monthly allowance per category; spending draws it down, with
  an OVERSPENT stamp when it runs dry.
- **Standing orders** - recurring lines (rent, salary, subscriptions) post themselves
  when they come due, even across months you were away.
- **Auditor's notes** - dry, useful remarks: top category, daily average, change vs.
  the previous folio, largest single line.
- **Reports** - a hand-drawn six-month credit/debit chart (plain `<canvas>`, no
  library) and a category breakdown.
- **The Records Office** - CSV export, full JSON backup and restore, and "burn the
  books" for a clean start.
- **Day / lamp themes** - ledger paper by day, banker's-lamp green by night (`T`).
- **Keyboard-first** - `/` search, `N` new entry, `[` `]` folios, `Enter` posts,
  `Esc` clears. Undo on every strike-out.
- **Private by construction** - everything lives in `localStorage`; nothing ever
  leaves the browser.

## Running it

Open `index.html` in any modern browser. No build step, no dependencies beyond
Google Fonts. First visit offers a **specimen ledger** - four folios of example
entries to explore with.

## Files

```
Cashbook/
├── index.html   # structure: masthead, folio bar, quick line, ledger, envelopes, reports
├── style.css    # the banker's-ledger design system (day + lamp themes)
├── script.js    # parser, ledger engine, envelopes, standing orders, canvas charts
└── README.md
```
