/* THE STACKS — Go reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'go', name: 'Go', mono: 'Go',
  call: '005.133 GO', tag: 'Concurrent', shelf: 'core', prism: 'go',
  desc: 'Slices, maps, structs, interfaces, goroutines, and error handling — small language, sharp tools.',
  keywords: 'go golang goroutines channels backend cloud',
  sections: [
    { title: 'Basics', snippets: [
      { label: 'Program skeleton', desc: 'Run with: go run main.go', code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, world")\n}' },
      { label: 'Variables', desc: ':= declares and infers inside functions.', code: 'var title string = "Dune"\nvar year = 1965        // inferred\ncount := 3             // short form (in funcs only)\n\nconst MaxBooks = 100\n\nvar a, b = 1, 2\na, b = b, a            // swap\n\nfmt.Printf("%s (%d): %v\\n", title, year, count)' },
    ]},
    { title: 'Control Flow', snippets: [
      { label: 'if & for', desc: 'for is the only loop; if can open with a statement.', code: 'if n := len(books); n > 0 {\n    fmt.Println(n, "books")\n}\n\nfor i := 0; i < 5; i++ { }\n\nfor count > 0 {          // while\n    count--\n}\n\nfor {                     // forever\n    break\n}' },
      { label: 'switch', desc: 'No fallthrough by default; cases can be conditions.', code: 'switch kind {\ncase "book", "novel":\n    fmt.Println("fiction shelf")\ncase "journal":\n    fmt.Println("periodicals")\ndefault:\n    fmt.Println("front desk")\n}\n\nswitch {\ncase year < 1900:\n    fmt.Println("antique")\ncase year < 2000:\n    fmt.Println("modern")\n}' },
    ]},
    { title: 'Slices & Maps', snippets: [
      { label: 'Slices', desc: 'Grow with append; slice with [low:high].', code: 'books := []string{"Dune", "Emma"}\nbooks = append(books, "Ubik")\nlen(books)                 // 3\n\nfirst := books[0]\nsome := books[1:3]         // view, shares memory\n\ncopied := make([]string, len(books))\ncopy(copied, books)\n\nfor i, b := range books {\n    fmt.Println(i, b)\n}' },
      { label: 'Maps', desc: 'The comma-ok idiom tells presence from zero value.', code: 'counts := map[string]int{"js": 1}\ncounts["go"] = 2\ndelete(counts, "js")\n\nn, ok := counts["py"]     // 0, false\nif !ok {\n    fmt.Println("not filed")\n}\n\nfor key, val := range counts {\n    fmt.Println(key, val)\n}' },
    ]},
    { title: 'Functions', snippets: [
      { label: 'Multiple returns', desc: 'The (value, error) pair is the core idiom.', code: 'func divide(a, b float64) (float64, error) {\n    if b == 0 {\n        return 0, fmt.Errorf("divide by zero")\n    }\n    return a / b, nil\n}\n\nresult, err := divide(10, 3)\nif err != nil {\n    log.Fatal(err)\n}' },
      { label: 'Variadic, closures, defer', desc: 'defer runs when the function returns.', code: 'func sum(nums ...int) int {\n    total := 0\n    for _, n := range nums {\n        total += n\n    }\n    return total\n}\n\ncounter := func() func() int {\n    n := 0\n    return func() int { n++; return n }\n}()\n\nf, _ := os.Open("notes.txt")\ndefer f.Close()          // guaranteed cleanup' },
    ]},
    { title: 'Structs & Methods', snippets: [
      { label: 'Structs', desc: 'Composition over inheritance — embed instead.', code: 'type Book struct {\n    Title string\n    Year  int\n}\n\nb := Book{Title: "Dune", Year: 1965}\nb.Year = 1966\n\ntype Novel struct {\n    Book             // embedded: Novel gets Book\'s fields\n    Author string\n}\nn := Novel{Book{"Emma", 1815}, "Austen"}\nfmt.Println(n.Title)     // promoted field' },
      { label: 'Methods & receivers', desc: 'Pointer receiver to modify; value to read.', code: 'func (b Book) Age() int {\n    return 2026 - b.Year\n}\n\nfunc (b *Book) Checkout() {\n    b.Out = true         // modifies the original\n}\n\nb.Checkout()             // Go auto-takes the address' },
    ]},
    { title: 'Interfaces', snippets: [
      { label: 'Implicit satisfaction', desc: 'No implements keyword — just match the methods.', code: 'type Shelvable interface {\n    CallNumber() string\n}\n\nfunc (b Book) CallNumber() string {\n    return fmt.Sprintf("005.13 %s", b.Title[:3])\n}\n\n// Book now satisfies Shelvable automatically\nfunc file(s Shelvable) {\n    fmt.Println(s.CallNumber())\n}' },
      { label: 'Type assertions', desc: 'Recover the concrete type when needed.', code: 'var s Shelvable = Book{Title: "Dune"}\n\nif b, ok := s.(Book); ok {\n    fmt.Println(b.Year)\n}\n\nswitch v := s.(type) {\ncase Book:\n    fmt.Println("book:", v.Title)\ncase *Novel:\n    fmt.Println("novel:", v.Author)\n}' },
    ]},
    { title: 'Goroutines & Channels', snippets: [
      { label: 'Goroutines + WaitGroup', desc: 'Cheap concurrent functions; wait for them properly.', code: 'var wg sync.WaitGroup\n\nfor _, url := range urls {\n    wg.Add(1)\n    go func(u string) {\n        defer wg.Done()\n        fetch(u)\n    }(url)\n}\nwg.Wait()' },
      { label: 'Channels', desc: 'Communicate by passing values, not sharing memory.', code: 'results := make(chan string, 3)   // buffered\n\ngo func() {\n    results <- "done: dune"\n    close(results)\n}()\n\nfor r := range results {          // until closed\n    fmt.Println(r)\n}\n\nselect {\ncase msg := <-ch1:\n    fmt.Println(msg)\ncase <-time.After(time.Second):\n    fmt.Println("timeout")\n}' },
    ]},
    { title: 'Errors', snippets: [
      { label: 'Wrapping & checking', desc: '%w wraps; errors.Is / As inspect the chain.', code: 'var ErrNotFound = errors.New("card not found")\n\nfunc find(id int) (*Book, error) {\n    b, err := db.Get(id)\n    if err != nil {\n        return nil, fmt.Errorf("find %d: %w", id, err)\n    }\n    return b, nil\n}\n\nif errors.Is(err, ErrNotFound) { /* … */ }\n\nvar pathErr *os.PathError\nif errors.As(err, &pathErr) { /* … */ }' },
      { label: 'Custom error types', desc: 'Any type with Error() string is an error.', code: 'type LateFee struct {\n    Days int\n}\n\nfunc (e *LateFee) Error() string {\n    return fmt.Sprintf("overdue by %d days", e.Days)\n}\n\nreturn &LateFee{Days: 12}' },
    ]},
  ],
});
