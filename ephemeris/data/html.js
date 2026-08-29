/* EPHEMERIS - HTML reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'html', name: 'HTML', mono: 'Ht',
  call: '006.74 HTM', tag: 'Markup', shelf: 'web', prism: 'markup',
  desc: 'Document structure, semantic elements, forms, tables, media, and the head section - the bones of every page.',
  keywords: 'markup web page structure semantic hypertext',
  sections: [
    { title: 'Boilerplate & Head', snippets: [
      { label: 'Minimal document', desc: 'The smallest valid HTML5 page worth starting from.', code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Page title</title>\n</head>\n<body>\n\n</body>\n</html>' },
      { label: 'Common head tags', desc: 'Stylesheets, scripts, favicon, and description.', code: '<link rel="stylesheet" href="style.css">\n<link rel="icon" href="favicon.svg" type="image/svg+xml">\n<meta name="description" content="What this page is about">\n<script src="script.js" defer></script>' },
    ]},
    { title: 'Text & Headings', snippets: [
      { label: 'Headings & paragraphs', desc: 'One h1 per page; h2-h6 nest below it in order.', code: '<h1>Page title</h1>\n<h2>Section</h2>\n<p>A paragraph of body text.</p>\n<h3>Subsection</h3>\n<p>More text with <strong>importance</strong> and <em>emphasis</em>.</p>' },
      { label: 'Inline text elements', desc: 'Semantic inline markup beats bare spans.', code: '<code>inline code</code>\n<kbd>Ctrl</kbd> + <kbd>K</kbd>\n<mark>highlighted</mark>\n<small>fine print</small>\n<abbr title="HyperText Markup Language">HTML</abbr>\n<time datetime="2026-07-17">July 17</time>' },
    ]},
    { title: 'Links & Media', snippets: [
      { label: 'Links', desc: 'Internal, external, anchor, and download links.', code: '<a href="/about.html">Internal link</a>\n<a href="https://example.com" target="_blank" rel="noopener">External</a>\n<a href="#section-id">Jump to section</a>\n<a href="mailto:hi@example.com">Email</a>\n<a href="report.pdf" download>Download</a>' },
      { label: 'Images & figure', desc: 'Always set alt; width/height prevent layout shift.', code: '<img src="photo.jpg" alt="A description" width="640" height="420" loading="lazy">\n\n<figure>\n  <img src="chart.png" alt="Sales by quarter">\n  <figcaption>Fig 1. Sales by quarter.</figcaption>\n</figure>' },
      { label: 'Audio & video', desc: 'controls is required for visible players.', code: '<video src="clip.mp4" controls poster="cover.jpg" width="640"></video>\n\n<audio controls>\n  <source src="track.ogg" type="audio/ogg">\n  <source src="track.mp3" type="audio/mpeg">\n</audio>' },
    ]},
    { title: 'Lists & Tables', snippets: [
      { label: 'Lists', desc: 'Unordered, ordered, and description lists.', code: '<ul>\n  <li>Bullet item</li>\n</ul>\n\n<ol start="3" reversed>\n  <li>Numbered item</li>\n</ol>\n\n<dl>\n  <dt>Term</dt>\n  <dd>Its definition</dd>\n</dl>' },
      { label: 'Table with header & caption', desc: 'thead/tbody keep tables accessible and styleable.', code: '<table>\n  <caption>Monthly totals</caption>\n  <thead>\n    <tr><th scope="col">Month</th><th scope="col">Total</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>January</td><td>$4,200</td></tr>\n    <tr><td>February</td><td>$3,850</td></tr>\n  </tbody>\n</table>' },
    ]},
    { title: 'Forms & Inputs', snippets: [
      { label: 'Form skeleton', desc: 'Labels tied to inputs by id - never skip them.', code: '<form action="/submit" method="post">\n  <label for="name">Name</label>\n  <input id="name" name="name" type="text" required>\n\n  <label for="email">Email</label>\n  <input id="email" name="email" type="email" required>\n\n  <button type="submit">Send</button>\n</form>' },
      { label: 'Input types', desc: 'Built-in validation and mobile keyboards for free.', code: '<input type="number" min="0" max="10" step="0.5">\n<input type="date">\n<input type="range" min="0" max="100">\n<input type="color">\n<input type="file" accept=".png,.jpg">\n<input type="password" minlength="8">\n<input type="search" placeholder="Search…">' },
      { label: 'Select, textarea, datalist', desc: 'The other form controls you always look up.', code: '<select name="size">\n  <option value="">Choose…</option>\n  <option value="s">Small</option>\n  <option value="m" selected>Medium</option>\n</select>\n\n<textarea name="notes" rows="4" placeholder="Notes…"></textarea>\n\n<input list="cities" name="city">\n<datalist id="cities">\n  <option value="Lahore"><option value="London">\n</datalist>' },
    ]},
    { title: 'Semantic Layout', snippets: [
      { label: 'Page landmarks', desc: 'Structure screen readers and search engines understand.', code: '<header>Site header / logo / nav</header>\n<nav>Primary navigation</nav>\n<main>\n  <article>Self-contained content</article>\n  <aside>Related side content</aside>\n</main>\n<footer>Site footer</footer>' },
      { label: 'Sections & articles', desc: 'article = standalone; section = thematic grouping.', code: '<article>\n  <h2>Post title</h2>\n  <section>\n    <h3>Chapter one</h3>\n    <p>…</p>\n  </section>\n</article>' },
    ]},
    { title: 'Meta & SEO', snippets: [
      { label: 'Social preview (Open Graph)', desc: 'What links look like when shared.', code: '<meta property="og:title" content="Page title">\n<meta property="og:description" content="One-line summary">\n<meta property="og:image" content="https://site.com/cover.png">\n<meta property="og:url" content="https://site.com/page">\n<meta name="twitter:card" content="summary_large_image">' },
      { label: 'Robots & canonical', desc: 'Control indexing and duplicate URLs.', code: '<meta name="robots" content="index, follow">\n<link rel="canonical" href="https://site.com/page">\n<meta name="theme-color" content="#2b2416">' },
    ]},
    { title: 'Interactive & Embeds', snippets: [
      { label: 'Details / summary', desc: 'A native accordion, no JavaScript needed.', code: '<details>\n  <summary>Click to expand</summary>\n  <p>Hidden content revealed on toggle.</p>\n</details>\n\n<details open>\n  <summary>Open by default</summary>\n</details>' },
      { label: 'Dialog element', desc: 'Native modal with backdrop and Esc-to-close.', code: '<dialog id="modal">\n  <p>Native modal dialog.</p>\n  <button onclick="modal.close()">Close</button>\n</dialog>\n\n<button onclick="modal.showModal()">Open modal</button>' },
      { label: 'Iframe embed', desc: 'Sandbox untrusted content.', code: '<iframe src="https://example.com" width="600" height="400"\n        loading="lazy" sandbox="allow-scripts"\n        title="Embedded example"></iframe>' },
    ]},
  ],
});
