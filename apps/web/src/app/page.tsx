import type { Registry } from "shadcn/schema";

import Link from "next/link";

import { CopyButton } from "@/components/copy-button";
import { StyleClass } from "@/components/style-class";
import { EXAMPLES, REGISTRIES } from "@/registry/__generated__/registries";
import {
  type BaseName,
  BASES,
  DEFAULT_BASE,
  DEFAULT_STYLE,
  type StyleName,
  STYLES,
} from "@/registry/config";
import { USAGE } from "@/registry/examples";

type Item = Registry["items"][number];

function pick<T extends string>(
  value: string | string[] | undefined,
  options: readonly { name: T }[],
  fallback: T,
) {
  return options.find((option) => option.name === value)?.name ?? fallback;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const base = pick<BaseName>(params.base, BASES, DEFAULT_BASE);
  const style = pick<StyleName>(params.style, STYLES, DEFAULT_STYLE);
  const registry = REGISTRIES[base];
  const registryUrl = `${registry.homepage}/r/{style}/{name}.json`;

  return (
    <main className={`style-${style}`}>
      <StyleClass style={style} />

      <section className="mx-auto grid max-w-360 items-end gap-12 px-4 pt-16 pb-14 sm:px-12 sm:pt-18 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="flex max-w-155 flex-col gap-5">
          <p className="font-mono text-xs text-site-muted">
            {BASES.length} bases · {STYLES.length} styles · RTL
          </p>
          <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
            Components that fit every shadcn project.
          </h1>
          <p className="max-w-120 text-base leading-normal text-site-muted">
            Built for Radix UI, Base UI and React Aria, in all eight styles. The
            CLI handles icons and right-to-left layout when you install.
          </p>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-site-hairline bg-site-surface">
          <div className="flex items-center justify-between border-b border-site-hairline py-2 pr-2.5 pl-4">
            <span className="font-mono text-xs text-site-muted">
              components.json
            </span>
            <CopyButton
              label="Copy registry config"
              value={`"registries": {\n  "@${registry.name}": "${registryUrl}"\n}`}
              className="border-transparent bg-transparent text-site-muted"
            />
          </div>
          <pre className="overflow-x-auto px-4 pt-4 pb-4.5 font-mono text-[12.5px] leading-normal text-site-muted">
            <span className="text-site-ink">&quot;registries&quot;</span>
            {": {\n  "}
            <span className="text-site-accent">
              &quot;@{registry.name}&quot;
            </span>
            {": "}
            <span className="text-site-ink">&quot;{registryUrl}&quot;</span>
            {"\n}"}
          </pre>
        </div>
      </section>

      <nav
        aria-label="Base and style"
        className="sticky top-0 z-10 border-y border-site-hairline bg-site"
      >
        <div className="mx-auto flex max-w-360 items-center gap-10 overflow-x-auto px-4 py-3.5 text-[13px] sm:px-12">
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs text-site-muted">Base</span>
            <div className="flex gap-0.5 rounded-lg border border-site-hairline bg-site-surface p-0.75">
              {BASES.map((option) => (
                <Link
                  key={option.name}
                  href={{ query: { base: option.name, style } }}
                  scroll={false}
                  aria-current={option.name === base || undefined}
                  className="rounded-md px-3 py-1.5 whitespace-nowrap text-site-muted transition-colors hover:text-site-ink aria-[current]:bg-site-ink aria-[current]:font-medium aria-[current]:text-site-surface"
                >
                  {option.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs text-site-muted">Style</span>
            <div className="flex items-center gap-1">
              {STYLES.map((option) => (
                <Link
                  key={option.name}
                  href={{ query: { base, style: option.name } }}
                  scroll={false}
                  aria-current={option.name === style || undefined}
                  className="group/style flex items-center gap-1.5 rounded-md border border-transparent px-2.5 py-1.5 text-site-muted transition-colors hover:text-site-ink aria-[current]:border-site-hairline aria-[current]:bg-site-surface aria-[current]:font-medium aria-[current]:text-site-ink"
                >
                  <span
                    aria-hidden
                    className="hidden size-1.5 rounded-full bg-site-accent group-aria-[current]/style:block"
                  />
                  {option.title}
                </Link>
              ))}
            </div>
          </div>

          <span className="ml-auto shrink-0 font-mono text-xs text-site-muted">
            {registry.items.length} items
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-360 px-4 pb-6 sm:px-12">
        {registry.items.map((item) => (
          <ItemRow
            key={item.name}
            item={item}
            base={base}
            style={style}
            namespace={registry.name}
          />
        ))}
      </div>

      <footer className="mx-auto flex max-w-360 items-center justify-between gap-4 px-4 py-7 text-xs text-site-muted sm:px-12">
        <p>Built with registry-kit. Items install with the shadcn CLI.</p>
        {/* oxlint-disable-next-line nextjs/no-html-link-for-pages -- a static file in public/r, not a page */}
        <a
          href="/r/registry.json"
          className="font-mono transition-colors hover:text-site-ink"
        >
          /r/registry.json
        </a>
      </footer>
    </main>
  );
}

function ItemRow({
  item,
  base,
  style,
  namespace,
}: {
  item: Item;
  base: BaseName;
  style: StyleName;
  namespace: string;
}) {
  const Example = EXAMPLES[base][item.name];
  const usage = USAGE[item.name];
  const dependencies = [
    ...(item.dependencies ?? []),
    ...(item.registryDependencies ?? []),
  ];
  const command = `pnpm dlx shadcn@latest add @${namespace}/${item.name}`;
  const json = `${base}-${style}/${item.name}.json`;

  return (
    <article
      id={item.name}
      className="grid scroll-mt-20 gap-6 border-b border-site-hairline py-12 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12"
    >
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
            {item.title ?? item.name}
          </h2>
          <span className="rounded border border-site-hairline px-1.75 py-0.5 font-mono text-[11px] text-site-muted">
            {item.type.replace("registry:", "")}
          </span>
        </div>
        {item.description && (
          <p className="text-sm leading-normal text-site-muted">
            {item.description}
          </p>
        )}
        {dependencies.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-2.5">
            <span className="text-xs text-site-muted">Depends on</span>
            <span className="font-mono text-xs">{dependencies.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-site-hairline bg-site-surface">
        {Example ? (
          <div className="flex min-h-50 items-center justify-center bg-background p-6 text-foreground sm:p-12">
            <Example />
          </div>
        ) : usage ? (
          <pre className="overflow-x-auto px-5 py-6 font-mono text-[13px] leading-relaxed sm:px-8 sm:py-7">
            {usage}
          </pre>
        ) : null}
        <div className="flex items-center gap-3 border-t border-site-hairline bg-site py-2.5 pr-2.5 pl-4 font-mono text-[12.5px]">
          <span aria-hidden className="text-site-muted">
            $
          </span>
          <code className="min-w-0 flex-1 truncate">{command}</code>
          <a
            href={`/r/${json}`}
            className="hidden text-xs text-site-muted transition-colors hover:text-site-ink sm:inline"
          >
            {json}
          </a>
          <CopyButton value={command} label="Copy install command" />
        </div>
      </div>
    </article>
  );
}
