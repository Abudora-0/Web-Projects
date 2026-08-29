/* EPHEMERIS - JavaScript reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'js', name: 'JavaScript', mono: 'Js',
  call: '005.133 JAV', tag: 'Scripting', shelf: 'web', prism: 'javascript',
  desc: 'Variables, functions, arrays, objects, the DOM, events, and async - the language of the browser (and half of everything else).',
  keywords: 'js es6 ecmascript dom events async promises frontend node',
  sections: [
    { title: 'Variables & Types', snippets: [
      { label: 'Declarations', desc: 'const by default, let when reassigning, never var.', code: 'const name = "Ada";      // cannot be reassigned\nlet count = 0;           // can be reassigned\ncount += 1;\n\nconst list = [];\nlist.push("ok");         // const allows mutation' },
      { label: 'Type checks & conversion', desc: 'The checks you actually reach for.', code: 'typeof "hi"        // "string"\ntypeof 42          // "number"\nArray.isArray([])  // true\nvalue ?? "default" // null/undefined fallback\n\nNumber("3.14")     // 3.14\nString(42)         // "42"\nBoolean("")        // false' },
      { label: 'Template literals', desc: 'Interpolation and multi-line strings.', code: 'const user = "Ada";\nconst msg = `Hello, ${user}!`;\n\nconst html = `\n  <li class="item">\n    ${user} - ${new Date().getFullYear()}\n  </li>`;' },
    ]},
    { title: 'Functions', snippets: [
      { label: 'Arrow functions', desc: 'Short syntax; no own this binding.', code: 'const add = (a, b) => a + b;\nconst square = n => n * n;\nconst greet = (name = "friend") => {\n  return `Hi, ${name}`;\n};\n\n// rest parameters\nconst sum = (...nums) => nums.reduce((a, b) => a + b, 0);' },
      { label: 'Destructuring & spread', desc: 'Unpack values; merge without mutation.', code: 'const { id, name: label } = user;\nconst [first, ...rest] = items;\n\nconst merged = { ...defaults, ...options };\nconst copy = [...list];\n\nfunction draw({ x = 0, y = 0 } = {}) { /* … */ }' },
    ]},
    { title: 'Arrays', snippets: [
      { label: 'map · filter · reduce', desc: 'The transformation trio.', code: 'const nums = [1, 2, 3, 4, 5];\n\nnums.map(n => n * 2)        // [2,4,6,8,10]\nnums.filter(n => n % 2)     // [1,3,5]\nnums.reduce((a, n) => a + n, 0) // 15\n\nnums.find(n => n > 3)       // 4\nnums.some(n => n > 4)       // true\nnums.every(n => n > 0)      // true' },
      { label: 'Sort, slice, and friends', desc: 'sort mutates - copy first if you care.', code: 'const sorted = [...nums].sort((a, b) => a - b);\nnums.slice(1, 3)      // copy of index 1-2\nnums.includes(3)      // true\nnums.indexOf(4)       // 3\nnums.flat()           // flatten one level\nnums.at(-1)           // last element\n[...new Set([1,1,2])] // dedupe -> [1,2]' },
    ]},
    { title: 'Objects', snippets: [
      { label: 'Object utilities', desc: 'Iterate, copy, and reshape objects.', code: 'Object.keys(obj)    // ["a", "b"]\nObject.values(obj)  // [1, 2]\nObject.entries(obj) // [["a",1], ["b",2]]\n\nObject.fromEntries([["a", 1]]) // {a: 1}\nstructuredClone(obj)           // deep copy\n\nfor (const [key, val] of Object.entries(obj)) {\n  console.log(key, val);\n}' },
      { label: 'Optional chaining', desc: 'Reach deep without crashing.', code: 'const city = user?.address?.city;\nconst first = list?.[0];\nconst result = callback?.();\n\n// combine with ?? for a default\nconst port = config?.server?.port ?? 8080;' },
    ]},
    { title: 'DOM', snippets: [
      { label: 'Selecting & creating', desc: 'querySelector takes any CSS selector.', code: 'const el = document.querySelector(".card");\nconst all = document.querySelectorAll("li");\n\nconst div = document.createElement("div");\ndiv.className = "note";\ndiv.textContent = "Hello";   // safe (no HTML parsing)\ndocument.body.append(div);\nel.remove();' },
      { label: 'Classes, attributes, styles', desc: 'The daily DOM manipulation kit.', code: 'el.classList.add("active");\nel.classList.toggle("open");\nel.classList.contains("done");\n\nel.dataset.userId = "42";     // data-user-id\nel.setAttribute("aria-expanded", "true");\nel.style.setProperty("--accent", "#a93b2a");' },
    ]},
    { title: 'Events', snippets: [
      { label: 'Listening', desc: 'Prefer addEventListener; one handler per concern.', code: 'button.addEventListener("click", e => {\n  e.preventDefault();\n  console.log("clicked", e.currentTarget);\n});\n\ninput.addEventListener("input", e => {\n  console.log(e.target.value);\n});\n\ndocument.addEventListener("keydown", e => {\n  if (e.key === "Escape") closeModal();\n});' },
      { label: 'Event delegation', desc: 'One listener on a parent handles all children.', code: 'list.addEventListener("click", e => {\n  const item = e.target.closest("li");\n  if (!item) return;\n  item.classList.toggle("done");\n});' },
    ]},
    { title: 'Async', snippets: [
      { label: 'async / await + fetch', desc: 'The standard data-loading pattern.', code: 'async function loadUser(id) {\n  const res = await fetch(`/api/users/${id}`);\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return res.json();\n}\n\ntry {\n  const user = await loadUser(1);\n} catch (err) {\n  console.error("Failed:", err.message);\n}' },
      { label: 'Promises in parallel', desc: 'Run independent work at the same time.', code: 'const [users, posts] = await Promise.all([\n  fetch("/api/users").then(r => r.json()),\n  fetch("/api/posts").then(r => r.json()),\n]);\n\n// don\'t fail the whole batch\nconst results = await Promise.allSettled(tasks);' },
      { label: 'Timers & debounce', desc: 'Delay work; collapse rapid-fire events.', code: 'const id = setTimeout(() => save(), 500);\nclearTimeout(id);\n\nfunction debounce(fn, ms) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), ms);\n  };\n}\ninput.addEventListener("input", debounce(search, 300));' },
    ]},
    { title: 'Classes & Modules', snippets: [
      { label: 'Class syntax', desc: 'Fields, constructor, getters, and inheritance.', code: 'class Book {\n  #checkedOut = false;        // private field\n  constructor(title) { this.title = title; }\n  get status() { return this.#checkedOut ? "out" : "in"; }\n  checkout() { this.#checkedOut = true; }\n  static shelve(books) { return books.sort(); }\n}\n\nclass Novel extends Book {\n  constructor(title, author) {\n    super(title);\n    this.author = author;\n  }\n}' },
      { label: 'ES modules', desc: 'import/export - one module per file.', code: '// util.js\nexport const clamp = (n, a, b) => Math.min(b, Math.max(a, n));\nexport default function log(msg) { console.log(msg); }\n\n// main.js\nimport log, { clamp } from "./util.js";\nimport * as utils from "./util.js";' },
    ]},
    { title: 'Storage & JSON', snippets: [
      { label: 'localStorage', desc: 'Strings only - JSON in, JSON out.', code: 'localStorage.setItem("theme", "dark");\nlocalStorage.getItem("theme");     // "dark"\nlocalStorage.removeItem("theme");\n\n// objects\nlocalStorage.setItem("prefs", JSON.stringify(prefs));\nconst prefs = JSON.parse(localStorage.getItem("prefs")) ?? {};' },
      { label: 'JSON parse & stringify', desc: 'Pretty-print with the third argument.', code: 'const text = JSON.stringify(data);\nconst pretty = JSON.stringify(data, null, 2);\nconst obj = JSON.parse(text);\n\n// safe parse\nfunction tryParse(s, fallback = null) {\n  try { return JSON.parse(s); } catch { return fallback; }\n}' },
    ]},
  ],
});
