/* EPHEMERIS - CSS reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'css', name: 'CSS', mono: 'Cs',
  call: '006.7 CSS', tag: 'Stylesheets', shelf: 'web', prism: 'css',
  desc: 'Selectors, the box model, Flexbox, Grid, typography, animation, and responsive layout - how pages get their looks.',
  keywords: 'styling stylesheet layout design flexbox grid responsive',
  sections: [
    { title: 'Selectors', snippets: [
      { label: 'Everyday selectors', desc: 'Type, class, id, attribute, and combinators.', code: 'p { }              /* every <p> */\n.card { }          /* class */\n#hero { }          /* id */\n[data-open] { }    /* has attribute */\n[href^="https"] { }/* attr starts with */\n.card > p { }      /* direct child */\n.card p { }        /* any descendant */\nh2 + p { }         /* next sibling */' },
      { label: 'Pseudo-classes & elements', desc: 'State and generated content.', code: 'a:hover { }\ninput:focus-visible { }\nli:first-child { }\nli:nth-child(odd) { }\np:not(.intro) { }\n.card:has(img) { }   /* parent selector */\n\n.card::before { content: "-> "; }\np::first-line { font-weight: 700; }' },
    ]},
    { title: 'Box Model & Units', snippets: [
      { label: 'Box sizing & spacing', desc: 'border-box makes width include padding and border.', code: '*, *::before, *::after { box-sizing: border-box; }\n\n.card {\n  width: 320px;\n  padding: 1rem 1.5rem;   /* vertical | horizontal */\n  margin: 0 auto;         /* center a block */\n  border: 1px solid #ccc;\n}' },
      { label: 'Units that matter', desc: 'rem for type, % / vw for layout, ch for measure.', code: 'font-size: 1.125rem;    /* relative to root */\npadding: 0.5em;         /* relative to element font */\nwidth: min(90%, 60ch);  /* readable line length */\nheight: 100vh;          /* viewport height */\nheight: 100dvh;         /* mobile-safe viewport */\ngap: clamp(1rem, 3vw, 2.5rem);' },
    ]},
    { title: 'Flexbox', snippets: [
      { label: 'Row layout', desc: 'The 90% case: space items along one axis.', code: '.row {\n  display: flex;\n  align-items: center;        /* cross axis */\n  justify-content: space-between; /* main axis */\n  gap: 1rem;\n  flex-wrap: wrap;\n}' },
      { label: 'Grow, shrink, basis', desc: 'Control how children share space.', code: '.sidebar { flex: 0 0 240px; } /* fixed 240px */\n.content { flex: 1; }         /* take the rest */\n\n.push-right { margin-left: auto; }\n\n.column {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n}\n.column footer { margin-top: auto; } /* sticky footer */' },
    ]},
    { title: 'Grid', snippets: [
      { label: 'Responsive card grid', desc: 'Auto-wrapping columns with no media queries.', code: '.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 1.25rem;\n}' },
      { label: 'Named areas', desc: 'Draw the layout as ASCII art.', code: '.layout {\n  display: grid;\n  grid-template-areas:\n    "header header"\n    "nav    main"\n    "footer footer";\n  grid-template-columns: 220px 1fr;\n  gap: 1rem;\n}\n.layout header { grid-area: header; }\n.layout nav    { grid-area: nav; }\n.layout main   { grid-area: main; }' },
      { label: 'Placing items', desc: 'Span rows/columns and center anything.', code: '.feature { grid-column: 1 / -1; }  /* full width */\n.tall    { grid-row: span 2; }\n\n.center {\n  display: grid;\n  place-items: center;   /* the two-line centering trick */\n}' },
    ]},
    { title: 'Typography & Color', snippets: [
      { label: 'Font stack & rhythm', desc: 'System fonts plus comfortable reading defaults.', code: 'body {\n  font-family: ui-sans-serif, system-ui, sans-serif;\n  font-size: 1rem;\n  line-height: 1.6;\n}\nh1 {\n  font-size: clamp(2rem, 5vw, 3.5rem);\n  letter-spacing: -0.02em;\n  text-wrap: balance;\n}\np { max-width: 65ch; }' },
      { label: 'Modern color', desc: 'Alpha, mixing, and relative shades.', code: 'color: rgb(43 36 22 / 0.8);\nbackground: oklch(0.7 0.15 250);\nborder-color: color-mix(in srgb, red 30%, transparent);\n\n/* gradient */\nbackground: linear-gradient(135deg, #2b2416, #a93b2a);' },
    ]},
    { title: 'Custom Properties', snippets: [
      { label: 'Design tokens', desc: 'Define once on :root, use everywhere.', code: ':root {\n  --ink: #2b2416;\n  --paper: #f4ecd8;\n  --space: 1rem;\n}\n.card {\n  color: var(--ink);\n  padding: var(--space);\n  background: var(--fallback, #fff); /* with default */\n}' },
      { label: 'Theming with data attributes', desc: 'Swap a whole palette by flipping one attribute.', code: '[data-theme="dark"] {\n  --ink: #eae0c3;\n  --paper: #14110a;\n}\n\n/* respect the OS setting */\n@media (prefers-color-scheme: dark) {\n  :root { --paper: #14110a; }\n}' },
    ]},
    { title: 'Transitions & Animation', snippets: [
      { label: 'Transitions', desc: 'Animate between states; list the properties explicitly.', code: '.btn {\n  transition: transform 0.15s ease, background 0.2s;\n}\n.btn:hover {\n  transform: translateY(-2px);\n}\n.btn:active { transform: scale(0.98); }' },
      { label: 'Keyframes', desc: 'Reusable named animations.', code: '@keyframes pulse {\n  0%, 100% { opacity: 1; }\n  50%      { opacity: 0.4; }\n}\n.loading {\n  animation: pulse 1.2s ease-in-out infinite;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  * { animation: none; transition: none; }\n}' },
    ]},
    { title: 'Responsive & Queries', snippets: [
      { label: 'Media queries', desc: 'Mobile-first: base styles small, enhance upward.', code: '/* base = mobile */\n.nav { flex-direction: column; }\n\n@media (min-width: 768px) {\n  .nav { flex-direction: row; }\n}\n@media (min-width: 1200px) {\n  .container { max-width: 1140px; }\n}' },
      { label: 'Container queries', desc: 'Respond to the parent’s size, not the viewport.', code: '.sidebar { container-type: inline-size; }\n\n@container (min-width: 400px) {\n  .widget { display: flex; gap: 1rem; }\n}' },
    ]},
    { title: 'Position & Stacking', snippets: [
      { label: 'Positioning', desc: 'sticky for headers, absolute inside relative.', code: '.header {\n  position: sticky;\n  top: 0;\n  z-index: 100;\n}\n.badge-holder { position: relative; }\n.badge {\n  position: absolute;\n  top: -6px; right: -6px;\n}\n.overlay { position: fixed; inset: 0; }' },
      { label: 'Overflow & scroll', desc: 'Contain content and polish scrolling.', code: '.pane {\n  overflow-y: auto;\n  max-height: 320px;\n  scrollbar-gutter: stable;\n}\nhtml { scroll-behavior: smooth; }\n.section { scroll-margin-top: 80px; } /* anchor offset */\n.truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}' },
    ]},
  ],
});
