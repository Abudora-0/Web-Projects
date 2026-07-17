/* THE STACKS — Git reference card */
window.STACKS = window.STACKS || [];
window.STACKS.push({
  id: 'git', name: 'Git', mono: 'Gt',
  call: '005.1 GIT', tag: 'Version control', shelf: 'data', prism: 'bash',
  desc: 'The everyday commands, branching, undoing mistakes, and the fix-it recipes you need under pressure.',
  keywords: 'git version control github commit branch merge rebase',
  sections: [
    { title: 'Setup & Start', snippets: [
      { label: 'First-time setup', desc: 'Identity and quality-of-life defaults.', code: 'git config --global user.name "Ada Lovelace"\ngit config --global user.email "ada@example.com"\ngit config --global init.defaultBranch main\ngit config --global core.editor "code --wait"\ngit config --global alias.lg "log --oneline --graph --all"' },
      { label: 'New or existing project', desc: 'init locally or clone a remote.', code: 'git init                 # start tracking this folder\ngit clone https://github.com/user/repo.git\ngit clone git@github.com:user/repo.git my-folder\n\ngit status               # always safe to run' },
    ]},
    { title: 'Everyday Flow', snippets: [
      { label: 'Stage → commit', desc: 'The loop you run fifty times a day.', code: 'git status\ngit add file.txt         # stage one file\ngit add .                # stage everything\ngit add -p               # stage hunk by hunk\n\ngit commit -m "fix: overdue fee calculation"\ngit commit -am "quick fix on tracked files"' },
      { label: 'Diff & log', desc: 'See what changed, and when.', code: 'git diff                 # unstaged changes\ngit diff --staged        # staged changes\ngit diff main..feature   # between branches\n\ngit log --oneline -10\ngit log --oneline --graph --all\ngit log -p file.txt      # history of one file\ngit blame file.txt       # who wrote each line' },
    ]},
    { title: 'Branching', snippets: [
      { label: 'Create & switch', desc: 'switch is the modern checkout.', code: 'git branch                    # list\ngit switch -c feature/search  # create + switch\ngit switch main               # go back\ngit branch -d old-branch      # delete merged\ngit branch -D broken-branch   # force delete\ngit branch -m new-name        # rename current' },
      { label: 'Merge & rebase', desc: 'Merge preserves history; rebase rewrites it linear.', code: 'git switch main\ngit merge feature/search      # bring branch in\n\ngit switch feature/search\ngit rebase main               # replay onto main\n\n# conflict flow\n#   fix files → git add . → git rebase --continue\ngit merge --abort             # bail out\ngit rebase --abort' },
    ]},
    { title: 'Undo & Rescue', snippets: [
      { label: 'Undo at every stage', desc: 'From typo to committed — the right undo for each.', code: 'git restore file.txt            # discard unstaged edits\ngit restore --staged file.txt   # unstage, keep edits\ngit commit --amend              # fix last commit/message\n\ngit revert <sha>                # safe undo (new commit)\ngit reset --soft HEAD~1         # uncommit, keep staged\ngit reset --hard HEAD~1         # destroy last commit' },
      { label: 'Reflog — the safety net', desc: 'Almost nothing is truly lost.', code: 'git reflog                    # every HEAD move\ngit reset --hard HEAD@{2}     # jump back in time\n\n# recover a deleted branch\ngit reflog                    # find its last sha\ngit branch rescued <sha>' },
    ]},
    { title: 'Remotes', snippets: [
      { label: 'Push & pull', desc: '-u links your branch to the remote once.', code: 'git remote -v\ngit remote add origin git@github.com:user/repo.git\n\ngit push -u origin main       # first push\ngit push                      # after that\ngit pull                      # fetch + merge\ngit pull --rebase             # fetch + rebase\ngit fetch origin              # download only, no merge' },
      { label: 'Tracking & pruning', desc: 'Keep local views of remotes tidy.', code: 'git branch -vv                    # tracking info\ngit push origin --delete old-branch\ngit fetch --prune                 # drop dead remote refs\n\ngit switch feature-x              # auto-tracks origin/feature-x\ngit push --force-with-lease       # safer force push' },
    ]},
    { title: 'Stash & Tags', snippets: [
      { label: 'Stash', desc: 'Shelve work-in-progress without committing.', code: 'git stash                     # stash tracked changes\ngit stash -u                  # include untracked\ngit stash list\ngit stash pop                 # apply + drop latest\ngit stash apply stash@{1}     # apply, keep in list\ngit stash drop stash@{0}\ngit stash show -p             # peek inside' },
      { label: 'Tags', desc: 'Mark releases; annotated tags carry a message.', code: 'git tag v1.2.0\ngit tag -a v1.2.0 -m "Summer release"\ngit tag                       # list\ngit push origin v1.2.0        # tags don\'t push by default\ngit push origin --tags\ngit checkout v1.1.0           # inspect an old release' },
    ]},
    { title: 'Inspect & Search', snippets: [
      { label: 'Finding things', desc: 'Search code, commits, and messages.', code: 'git grep "TODO"                     # search tracked files\ngit log -S "functionName"           # commits touching a string\ngit log --grep="fix"                # search messages\ngit log --author="Ada" --since="2 weeks ago"\ngit show <sha>                      # one commit in full\ngit show <sha>:path/file.txt        # file at that commit' },
      { label: 'Bisect — find the breaking commit', desc: 'Binary search through history.', code: 'git bisect start\ngit bisect bad                # current commit is broken\ngit bisect good v1.2.0        # this release worked\n\n# git checks out the midpoint — test it, then:\ngit bisect good   # or: git bisect bad\n# repeat until git names the culprit\ngit bisect reset' },
    ]},
    { title: 'Fix-it Recipes', snippets: [
      { label: 'Common rescues', desc: 'Copy-paste answers to "oh no" moments.', code: '# committed to the wrong branch\ngit branch correct-branch\ngit reset --hard HEAD~1\ngit switch correct-branch\n\n# pull in one commit from another branch\ngit cherry-pick <sha>\n\n# forgot a file in the last commit\ngit add forgotten.txt\ngit commit --amend --no-edit' },
      { label: '.gitignore', desc: 'Patterns for files git should never see.', code: '# .gitignore\nnode_modules/\ndist/\n*.log\n.env\n.DS_Store\n\n# already-tracked file? untrack it first:\n# git rm --cached secret.env' },
    ]},
  ],
});
