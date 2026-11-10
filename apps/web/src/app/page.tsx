import type { Registry } from "shadcn/schema";

import { CopyButton } from "@/components/copy-button";
import { PreviewControls } from "@/components/preview-controls";
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

const LIST_FORMAT = new Intl.ListFormat("en", { type: "conjunction" });

function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

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

      <section className="mx-auto grid max-w-6xl items-end gap-12 px-4 pt-16 pb-14 sm:px-12 sm:pt-18 lg:grid-cols-[minmax(0,1fr)_440px]">
        <div className="flex max-w-155 flex-col gap-5">
          <p className="font-mono text-xs text-site-muted">
            {pluralize(BASES.length, "base")} ·{" "}
            {pluralize(STYLES.length, "style")} · RTL
          </p>
          <h1 className="text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
            Components that fit every shadcn project.
          </h1>
          <p className="max-w-120 text-base leading-normal text-site-muted">
            Built for {LIST_FORMAT.format(BASES.map((option) => option.title))},
            in {pluralize(STYLES.length, "style")}. The CLI handles icons and
            right-to-left layout when you install.
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

      <div className="sticky top-0 z-10 border-y border-site-hairline bg-site">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-4 py-3 sm:px-12">
          <PreviewControls base={base} style={style} />
          <span className="ml-auto hidden shrink-0 font-mono text-xs text-site-muted sm:inline">
            {pluralize(registry.items.length, "item")}
          </span>
        </div>
      </div>

      <div className="pb-6">
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

      <footer className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-7 text-xs text-site-muted sm:px-12">
        <p>Built with registry-kit. Items install with the shadcn CLI.</p>
        {/* oxlint-disable-next-line nextjs/no-html-link-for-pages -- a static file in public/r, not a page */}
        <a
          href="/r/registry.json"
          className="rounded-sm font-mono transition-colors outline-none hover:text-site-ink focus-visible:ring-3 focus-visible:ring-ring/50"
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
  const usage = USAGE[item.name]?.(base);
  const dependencies = [
    ...(item.dependencies ?? []),
    ...(item.registryDependencies ?? []),
  ];
  const command = `pnpm dlx shadcn@latest add @${namespace}/${item.name}`;
  const json = `${base}-${style}/${item.name}.json`;

  return (
    // The rule runs full width, like the header's and the toolbar's.
    <article
      id={item.name}
      className="scroll-mt-36 border-b border-site-hairline sm:scroll-mt-20"
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
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
              <ul className="flex flex-col gap-1 font-mono text-xs">
                {dependencies.map((dependency) => (
                  <li key={dependency}>{dependency}</li>
                ))}
              </ul>
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
          <div className="flex items-start gap-3 border-t border-site-hairline bg-site py-2.5 pr-2.5 pl-4 font-mono text-[12.5px] leading-7 sm:items-center">
            <span aria-hidden className="text-site-muted">
              $
            </span>
            <code className="min-w-0 flex-1 wrap-break-word sm:truncate">
              {command}
            </code>
            <a
              href={`/r/${json}`}
              title={json}
              className="hidden rounded-sm text-xs text-site-muted transition-colors outline-none hover:text-site-ink focus-visible:ring-3 focus-visible:ring-ring/50 sm:inline"
            >
              JSON
            </a>
            <CopyButton value={command} label="Copy install command" />
          </div>
        </div>
      </div>
    </article>
  );
}
