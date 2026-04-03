Review the current staged or unstaged changes for common issues.

Instructions:
1. Run `git diff` to see unstaged changes, and `git diff --cached` to see staged changes.
2. If there are no changes, inform the user and stop.
3. Review the diff for the following categories of issues:
   - **Bugs**: logic errors, off-by-one errors, null/undefined access, race conditions
   - **Security**: injection vulnerabilities, hardcoded secrets, insecure defaults
   - **Performance**: unnecessary loops, missing indexes, N+1 queries, large allocations
   - **Style**: inconsistent naming, dead code, overly complex expressions
4. For each issue found, report:
   - The file and approximate line number
   - The category (Bug, Security, Performance, Style)
   - A brief description of the problem
   - A suggested fix
5. If no issues are found, confirm the changes look good.
6. End with a short summary: number of issues found per category.
