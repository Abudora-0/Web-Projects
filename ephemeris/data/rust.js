/* EPHEMERIS - Rust reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'rust', name: 'Rust', mono: 'Rs',
  call: '005.133 RUS', tag: 'Memory-safe', shelf: 'core', prism: 'rust',
  desc: 'Ownership, borrowing, pattern matching, traits, and Result - safety enforced at compile time.',
  keywords: 'rust ownership borrow checker cargo memory safety',
  sections: [
    { title: 'Basics', snippets: [
      { label: 'Program skeleton', desc: 'Run with: cargo run', code: 'fn main() {\n    let name = "world";\n    println!("Hello, {name}!");\n}' },
      { label: 'Variables & mutability', desc: 'Immutable by default; shadowing is idiomatic.', code: 'let count = 5;          // immutable\nlet mut total = 0;      // mutable\ntotal += count;\n\nlet spaces = "   ";\nlet spaces = spaces.len();   // shadowing, new type ok\n\nconst MAX_BOOKS: u32 = 100;\n\nlet year: i32 = 1965;   // explicit type' },
    ]},
    { title: 'Ownership & Borrowing', snippets: [
      { label: 'Moves', desc: 'Assignment moves ownership; clone to copy.', code: 'let a = String::from("Dune");\nlet b = a;              // a is MOVED into b\n// println!("{a}");     // error: a no longer valid\n\nlet c = b.clone();      // explicit deep copy\n\nlet n = 5;\nlet m = n;              // ints are Copy - both valid' },
      { label: 'References', desc: 'Many readers or one writer - never both.', code: 'fn len_of(s: &String) -> usize {   // borrow, no move\n    s.len()\n}\n\nfn shout(s: &mut String) {         // mutable borrow\n    s.push_str("!");\n}\n\nlet mut title = String::from("Dune");\nlet n = len_of(&title);\nshout(&mut title);' },
    ]},
    { title: 'Structs & Enums', snippets: [
      { label: 'Structs & impl', desc: 'Data and behavior, separately declared.', code: 'struct Book {\n    title: String,\n    year: u32,\n}\n\nimpl Book {\n    fn new(title: &str, year: u32) -> Self {\n        Self { title: title.to_string(), year }\n    }\n    fn age(&self) -> u32 {\n        2026 - self.year\n    }\n}\n\nlet b = Book::new("Dune", 1965);\nprintln!("{} yrs", b.age());' },
      { label: 'Enums with data', desc: 'Each variant can carry its own payload.', code: 'enum Status {\n    OnShelf,\n    CheckedOut { days: u32 },\n    Lost(String),          // reason\n}\n\nlet s = Status::CheckedOut { days: 12 };\n\n#[derive(Debug, Clone, PartialEq)]\nstruct Card { id: u32 }    // derive common traits' },
    ]},
    { title: 'Pattern Matching', snippets: [
      { label: 'match', desc: 'Exhaustive - the compiler checks every case.', code: 'let fee = match status {\n    Status::OnShelf => 0,\n    Status::CheckedOut { days } if days > 14 => days - 14,\n    Status::CheckedOut { .. } => 0,\n    Status::Lost(_) => 500,\n};' },
      { label: 'if let & let else', desc: 'Match a single pattern without the ceremony.', code: 'if let Some(book) = shelf.first() {\n    println!("{}", book.title);\n}\n\nlet Some(card) = catalog.get(&id) else {\n    return Err("not filed".into());\n};\n\nwhile let Some(item) = stack.pop() { }' },
    ]},
    { title: 'Option & Result', snippets: [
      { label: 'Option<T>', desc: 'No null - absence is a type.', code: 'fn find(title: &str) -> Option<&Book> {\n    shelf.iter().find(|b| b.title == title)\n}\n\nlet year = find("Dune").map(|b| b.year);\nlet year = find("Dune").map_or(0, |b| b.year);\n\nmatch find("Emma") {\n    Some(b) => println!("{}", b.year),\n    None => println!("not on shelf"),\n}' },
      { label: 'Result & the ? operator', desc: '? returns the error early, unwraps the ok.', code: 'use std::fs;\n\nfn read_notes(path: &str) -> Result<String, std::io::Error> {\n    let text = fs::read_to_string(path)?;  // early return on Err\n    Ok(text.trim().to_string())\n}\n\nmatch read_notes("notes.txt") {\n    Ok(text) => println!("{text}"),\n    Err(e) => eprintln!("failed: {e}"),\n}' },
    ]},
    { title: 'Collections', snippets: [
      { label: 'Vec & HashMap', desc: 'The two containers you use daily.', code: 'let mut shelf: Vec<String> = vec![];\nshelf.push("Dune".to_string());\nshelf.len();\nlet first = shelf.first();      // Option<&String>\n\nuse std::collections::HashMap;\nlet mut counts: HashMap<&str, i32> = HashMap::new();\n*counts.entry("js").or_insert(0) += 1;\n\nfor (k, v) in &counts {\n    println!("{k}: {v}");\n}' },
      { label: 'Iterators', desc: 'Lazy chains; collect() materializes.', code: 'let years: Vec<u32> = shelf.iter()\n    .filter(|b| b.year > 1950)\n    .map(|b| b.year)\n    .collect();\n\nlet total: u32 = years.iter().sum();\nlet oldest = shelf.iter().min_by_key(|b| b.year);\n\nshelf.iter().enumerate()\n    .for_each(|(i, b)| println!("{i}: {}", b.title));' },
    ]},
    { title: 'Traits & Generics', snippets: [
      { label: 'Defining traits', desc: 'Shared behavior with default methods.', code: 'trait Shelvable {\n    fn call_number(&self) -> String;\n\n    fn shelf(&self) -> String {        // default impl\n        self.call_number()[..3].to_string()\n    }\n}\n\nimpl Shelvable for Book {\n    fn call_number(&self) -> String {\n        format!("005.13 {}", &self.title[..3])\n    }\n}' },
      { label: 'Generic functions & bounds', desc: 'Constrain type parameters with traits.', code: 'fn largest<T: PartialOrd>(list: &[T]) -> &T {\n    let mut max = &list[0];\n    for item in list {\n        if item > max { max = item; }\n    }\n    max\n}\n\nfn file<T>(item: T) where T: Shelvable + Clone {\n    println!("{}", item.call_number());\n}\n\nfn describe(item: &impl Shelvable) { }   // impl-trait shorthand' },
    ]},
    { title: 'Strings & Misc', snippets: [
      { label: 'String vs &str', desc: 'Owned buffer vs borrowed slice.', code: 'let owned: String = String::from("Dune");\nlet slice: &str = &owned;           // borrow\nlet literal: &str = "Emma";\n\nlet joined = format!("{owned} ({literal})");\nlet upper = owned.to_uppercase();\n\nfor word in "the reference desk".split(\' \') {\n    println!("{word}");\n}' },
      { label: 'Closures', desc: 'Capture the environment; three trait flavors.', code: 'let bonus = 10;\nlet add_bonus = |n: u32| n + bonus;   // borrows bonus\nadd_bonus(5);                          // 15\n\nlet mut count = 0;\nlet mut tick = || count += 1;          // FnMut\ntick();\n\nlet sorted = {\n    let mut v = shelf.clone();\n    v.sort_by_key(|b| b.year);\n    v\n};' },
    ]},
  ],
});
