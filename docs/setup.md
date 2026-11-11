# Setup

## Create your registry

Click **Use this template** on GitHub, clone your copy, then:

```bash
pnpm install
pnpm registry:init
```

`registry:init` asks for:

- **Name:** the namespace projects install from, as in `@acme/stat-card`
- **Homepage:** the origin the registry is served from, like `https://acme.com`
- **GitHub repository:** the repository the preview site links to. Defaults to the `origin` remote.
- **Bases and styles:** the ones to build. Nova is always kept, since it's the fallback style.
- **Example items:** keep them as a reference, or start empty

It then removes the bases, styles, items and dependencies you didn't keep. Run it on a clean working tree so you can review the changes with git.

## Run it without prompts

Every prompt has a flag, for scripts and CI:

```bash
pnpm registry:init --name acme --homepage https://acme.com \
  --github https://github.com/acme/ui --bases base,radix \
  --styles nova,lyra --no-examples --yes
```

| Flag            | What it does                                                   |
| --------------- | -------------------------------------------------------------- |
| `--name`        | Registry namespace, as in `@name/item`                         |
| `--homepage`    | Where the registry is served                                   |
| `--github`      | The repository the site links to                               |
| `--bases`       | Comma-separated bases to keep                                  |
| `--styles`      | Comma-separated styles to keep                                 |
| `--no-examples` | Remove every item, to start the registry empty                 |
| `--no-install`  | Skip `pnpm install` after removing dependencies                |
| `-y`, `--yes`   | Use the current value for anything not passed, without asking  |
| `--cwd`         | The registry-kit checkout, if not the current directory        |

`--yes` is required outside a terminal, like in CI.

## The homepage

Items that depend on your other items are published with URLs under `homepage`, like `https://acme.com/r/base-nova/use-copy-to-clipboard.json`. That lets projects install them whatever namespace they gave your registry. So `homepage` has to be the origin your registry is served from, with no path, and `registry:init` and the build both reject anything else.

## Deploy

The registry is the `apps/web` Next.js app. `pnpm build` builds the registry into `apps/web/public/r`, then builds the site, so a host that runs `pnpm build` serves both.

Deploy it somewhere that runs Next.js, like Vercel, rather than as static files. The fallbacks for [unbuilt styles](./how-it-works.md#unbuilt-styles) are rewrites in `next.config.ts`, so a static host returns 404 for them.

Once it's live, check that `https://<homepage>/r/registry.json` loads.

## Make it yours

`registry:init` sets the name and links, but these are still the template's:

- `README.md`, which describes registry-kit
- The site's description in `apps/web/src/lib/site.ts`
- The icons in `apps/web/public` and `apps/web/src/app`

Then [add your items](./adding-items.md).
