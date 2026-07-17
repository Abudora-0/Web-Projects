/* THE STACKS — Java reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'java', name: 'Java', mono: 'Jv',
  call: '005.133 JVA', tag: 'Object-oriented', shelf: 'core', prism: 'java',
  desc: 'Types, classes, interfaces, collections, streams, and exceptions — the workhorse of enterprise software.',
  keywords: 'java jvm oop enterprise spring collections streams',
  sections: [
    { title: 'Basics & Types', snippets: [
      { label: 'Hello, world', desc: 'Every program starts at main.', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, world");\n    }\n}' },
      { label: 'Primitives & var', desc: 'var infers local types (Java 10+).', code: 'int count = 42;\ndouble price = 4.50;\nboolean open = true;\nchar grade = \'A\';\nlong big = 9_000_000_000L;\n\nvar title = "Dune";        // inferred String\nfinal int MAX = 100;        // constant' },
    ]},
    { title: 'Strings', snippets: [
      { label: 'String operations', desc: 'Strings are immutable — methods return new ones.', code: 'String s = "The Stacks";\ns.length();              // 10\ns.toUpperCase();\ns.contains("Stack");     // true\ns.substring(4);          // "Stacks"\ns.replace("a", "o");\ns.split(" ");            // ["The", "Stacks"]\nString.join(", ", list);\ns.equals(other);         // never == for content' },
      { label: 'Formatting & StringBuilder', desc: 'Build big strings without churn.', code: 'String msg = String.format("%s has %d cards", name, n);\nString t = "Due: %s".formatted(dueDate);\n\nStringBuilder sb = new StringBuilder();\nfor (String part : parts) {\n    sb.append(part).append("\\n");\n}\nString result = sb.toString();' },
    ]},
    { title: 'Control Flow', snippets: [
      { label: 'Loops', desc: 'Enhanced for covers most iteration.', code: 'for (int i = 0; i < 5; i++) {\n    System.out.println(i);\n}\n\nfor (String book : books) {\n    System.out.println(book);\n}\n\nwhile (queue.hasNext()) { queue.next(); }' },
      { label: 'Switch expressions', desc: 'Arrow switch returns a value (Java 14+).', code: 'String kind = switch (code) {\n    case "F", "NF" -> "book";\n    case "PER"     -> "periodical";\n    default        -> "unknown";\n};\n\n// pattern matching (Java 21)\nString desc = switch (obj) {\n    case Integer i -> "number " + i;\n    case String s  -> "text " + s;\n    default        -> "other";\n};' },
    ]},
    { title: 'Classes & Objects', snippets: [
      { label: 'Class anatomy', desc: 'Fields private, behavior public.', code: 'public class Book {\n    private final String title;\n    private boolean checkedOut;\n\n    public Book(String title) {\n        this.title = title;\n    }\n\n    public String getTitle() { return title; }\n    public void checkout() { checkedOut = true; }\n\n    @Override\n    public String toString() {\n        return "Book[" + title + "]";\n    }\n}' },
      { label: 'Records', desc: 'Immutable data carriers in one line (Java 16+).', code: 'public record Card(String title, int year) {}\n\nCard c = new Card("Dune", 1965);\nc.title();                  // accessor\nc.equals(other);            // by value\n\n// with validation\npublic record Isbn(String value) {\n    public Isbn {\n        if (value.isBlank()) throw new IllegalArgumentException();\n    }\n}' },
    ]},
    { title: 'Inheritance & Interfaces', snippets: [
      { label: 'Extending & overriding', desc: 'One superclass; call up with super.', code: 'public class Novel extends Book {\n    private final String author;\n\n    public Novel(String title, String author) {\n        super(title);\n        this.author = author;\n    }\n\n    @Override\n    public String toString() {\n        return super.toString() + " by " + author;\n    }\n}' },
      { label: 'Interfaces', desc: 'Contracts, default methods, and lambdas.', code: 'public interface Shelvable {\n    String callNumber();\n    default String shelf() {\n        return callNumber().substring(0, 3);\n    }\n}\n\n// functional interface + lambda\nComparator<Book> byTitle =\n    (a, b) -> a.getTitle().compareTo(b.getTitle());' },
    ]},
    { title: 'Collections', snippets: [
      { label: 'List, Set, Map', desc: 'Program to the interface, pick the implementation.', code: 'List<String> books = new ArrayList<>();\nbooks.add("Dune");\nbooks.get(0);\nbooks.contains("Dune");\n\nSet<String> tags = new HashSet<>(List.of("scifi"));\n\nMap<String, Integer> counts = new HashMap<>();\ncounts.put("js", 1);\ncounts.getOrDefault("py", 0);\ncounts.merge("js", 1, Integer::sum);  // increment' },
      { label: 'Iteration & factories', desc: 'Immutable literals with List.of / Map.of.', code: 'List<String> fixed = List.of("a", "b", "c");\nMap<String, Integer> m = Map.of("a", 1, "b", 2);\n\nfor (Map.Entry<String, Integer> e : m.entrySet()) {\n    System.out.println(e.getKey() + "=" + e.getValue());\n}\n\ncounts.forEach((k, v) -> System.out.println(k + v));' },
    ]},
    { title: 'Streams & Optional', snippets: [
      { label: 'Stream pipeline', desc: 'filter → map → collect, the daily pattern.', code: 'List<String> titles = books.stream()\n    .filter(b -> b.year() > 1950)\n    .map(Book::title)\n    .sorted()\n    .toList();\n\nlong n = books.stream().filter(Book::isOut).count();\nint total = books.stream().mapToInt(Book::pages).sum();\n\nMap<Integer, List<Book>> byYear = books.stream()\n    .collect(Collectors.groupingBy(Book::year));' },
      { label: 'Optional', desc: 'A container that may be empty — no null checks.', code: 'Optional<Book> found = repo.findByTitle("Dune");\n\nfound.ifPresent(b -> System.out.println(b));\nBook b = found.orElse(DEFAULT_BOOK);\nBook c = found.orElseThrow(() -> new NotFoundException());\nString t = found.map(Book::title).orElse("n/a");' },
    ]},
    { title: 'Exceptions', snippets: [
      { label: 'try / catch / finally', desc: 'Catch specific exceptions first.', code: 'try {\n    int n = Integer.parseInt(text);\n} catch (NumberFormatException e) {\n    System.err.println("Not a number: " + e.getMessage());\n} finally {\n    System.out.println("always runs");\n}\n\nthrow new IllegalStateException("card missing");' },
      { label: 'try-with-resources', desc: 'Auto-closes anything AutoCloseable.', code: 'try (var reader = Files.newBufferedReader(path)) {\n    String line;\n    while ((line = reader.readLine()) != null) {\n        System.out.println(line);\n    }\n} catch (IOException e) {\n    e.printStackTrace();\n}\n\n// simple file read (Java 11+)\nString text = Files.readString(Path.of("notes.txt"));' },
    ]},
  ],
});
