/* EPHEMERIS - C reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'c', name: 'C', mono: 'C',
  call: '005.133 C', tag: 'Systems', shelf: 'core', prism: 'c',
  desc: 'Pointers, arrays, structs, memory, and file I/O - the language underneath everything else.',
  keywords: 'c systems low-level pointers memory embedded',
  sections: [
    { title: 'Basics', snippets: [
      { label: 'Program skeleton', desc: 'Compile with: gcc main.c -o main -Wall', code: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, world\\n");\n    return 0;\n}' },
      { label: 'Types & printf formats', desc: 'The format specifiers you always look up.', code: 'int n = 42;          // %d\nunsigned u = 7u;     // %u\nlong l = 100000L;    // %ld\nfloat f = 2.5f;      // %f\ndouble d = 3.14;     // %f  (%.2f for precision)\nchar c = \'A\';        // %c\nchar *s = "text";    // %s\nsize_t len = 10;     // %zu\nvoid *p = &n;        // %p\n\nprintf("%d %.2f %s\\n", n, d, s);' },
    ]},
    { title: 'Control Flow', snippets: [
      { label: 'Conditionals & loops', desc: 'Braces even for one-liners save debugging later.', code: 'if (n > 0) {\n    puts("positive");\n} else if (n == 0) {\n    puts("zero");\n} else {\n    puts("negative");\n}\n\nfor (int i = 0; i < 10; i++) { }\nwhile (n-- > 0) { }\ndo { } while (0);' },
      { label: 'switch', desc: 'break or fall through - on purpose only.', code: 'switch (grade) {\n    case \'A\':\n    case \'B\':\n        puts("pass");\n        break;\n    case \'F\':\n        puts("fail");\n        break;\n    default:\n        puts("unknown");\n}' },
    ]},
    { title: 'Pointers', snippets: [
      { label: 'Pointer basics', desc: '& takes an address, * follows one.', code: 'int n = 42;\nint *p = &n;      // p holds the address of n\n\nprintf("%d\\n", *p);   // 42 (dereference)\n*p = 10;              // n is now 10\n\nint **pp = &p;        // pointer to pointer\nif (p != NULL) { }    // always check' },
      { label: 'Pointers & functions', desc: 'Pass by address to let a function modify the caller.', code: 'void swap(int *a, int *b) {\n    int tmp = *a;\n    *a = *b;\n    *b = tmp;\n}\n\nint x = 1, y = 2;\nswap(&x, &y);        // x=2, y=1' },
    ]},
    { title: 'Arrays & Strings', snippets: [
      { label: 'Arrays', desc: 'Array names decay to pointers in function calls.', code: 'int nums[5] = {1, 2, 3, 4, 5};\nint zeros[10] = {0};\nsize_t len = sizeof nums / sizeof nums[0];\n\nfor (size_t i = 0; i < len; i++) {\n    printf("%d ", nums[i]);\n}\n\nvoid fill(int *arr, size_t n);  // arrays arrive as pointers' },
      { label: 'C strings', desc: 'Null-terminated; use the n-variants for safety.', code: '#include <string.h>\n\nchar name[32] = "Stacks";\nstrlen(name);               // 6 (no \\0)\nstrncpy(name, "Desk", sizeof name - 1);\nstrncat(name, "!", sizeof name - strlen(name) - 1);\nstrcmp(a, b) == 0           // equal\nsnprintf(buf, sizeof buf, "%s-%d", name, 3);' },
    ]},
    { title: 'Structs & Typedef', snippets: [
      { label: 'Defining structs', desc: 'Group related data; typedef removes the keyword.', code: 'typedef struct {\n    char title[64];\n    int year;\n    int checked_out;\n} Book;\n\nBook b = { "Dune", 1965, 0 };\nb.year = 1966;\n\nBook *p = &b;\np->year = 1967;      // arrow through a pointer' },
      { label: 'Struct arrays & functions', desc: 'Pass structs by pointer to avoid copies.', code: 'void print_book(const Book *b) {\n    printf("%s (%d)\\n", b->title, b->year);\n}\n\nBook shelf[3] = {\n    { "Dune", 1965, 0 },\n    { "Emma", 1815, 1 },\n};\nfor (int i = 0; i < 3; i++) print_book(&shelf[i]);' },
    ]},
    { title: 'Dynamic Memory', snippets: [
      { label: 'malloc / free', desc: 'Every malloc needs exactly one free.', code: '#include <stdlib.h>\n\nint *nums = malloc(10 * sizeof *nums);\nif (nums == NULL) return 1;    // always check\n\nnums[0] = 42;\n\nnums = realloc(nums, 20 * sizeof *nums);\nfree(nums);\nnums = NULL;                   // avoid dangling use' },
      { label: 'calloc & ownership', desc: 'calloc zeroes; document who frees what.', code: '/* zero-initialized array */\nBook *books = calloc(n, sizeof *books);\n\n/* caller owns the result - must free() */\nchar *dup_string(const char *s) {\n    char *copy = malloc(strlen(s) + 1);\n    if (copy) strcpy(copy, s);\n    return copy;\n}' },
    ]},
    { title: 'File I/O', snippets: [
      { label: 'Reading a file', desc: 'fgets stops at newline or buffer limit.', code: '#include <stdio.h>\n\nFILE *f = fopen("notes.txt", "r");\nif (f == NULL) { perror("open"); return 1; }\n\nchar line[256];\nwhile (fgets(line, sizeof line, f)) {\n    printf("%s", line);\n}\nfclose(f);' },
      { label: 'Writing & appending', desc: '"w" truncates, "a" appends.', code: 'FILE *f = fopen("log.txt", "a");\nif (f) {\n    fprintf(f, "checked out: %s\\n", title);\n    fclose(f);\n}\n\n/* binary */\nfwrite(&record, sizeof record, 1, f);\nfread(&record, sizeof record, 1, f);' },
    ]},
    { title: 'Preprocessor', snippets: [
      { label: 'Macros & constants', desc: 'Parenthesize macro arguments, always.', code: '#define MAX_BOOKS 100\n#define MIN(a, b) ((a) < (b) ? (a) : (b))\n\n#ifdef DEBUG\n#define LOG(msg) fprintf(stderr, "%s\\n", msg)\n#else\n#define LOG(msg)\n#endif' },
      { label: 'Header guards', desc: 'Stop double inclusion; declare in .h, define in .c.', code: '/* book.h */\n#ifndef BOOK_H\n#define BOOK_H\n\ntypedef struct Book Book;\nBook *book_new(const char *title);\nvoid book_free(Book *b);\n\n#endif /* BOOK_H */' },
    ]},
  ],
});
