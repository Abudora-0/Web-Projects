/* EPHEMERIS - Bash reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'bash', name: 'Bash', mono: 'Sh',
  call: '005.446 BSH', tag: 'Shell', shelf: 'data', prism: 'bash',
  desc: 'Variables, conditionals, loops, functions, and pipes - the glue language of every terminal.',
  keywords: 'bash shell terminal scripting linux unix cli zsh',
  sections: [
    { title: 'Script Basics', snippets: [
      { label: 'Script skeleton', desc: 'The safety flags catch most silent failures.', code: '#!/usr/bin/env bash\nset -euo pipefail   # exit on error, unset vars, pipe fails\n\necho "Hello from $0"\n\n# make executable & run\n# chmod +x script.sh\n# ./script.sh' },
      { label: 'Arguments & exit codes', desc: '$1…$n, $@ for all, $? for last status.', code: 'name="${1:-world}"     # first arg, with default\necho "args: $# - all: $@"\n\nif [[ $# -lt 1 ]]; then\n  echo "usage: $0 <file>" >&2\n  exit 1\nfi\n\nsome_command\necho "exit code: $?"' },
    ]},
    { title: 'Variables & Expansion', snippets: [
      { label: 'Variables', desc: 'No spaces around =; quote every expansion.', code: 'title="The Stacks"\ncount=3\nreadonly MAX=100\n\necho "$title has $count drawers"\necho "${title}!"        # braces when adjacent to text\n\nresult=$(date +%F)      # command substitution\nsum=$(( count + 2 ))    # arithmetic' },
      { label: 'String expansion tricks', desc: 'Defaults, trimming, replacing - no sed needed.', code: 'file="archive/notes.backup.txt"\n\necho "${file##*/}"       # notes.backup.txt (basename)\necho "${file%/*}"        # archive (dirname)\necho "${file%.txt}"      # strip suffix\necho "${file/backup/old}" # replace first match\necho "${#file}"          # length\necho "${undefined:-fallback}"' },
    ]},
    { title: 'Conditionals', snippets: [
      { label: 'if & tests', desc: 'Use [[ ]]; file tests are single letters.', code: 'if [[ -f "notes.txt" ]]; then   # file exists\n  echo "found"\nelif [[ -d "archive" ]]; then    # directory exists\n  echo "check the archive"\nfi\n\n[[ -z "$var" ]]   # empty string\n[[ -n "$var" ]]   # non-empty\n[[ "$a" == "$b" ]]\n[[ $n -gt 5 ]]    # numeric: -eq -ne -lt -le -gt -ge' },
      { label: 'case & short-circuit', desc: 'Pattern matching and quick guards.', code: 'case "$1" in\n  start)   echo "starting" ;;\n  stop)    echo "stopping" ;;\n  -h|--help) echo "usage…" ;;\n  *)       echo "unknown: $1" ;;\nesac\n\n[[ -f config ]] && source config\ncommand -v git >/dev/null || { echo "need git"; exit 1; }' },
    ]},
    { title: 'Loops', snippets: [
      { label: 'for loops', desc: 'Glob loops beat parsing ls output.', code: 'for f in *.md; do\n  echo "processing $f"\ndone\n\nfor i in {1..5}; do echo "$i"; done\n\nfor ((i = 0; i < 5; i++)); do\n  echo "$i"\ndone' },
      { label: 'while & reading lines', desc: 'The safe way to iterate a file line by line.', code: 'while IFS= read -r line; do\n  echo "> $line"\ndone < notes.txt\n\nn=5\nwhile (( n > 0 )); do\n  (( n-- ))\ndone\n\nfind . -name "*.log" -print0 |\n  while IFS= read -r -d "" f; do rm "$f"; done' },
    ]},
    { title: 'Functions & Arrays', snippets: [
      { label: 'Functions', desc: 'local keeps variables from leaking out.', code: 'greet() {\n  local name="${1:?name required}"\n  echo "Hello, $name"\n}\n\ngreet "Ada"\n\ntotal() {\n  local sum=0\n  for n in "$@"; do (( sum += n )); done\n  echo "$sum"          # "return" by printing\n}\nresult=$(total 1 2 3)' },
      { label: 'Arrays', desc: 'Quote "${arr[@]}" to keep elements intact.', code: 'books=("Dune" "Emma" "The C Book")\nbooks+=("Ubik")\n\necho "${books[0]}"        # first\necho "${#books[@]}"       # count\necho "${books[@]}"        # all\n\nfor b in "${books[@]}"; do\n  echo "$b"\ndone\n\ndeclare -A calls=([js]="005.133" [sql]="005.75")\necho "${calls[js]}"' },
    ]},
    { title: 'Pipes & Redirection', snippets: [
      { label: 'Redirection', desc: 'stdout is 1, stderr is 2.', code: 'cmd >  out.txt      # overwrite\ncmd >> out.txt      # append\ncmd 2> err.txt      # stderr only\ncmd &> all.txt      # both\ncmd 2>&1 | tee log  # merge, watch, and save\ncmd < input.txt     # stdin from file\ncmd <<< "a string"  # stdin from string' },
      { label: 'Pipelines', desc: 'Small tools chained into answers.', code: '# most common words in a file\ntr -s " " "\\n" < notes.txt | sort | uniq -c | sort -rn | head\n\n# find big files\ndu -ah . | sort -rh | head -20\n\n# processes matching a name\nps aux | grep "[n]ode"' },
    ]},
    { title: 'Text Tools', snippets: [
      { label: 'grep', desc: 'Search file contents; -r walks directories.', code: 'grep "pattern" file.txt\ngrep -i "case-insensitive" file.txt\ngrep -rn "TODO" src/        # recursive + line numbers\ngrep -l "main" *.c          # filenames only\ngrep -v "exclude" file.txt  # invert\ngrep -E "cat|dog" file.txt  # regex alternation\ngrep -c "hits" file.txt     # count' },
      { label: 'sed & awk one-liners', desc: 'Stream editing and column extraction.', code: "sed 's/old/new/' file        # first per line\nsed 's/old/new/g' file       # every occurrence\nsed -n '5,10p' file          # print lines 5-10\nsed -i.bak 's/a/b/g' file    # in place, keep backup\n\nawk '{print $2}' data.txt    # second column\nawk -F, '{print $1}' file.csv\nawk '{sum += $1} END {print sum}' nums.txt" },
    ]},
    { title: 'Files & Processes', snippets: [
      { label: 'File operations', desc: 'The daily handful.', code: 'cp -r src/ backup/\nmv old.txt new.txt\nrm -rf build/\nmkdir -p a/b/c\nln -s /real/path shortcut\ntouch marker.txt\nchmod +x script.sh\ntar -czf arch.tar.gz folder/   # pack\ntar -xzf arch.tar.gz           # unpack' },
      { label: 'Jobs & processes', desc: 'Background work and finding what is running.', code: 'long_task &            # run in background\njobs                   # list background jobs\nfg %1                  # bring to front\nkill %1                # stop job 1\n\nnohup task & disown    # survive logout\nkill -9 <pid>          # force kill\npgrep -f "node server" # find PIDs' },
    ]},
  ],
});
