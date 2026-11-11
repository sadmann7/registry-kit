# Contributing Guide

Thank you for investing your time in contributing to registry-kit.

If you have any questions, feel free to reach out to [@sadmann17](https://x.com/sadmann17).

## Project Structure

See [How it works](./docs/how-it-works.md) for how the registry, its styles and the scripts fit together, and [Adding items](./docs/adding-items.md) for what an item needs.

## Getting started

### Clone the project

```shell
git clone https://github.com/sadmann7/registry-kit
cd registry-kit
```

### Create a new branch

```shell
git checkout -b sadman/add-kickflip
```

### Install dependencies

```shell
pnpm install
```

### Start the dev server

```shell
pnpm dev
```

### Check your changes

```shell
pnpm check
pnpm registry:build
pnpm registry:test
```

`registry:test` installs every item for every base and style, so run it whenever an item, a style or a script changes.

### Commit your changes

When committing your changes, use the following format:

```text
<type>(<scope>): <description>
```

**Types:**

- `feat` : a new feature
- `fix` : a bug fix
- `refactor` : code change that is neither a feature nor a bug fix
- `perf` : performance improvement
- `style` : formatting, missing semicolons, etc. (no logic change)
- `test` : adding or updating tests
- `docs` : documentation changes only
- `chore` : build process, dependency updates, tooling
- `ci` : continuous integration changes

**Scope:**
Scope your commit to the part of the codebase that is affected, for example `registry`, `scripts`, `styles`, `ui`, `ci`, or `deps`. Use an item's name for changes to one item, like `timeline`.

Examples:

```shell
git commit -m "fix(timeline): flip the dot in rtl projects"
git commit -m "feat(scripts): build only the styles that changed"
```

### Create a pull request

When you're finished pushing your changes, open a pull request. Its title uses the same format, since pull requests are squash-merged.
