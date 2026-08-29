/* EPHEMERIS - TypeScript reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'ts', name: 'TypeScript', mono: 'Ts',
  call: '005.133 TYP', tag: 'Typed JS', shelf: 'web', prism: 'typescript',
  desc: 'Types, interfaces, generics, narrowing, and utility types - JavaScript that catches your mistakes before runtime.',
  keywords: 'typescript types static typing interfaces generics tsc',
  sections: [
    { title: 'Basic Types', snippets: [
      { label: 'Annotations', desc: 'Primitives, arrays, and the ones to avoid.', code: 'let title: string = "Dune";\nlet pages: number = 412;\nlet done: boolean = false;\nlet tags: string[] = ["scifi", "classic"];\nlet pair: [string, number] = ["copies", 3]; // tuple\n\nlet anything: unknown;  // safe: must narrow first\nlet escape: any;        // unsafe: avoid' },
      { label: 'Unions & literals', desc: 'A value that is one of a fixed set.', code: 'type Status = "draft" | "published" | "archived";\nlet s: Status = "draft";\n\ntype Id = string | number;\n\nfunction setStatus(s: Status) { /* … */ }\nsetStatus("published"); // ok\n// setStatus("gone");   // error' },
    ]},
    { title: 'Interfaces & Type Aliases', snippets: [
      { label: 'Object shapes', desc: 'Optional props, readonly, and extension.', code: 'interface Book {\n  title: string;\n  pages: number;\n  isbn?: string;            // optional\n  readonly id: number;      // no reassignment\n}\n\ninterface Novel extends Book {\n  author: string;\n}\n\ntype WithTimestamps = Book & { created: Date }; // intersection' },
      { label: 'Index signatures & records', desc: 'Objects used as maps.', code: 'interface Counts {\n  [key: string]: number;\n}\n\nconst tally: Record<string, number> = {};\ntally["js"] = 1;\n\nconst byId: Map<number, Book> = new Map();' },
    ]},
    { title: 'Functions', snippets: [
      { label: 'Typing functions', desc: 'Parameters, returns, defaults, overload-free style.', code: 'function area(w: number, h: number = w): number {\n  return w * h;\n}\n\nconst greet = (name: string): string => `Hi ${name}`;\n\n// function type alias\ntype Handler = (e: Event) => void;\nconst onClick: Handler = e => console.log(e);' },
      { label: 'void, never, async', desc: 'Return types beyond values.', code: 'function log(msg: string): void { console.log(msg); }\n\nfunction fail(msg: string): never {\n  throw new Error(msg);\n}\n\nasync function load(): Promise<Book[]> {\n  const res = await fetch("/api/books");\n  return res.json() as Promise<Book[]>;\n}' },
    ]},
    { title: 'Narrowing', snippets: [
      { label: 'Type guards', desc: 'typeof, in, instanceof - TS follows the logic.', code: 'function format(v: string | number) {\n  if (typeof v === "string") return v.toUpperCase();\n  return v.toFixed(2);          // v is number here\n}\n\nif ("author" in item) { /* item is Novel */ }\nif (el instanceof HTMLInputElement) { el.value = ""; }' },
      { label: 'Discriminated unions', desc: 'A shared literal field switches the type.', code: 'type Shape =\n  | { kind: "circle"; radius: number }\n  | { kind: "rect"; w: number; h: number };\n\nfunction areaOf(s: Shape): number {\n  switch (s.kind) {\n    case "circle": return Math.PI * s.radius ** 2;\n    case "rect":   return s.w * s.h;\n  }\n}' },
    ]},
    { title: 'Generics', snippets: [
      { label: 'Generic functions', desc: 'Write once, keep the types.', code: 'function first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\nfirst([1, 2, 3]);        // number | undefined\nfirst(["a", "b"]);       // string | undefined\n\nfunction pluck<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}' },
      { label: 'Generic types', desc: 'Containers and API responses.', code: 'interface ApiResult<T> {\n  ok: boolean;\n  data: T;\n  error?: string;\n}\n\ntype BooksResponse = ApiResult<Book[]>;\n\nclass Stack<T> {\n  private items: T[] = [];\n  push(item: T) { this.items.push(item); }\n  pop(): T | undefined { return this.items.pop(); }\n}' },
    ]},
    { title: 'Utility Types', snippets: [
      { label: 'The built-in toolkit', desc: 'Reshape existing types instead of redefining.', code: 'Partial<Book>            // all props optional\nRequired<Book>           // all props required\nPick<Book, "title" | "pages">\nOmit<Book, "isbn">\nReadonly<Book>\nRecord<string, Book>\nNonNullable<string | null>  // string' },
      { label: 'keyof & typeof', desc: 'Derive types from values and keys.', code: 'const config = { retries: 3, verbose: true };\ntype Config = typeof config;      // { retries: number; … }\ntype ConfigKey = keyof Config;    // "retries" | "verbose"\n\nconst STATUSES = ["draft", "published"] as const;\ntype Status = typeof STATUSES[number]; // union from array' },
    ]},
    { title: 'Classes & Enums', snippets: [
      { label: 'Class with modifiers', desc: 'Access levels and constructor shorthand.', code: 'class Library {\n  private books: Book[] = [];\n\n  constructor(public name: string,\n              protected city: string) {}\n\n  add(book: Book): this {\n    this.books.push(book);\n    return this;             // chainable\n  }\n}' },
      { label: 'Enums vs const unions', desc: 'Most codebases prefer literal unions.', code: 'enum Level { Debug, Info, Warn, Error }\nlet l: Level = Level.Warn;\n\n// usually better:\ntype LogLevel = "debug" | "info" | "warn" | "error";' },
    ]},
    { title: 'Config & Assertions', snippets: [
      { label: 'tsconfig essentials', desc: 'The flags that catch real bugs.', code: '{\n  "compilerOptions": {\n    "strict": true,\n    "target": "ES2022",\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "noUncheckedIndexedAccess": true,\n    "outDir": "dist"\n  },\n  "include": ["src"]\n}' },
      { label: 'Assertions & satisfies', desc: 'Tell the checker what you know - carefully.', code: 'const input = document.querySelector("input") as HTMLInputElement;\nconst el = document.getElementById("app")!; // non-null\n\nconst palette = {\n  ink: "#2b2416",\n  stamp: "#a93b2a",\n} satisfies Record<string, string>; // checked, not widened' },
    ]},
  ],
});
