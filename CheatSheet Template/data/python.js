/* THE STACKS — Python reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'python', name: 'Python', mono: 'Py',
  call: '005.133 PYT', tag: 'General purpose', shelf: 'core', prism: 'python',
  desc: 'Core syntax, collections, comprehensions, functions, classes, files, and the standard-library gems everyone forgets.',
  keywords: 'python scripting data science backend pip',
  sections: [
    { title: 'Basics', snippets: [
      { label: 'Variables & f-strings', desc: 'Dynamic types; f-strings for all formatting.', code: 'name = "Ada"\ncount = 3\nprice = 4.5\n\nprint(f"{name} borrowed {count} books")\nprint(f"{price:.2f}")      # 4.50\nprint(f"{count=}")          # count=3 (debug)\nprint(f"{1234567:,}")       # 1,234,567' },
      { label: 'Conditionals & loops', desc: 'Indentation is the block structure.', code: 'if count > 5:\n    print("many")\nelif count > 0:\n    print("some")\nelse:\n    print("none")\n\nfor i in range(3):          # 0, 1, 2\n    print(i)\n\nwhile count > 0:\n    count -= 1\n\nstatus = "open" if count else "closed"  # ternary' },
    ]},
    { title: 'Strings', snippets: [
      { label: 'String methods', desc: 'The everyday transformations.', code: 's = "  The Stacks  "\ns.strip()             # "The Stacks"\ns.lower()             # "  the stacks  "\ns.replace("a", "o")\ns.startswith("  The") # True\n"," .join(["a", "b"]) # "a,b"\n"a,b,c".split(",")    # ["a", "b", "c"]\n"card" in s           # False' },
      { label: 'Slicing', desc: 'Works on strings, lists, and tuples alike.', code: 's = "reference"\ns[0]      # "r"\ns[-1]     # "e"\ns[0:3]    # "ref"\ns[3:]     # "erence"\ns[::-1]   # "ecnerefer" (reversed)\ns[::2]    # every 2nd char' },
    ]},
    { title: 'Lists & Tuples', snippets: [
      { label: 'List operations', desc: 'append vs extend trips everyone once.', code: 'books = ["Dune", "Emma"]\nbooks.append("It")          # add one\nbooks.extend(["Ubik", "Vox"]) # add many\nbooks.insert(0, "Ada")\nbooks.remove("Emma")        # by value\nlast = books.pop()          # remove & return\nbooks.sort(key=len, reverse=True)\nlen(books)' },
      { label: 'Tuples & unpacking', desc: 'Immutable sequences; multiple assignment.', code: 'point = (3, 4)\nx, y = point\na, b = b, a                 # swap\nfirst, *rest = [1, 2, 3, 4]\n\nfor i, book in enumerate(books, start=1):\n    print(i, book)\n\nfor title, year in zip(titles, years):\n    print(title, year)' },
    ]},
    { title: 'Dicts & Sets', snippets: [
      { label: 'Dictionaries', desc: 'get() avoids KeyError; | merges (3.9+).', code: 'card = {"title": "Dune", "year": 1965}\ncard["author"] = "Herbert"\ncard.get("isbn", "n/a")     # default if missing\ncard.pop("year", None)\n\nfor key, val in card.items():\n    print(key, val)\n\nmerged = defaults | overrides' },
      { label: 'Sets', desc: 'Uniqueness and fast membership tests.', code: 'tags = {"scifi", "classic"}\ntags.add("novel")\n"scifi" in tags             # True\n\na = {1, 2, 3}\nb = {3, 4}\na | b    # union {1,2,3,4}\na & b    # intersection {3}\na - b    # difference {1,2}' },
    ]},
    { title: 'Comprehensions', snippets: [
      { label: 'List & dict comprehensions', desc: 'Transform + filter in one readable line.', code: 'squares = [n * n for n in range(10)]\nevens = [n for n in range(10) if n % 2 == 0]\n\nlengths = {word: len(word) for word in words}\nunique = {n % 3 for n in range(10)}   # set comp\n\npairs = [(x, y) for x in "ab" for y in "12"]' },
      { label: 'Generators', desc: 'Lazy sequences — nothing computed until needed.', code: 'gen = (n * n for n in range(1_000_000))\nnext(gen)          # 0\nsum(n for n in range(100) if n % 3 == 0)\n\ndef countdown(n):\n    while n > 0:\n        yield n\n        n -= 1' },
    ]},
    { title: 'Functions', snippets: [
      { label: 'Defaults, *args, **kwargs', desc: 'Never use a mutable default value.', code: 'def issue(title, days=14, *tags, **meta):\n    print(title, days, tags, meta)\n\nissue("Dune", 7, "scifi", branch="main")\n\n# keyword-only after *\ndef move(x, y, *, speed=1.0): ...\nmove(1, 2, speed=2.5)\n\ndef add(items=None):        # not items=[]\n    items = items or []' },
      { label: 'Lambdas & sorting', desc: 'Small inline functions as sort keys.', code: 'books.sort(key=lambda b: b["year"])\nnewest = max(books, key=lambda b: b["year"])\n\nfrom functools import reduce\ntotal = reduce(lambda a, b: a + b, [1, 2, 3])\n\nnames = sorted(users, key=str.lower)' },
    ]},
    { title: 'Classes', snippets: [
      { label: 'Class & dataclass', desc: 'dataclass writes init/repr/eq for you.', code: 'from dataclasses import dataclass, field\n\n@dataclass\nclass Book:\n    title: str\n    year: int = 0\n    tags: list = field(default_factory=list)\n\n    def age(self) -> int:\n        return 2026 - self.year\n\nb = Book("Dune", 1965)' },
      { label: 'Inheritance & dunders', desc: 'super() and the special methods.', code: 'class Novel(Book):\n    def __init__(self, title, year, author):\n        super().__init__(title, year)\n        self.author = author\n\n    def __str__(self):\n        return f"{self.title} by {self.author}"\n\n    def __len__(self):\n        return len(self.title)' },
    ]},
    { title: 'Files & Errors', snippets: [
      { label: 'Reading & writing files', desc: 'with closes the file for you, even on error.', code: 'with open("notes.txt", encoding="utf-8") as f:\n    text = f.read()\n\nwith open("notes.txt") as f:\n    for line in f:\n        print(line.rstrip())\n\nwith open("out.txt", "w", encoding="utf-8") as f:\n    f.write("filed.\\n")\n\nimport json\nwith open("data.json") as f:\n    data = json.load(f)' },
      { label: 'Exceptions', desc: 'Catch what you expect; finally always runs.', code: 'try:\n    value = int(text)\nexcept ValueError:\n    value = 0\nexcept (OSError, KeyError) as e:\n    print(f"failed: {e}")\nelse:\n    print("parsed fine")\nfinally:\n    cleanup()\n\nraise ValueError("card not found")' },
    ]},
    { title: 'Stdlib Gems', snippets: [
      { label: 'pathlib & datetime', desc: 'Modern paths and dates.', code: 'from pathlib import Path\np = Path("notes") / "today.md"\np.exists()\np.read_text(encoding="utf-8")\nlist(Path(".").glob("*.py"))\n\nfrom datetime import date, timedelta\ndue = date.today() + timedelta(days=14)\ndue.isoformat()       # "2026-07-31"' },
      { label: 'collections & itertools', desc: 'Counters, grouping, and defaults.', code: 'from collections import Counter, defaultdict\nCounter("bookkeeper").most_common(2)\n\ngroups = defaultdict(list)\nfor b in books:\n    groups[b.year].append(b)\n\nfrom itertools import chain, pairwise\nlist(chain([1, 2], [3]))    # [1,2,3]\nlist(pairwise("abc"))        # [("a","b"),("b","c")]' },
    ]},
  ],
});
