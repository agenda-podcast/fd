# /tools

FD policy enforcement scripts. All scripts follow these rules:
- Exit code 0 = pass, non-zero = fail
- Output format: OK: [path] or FAIL: [message]
- ASCII only, 500 lines or fewer per file
- No external dependencies beyond bash and standard POSIX tools

## Scripts

### check_line_limit.sh
Verifies every non-table logic/code file is 500 lines or fewer.
Usage: `bash tools/check_line_limit.sh [file_or_dir]`
Default target: current directory (.)

### check_ascii.sh
Verifies no non-ASCII characters exist in code/doc files.
Usage: `bash tools/check_ascii.sh [file_or_dir]`

### check_required_docs.sh
Verifies all required FD documentation files are present.
Usage: `bash tools/check_required_docs.sh`
Must be run from repo root.

### check_wi_reference.sh
Verifies WI IDs exist in /backlog/work_items/.
Usage: `bash tools/check_wi_reference.sh "WI-001 WI-002"`

## Running All Checks Locally

```bash
bash tools/check_line_limit.sh .
bash tools/check_ascii.sh .
bash tools/check_required_docs.sh
```

All three must exit 0 before opening a PR.
