# Kestrel - a small-batch clothing label

An editorial storefront for a fictional clothing label. Ink on warm bone with a
single clay accent, Fraunces display over Assistant text. Rebuilt from a Myntra
marketplace clone into one label's own shop.

## Pages

- **`index.html`** - the shopfront: hero campaign, Collections grid, a restrained
  Archive band with a countdown, a filterable range, Lookbook, About, newsletter
- **`product.html#<id>`** - product detail: image, size picker (won't add to bag
  without a size), fabric / care / shipping, and a *pairs with* row
- **`bag.html`** - the bag: line items with quantity steppers, live subtotal /
  shipping (free over Rs 12,000) / total, and a demo checkout

## How it holds together

`store.js` loads on every page and owns the range plus a `localStorage`-backed
bag and saved list, so the bag and the heart counts follow you across pages.
Product ids ride in the URL hash (`product.html#4`) rather than a query string,
because `serve`'s clean-url redirects drop query strings but keep hashes.

## Running it

```bash
npx serve .
```

Prices are in PKR. Product and campaign photography from Unsplash; Font Awesome
for icons. No framework, no bundler.
