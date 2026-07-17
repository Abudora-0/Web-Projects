/* THE STACKS — C++ reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'cpp', name: 'C++', mono: 'C++',
  call: '005.133 CPP', tag: 'Systems', shelf: 'core', prism: 'cpp',
  desc: 'Modern C++: references, classes, the STL, templates, and smart pointers — power tools with guard rails.',
  keywords: 'cpp c++ stl templates raii performance games',
  sections: [
    { title: 'Basics', snippets: [
      { label: 'Program skeleton', desc: 'Compile with: g++ -std=c++20 main.cpp -o main', code: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name = "Stacks";\n    std::cout << "Hello, " << name << \'\\n\';\n    return 0;\n}' },
      { label: 'auto & initialization', desc: 'Brace-init avoids narrowing surprises.', code: 'auto n = 42;              // int\nauto price = 4.5;         // double\nauto title = std::string{"Dune"};\n\nint x{5};                 // brace init\nconst double PI = 3.14159;\nconstexpr int MAX = 100;  // compile-time constant' },
    ]},
    { title: 'References & Pointers', snippets: [
      { label: 'References', desc: 'An alias to an existing object — never null.', code: 'int n = 10;\nint &ref = n;        // ref IS n\nref = 20;            // n is now 20\n\n// pass by reference (no copy, can modify)\nvoid bump(int &x) { x++; }\n\n// pass by const reference (no copy, read-only)\nvoid print(const std::string &s);' },
      { label: 'Raw pointers (when needed)', desc: 'Prefer references and smart pointers.', code: 'int *p = &n;\n*p = 30;\np = nullptr;          // modern null\n\nif (p != nullptr) { /* safe to use */ }\n\n// new/delete exist but smart pointers replace them\nint *old = new int{5};\ndelete old;' },
    ]},
    { title: 'Classes & RAII', snippets: [
      { label: 'Class anatomy', desc: 'Constructors with member-init lists.', code: 'class Book {\npublic:\n    Book(std::string title, int year)\n        : title_{std::move(title)}, year_{year} {}\n\n    const std::string& title() const { return title_; }\n    void checkout() { out_ = true; }\n\nprivate:\n    std::string title_;\n    int year_;\n    bool out_ = false;\n};' },
      { label: 'RAII', desc: 'Resources tied to object lifetime — cleanup is automatic.', code: 'class FileLog {\npublic:\n    explicit FileLog(const char *path)\n        : f_{std::fopen(path, "a")} {}\n    ~FileLog() { if (f_) std::fclose(f_); }\n\n    // no accidental copies of the handle\n    FileLog(const FileLog&) = delete;\n    FileLog& operator=(const FileLog&) = delete;\nprivate:\n    std::FILE *f_;\n};' },
    ]},
    { title: 'STL Containers', snippets: [
      { label: 'vector', desc: 'The default container — contiguous and fast.', code: '#include <vector>\n\nstd::vector<int> nums = {1, 2, 3};\nnums.push_back(4);\nnums.emplace_back(5);     // construct in place\nnums.size();\nnums[0];                  // no bounds check\nnums.at(0);               // throws if out of range\nnums.front(); nums.back();\n\nfor (const auto &n : nums) std::cout << n;' },
      { label: 'map & unordered_map', desc: 'Sorted tree map vs hash map.', code: '#include <map>\n#include <unordered_map>\n\nstd::unordered_map<std::string, int> counts;\ncounts["js"]++;                    // inserts 0 then bumps\ncounts.contains("py");             // C++20\n\nif (auto it = counts.find("js"); it != counts.end()) {\n    std::cout << it->second;\n}\n\nfor (const auto &[key, val] : counts) { }  // structured bindings' },
    ]},
    { title: 'Algorithms', snippets: [
      { label: 'sort, find, count', desc: '<algorithm> + lambdas cover most loops.', code: '#include <algorithm>\n\nstd::sort(v.begin(), v.end());\nstd::sort(v.begin(), v.end(),\n          [](const Book &a, const Book &b) {\n              return a.year() < b.year();\n          });\n\nauto it = std::find(v.begin(), v.end(), 42);\nint n = std::count_if(v.begin(), v.end(),\n                      [](int x) { return x > 0; });' },
      { label: 'Ranges (C++20)', desc: 'Composable pipelines over containers.', code: '#include <ranges>\n\nauto evens = nums\n    | std::views::filter([](int n) { return n % 2 == 0; })\n    | std::views::transform([](int n) { return n * n; });\n\nfor (int n : evens) std::cout << n << \' \';\n\nstd::ranges::sort(v);' },
    ]},
    { title: 'Templates', snippets: [
      { label: 'Function & class templates', desc: 'Write the algorithm once for any type.', code: 'template <typename T>\nT clamp_to(T v, T lo, T hi) {\n    return std::max(lo, std::min(v, hi));\n}\n\ntemplate <typename T>\nclass Shelf {\npublic:\n    void add(T item) { items_.push_back(std::move(item)); }\nprivate:\n    std::vector<T> items_;\n};\n\nShelf<Book> fiction;' },
      { label: 'Concepts (C++20)', desc: 'Constrain templates with readable errors.', code: '#include <concepts>\n\ntemplate <std::integral T>\nT half(T n) { return n / 2; }\n\ntemplate <typename T>\nconcept Shelvable = requires(T t) {\n    { t.call_number() } -> std::convertible_to<std::string>;\n};\n\ntemplate <Shelvable T>\nvoid file(const T &item);' },
    ]},
    { title: 'Smart Pointers', snippets: [
      { label: 'unique_ptr', desc: 'Sole ownership; deletes itself. The default choice.', code: '#include <memory>\n\nauto book = std::make_unique<Book>("Dune", 1965);\nbook->checkout();\n\n// transfer ownership explicitly\nstd::unique_ptr<Book> other = std::move(book);\n// book is now empty (nullptr)' },
      { label: 'shared_ptr & weak_ptr', desc: 'Shared ownership with reference counting.', code: 'auto shared = std::make_shared<Book>("Emma", 1815);\nauto also = shared;          // count = 2\nshared.use_count();\n\n// break reference cycles\nstd::weak_ptr<Book> weak = shared;\nif (auto locked = weak.lock()) {\n    // still alive, safe to use\n}' },
    ]},
    { title: 'Modern Extras', snippets: [
      { label: 'optional, variant, string_view', desc: 'Vocabulary types for cleaner APIs.', code: '#include <optional>\n#include <string_view>\n\nstd::optional<Book> find(std::string_view title);\n\nif (auto b = find("Dune")) {\n    std::cout << b->title();\n}\nBook fallback = find("?").value_or(Book{"n/a", 0});' },
      { label: 'Structured bindings & enum class', desc: 'Unpack pairs; scoped enums.', code: 'auto [it, inserted] = counts.insert({"go", 1});\nauto [min, max] = std::minmax({3, 1, 4});\n\nenum class Status { In, Out, Lost };\nStatus s = Status::Out;\nif (s == Status::Out) { /* … */ }' },
    ]},
  ],
});
