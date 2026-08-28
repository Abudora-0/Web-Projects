/* EPHEMERIS - SQL reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'sql', name: 'SQL', mono: 'Sq',
  call: '005.7565 SQL', tag: 'Queries', shelf: 'data', prism: 'sql',
  desc: 'SELECTs, joins, aggregation, mutations, table design, and window functions - talking to the card catalog itself.',
  keywords: 'sql database queries postgres mysql sqlite relational',
  sections: [
    { title: 'Queries', snippets: [
      { label: 'SELECT essentials', desc: 'Projection, aliasing, ordering, limiting.', code: 'SELECT title, year AS published\nFROM books\nORDER BY year DESC, title ASC\nLIMIT 10 OFFSET 20;\n\nSELECT DISTINCT author FROM books;\n\nSELECT COUNT(*) FROM books;' },
      { label: 'Expressions & CASE', desc: 'Computed columns and inline conditionals.', code: "SELECT title,\n       2026 - year AS age,\n       CASE\n         WHEN year < 1900 THEN 'antique'\n         WHEN year < 2000 THEN 'modern'\n         ELSE 'contemporary'\n       END AS era\nFROM books;" },
    ]},
    { title: 'Filtering', snippets: [
      { label: 'WHERE clauses', desc: 'Comparison, ranges, sets, and pattern matching.', code: "SELECT * FROM books\nWHERE year BETWEEN 1950 AND 2000\n  AND author IN ('Herbert', 'Austen')\n  AND title LIKE 'The %'      -- % any, _ one char\n  AND isbn IS NOT NULL\n  AND (pages > 300 OR rating >= 4);" },
      { label: 'Subqueries & EXISTS', desc: 'Filter by the result of another query.', code: 'SELECT title FROM books\nWHERE year = (SELECT MAX(year) FROM books);\n\nSELECT name FROM members m\nWHERE EXISTS (\n  SELECT 1 FROM loans l\n  WHERE l.member_id = m.id\n    AND l.returned_at IS NULL\n);' },
    ]},
    { title: 'Joins', snippets: [
      { label: 'INNER & LEFT JOIN', desc: 'LEFT keeps unmatched rows from the left table.', code: 'SELECT b.title, m.name\nFROM loans l\nJOIN books   b ON b.id = l.book_id\nJOIN members m ON m.id = l.member_id;\n\n-- include books never borrowed\nSELECT b.title, COUNT(l.id) AS times_borrowed\nFROM books b\nLEFT JOIN loans l ON l.book_id = b.id\nGROUP BY b.title;' },
      { label: 'Self join & anti join', desc: 'Rows without a match: LEFT JOIN … IS NULL.', code: '-- books with no loans at all\nSELECT b.title\nFROM books b\nLEFT JOIN loans l ON l.book_id = b.id\nWHERE l.id IS NULL;\n\n-- pair books by the same author\nSELECT a.title, b.title\nFROM books a\nJOIN books b ON a.author = b.author\n           AND a.id < b.id;' },
    ]},
    { title: 'Aggregation', snippets: [
      { label: 'GROUP BY & HAVING', desc: 'HAVING filters groups; WHERE filters rows.', code: 'SELECT author,\n       COUNT(*)    AS titles,\n       AVG(pages)  AS avg_pages,\n       MAX(year)   AS latest\nFROM books\nWHERE year > 1900\nGROUP BY author\nHAVING COUNT(*) >= 3\nORDER BY titles DESC;' },
      { label: 'Aggregate functions', desc: 'The standard set, plus conditional counting.', code: 'SELECT COUNT(*)                          AS all_rows,\n       COUNT(isbn)                       AS with_isbn,\n       SUM(pages)                        AS total_pages,\n       MIN(year), MAX(year),\n       ROUND(AVG(rating), 1)             AS avg_rating,\n       COUNT(*) FILTER (WHERE year>2000) AS recent\nFROM books;' },
    ]},
    { title: 'Insert · Update · Delete', snippets: [
      { label: 'Writing rows', desc: 'Multi-row insert and insert-from-select.', code: "INSERT INTO books (title, author, year)\nVALUES ('Dune', 'Herbert', 1965),\n       ('Emma', 'Austen', 1815);\n\nINSERT INTO archive (title, year)\nSELECT title, year FROM books WHERE year < 1900;" },
      { label: 'UPDATE & DELETE', desc: 'Always with a WHERE - test it as a SELECT first.', code: "UPDATE books\nSET rating = 5, updated_at = CURRENT_TIMESTAMP\nWHERE title = 'Dune';\n\nDELETE FROM loans\nWHERE returned_at IS NOT NULL\n  AND returned_at < DATE '2020-01-01';\n\n-- upsert (Postgres/SQLite)\nINSERT INTO counts (lang, n) VALUES ('js', 1)\nON CONFLICT (lang) DO UPDATE SET n = counts.n + 1;" },
    ]},
    { title: 'Tables & Constraints', snippets: [
      { label: 'CREATE TABLE', desc: 'Keys, defaults, and referential integrity.', code: 'CREATE TABLE books (\n  id      INTEGER PRIMARY KEY,\n  title   TEXT NOT NULL,\n  isbn    TEXT UNIQUE,\n  year    INTEGER CHECK (year > 0),\n  author_id INTEGER REFERENCES authors(id)\n            ON DELETE SET NULL,\n  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);' },
      { label: 'ALTER & DROP', desc: 'Evolve a schema in place.', code: "ALTER TABLE books ADD COLUMN pages INTEGER;\nALTER TABLE books RENAME COLUMN year TO published;\nALTER TABLE books DROP COLUMN isbn;\n\nDROP TABLE IF EXISTS temp_import;\nTRUNCATE TABLE staging;   -- fast delete-all" },
    ]},
    { title: 'Indexes & Views', snippets: [
      { label: 'Indexes', desc: 'Index what you filter and join on; verify with EXPLAIN.', code: 'CREATE INDEX idx_books_author ON books(author_id);\nCREATE UNIQUE INDEX idx_books_isbn ON books(isbn);\nCREATE INDEX idx_loans_open\n  ON loans(book_id) WHERE returned_at IS NULL;  -- partial\n\nEXPLAIN SELECT * FROM books WHERE author_id = 3;' },
      { label: 'Views & CTEs', desc: 'Name a query - temporarily (CTE) or permanently (view).', code: "CREATE VIEW overdue AS\nSELECT m.name, b.title, l.due_date\nFROM loans l\nJOIN members m ON m.id = l.member_id\nJOIN books b   ON b.id = l.book_id\nWHERE l.returned_at IS NULL AND l.due_date < CURRENT_DATE;\n\nWITH busy AS (\n  SELECT member_id, COUNT(*) n FROM loans GROUP BY member_id\n)\nSELECT * FROM busy WHERE n > 10;" },
    ]},
    { title: 'Window Functions', snippets: [
      { label: 'Ranking', desc: 'Number rows within partitions without collapsing them.', code: 'SELECT title, author, year,\n       ROW_NUMBER() OVER (PARTITION BY author\n                          ORDER BY year)        AS nth_book,\n       RANK()       OVER (ORDER BY rating DESC) AS overall_rank\nFROM books;' },
      { label: 'Running totals & neighbors', desc: 'Aggregate over a moving frame; peek at nearby rows.', code: 'SELECT loan_date,\n       COUNT(*) OVER (ORDER BY loan_date)       AS running_total,\n       LAG(loan_date)  OVER (ORDER BY loan_date) AS prev_loan,\n       LEAD(loan_date) OVER (ORDER BY loan_date) AS next_loan\nFROM loans;' },
    ]},
  ],
});
