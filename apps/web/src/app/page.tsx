import type { Registry } from "shadcn/schema";

import { Button } from "@registry-kit/ui/components/button";

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
            <span className="text-site-ink">&quot;@{registry.name}&quot;</span>
            {": "}
            <span className="text-site-ink">&quot;{registryUrl}&quot;</span>
            {"\n}"}
          </pre>
        </div>
      </section>

      <div className="sticky top-0 z-10 border-y border-site-hairline bg-site">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3 sm:px-12">
          <PreviewControls base={base} style={style} />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 pt-10 pb-20 sm:px-12 sm:pt-12">
        {registry.items.map((item) => (
          <ItemSection
            key={item.name}
            item={item}
            base={base}
            style={style}
            namespace={registry.name}
          />
        ))}
      </div>

      <footer className="border-t border-site-hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-7 text-xs text-site-muted sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <p>Built with registry-kit. Items install with the shadcn CLI.</p>
          {/* oxlint-disable-next-line nextjs/no-html-link-for-pages -- a static file in public/r, not a page */}
          <a
            href="/r/registry.json"
            className="w-fit rounded-sm font-mono transition-colors outline-none hover:text-site-ink focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            /r/registry.json
          </a>
        </div>
      </footer>
    </main>
  );
}

function ItemSection({
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
  const title = item.title ?? item.name;
  const json = `${base}-${style}/${item.name}.json`;

  return (
    <section
      id={item.name}
      aria-labelledby={`${item.name}-title`}
      className="flex scroll-mt-36 flex-col gap-3 sm:scroll-mt-24"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-0.5 text-sm sm:flex-row sm:items-baseline sm:gap-2.5">
          <h2 id={`${item.name}-title`} className="shrink-0 font-medium">
            {title}
          </h2>
          {item.description && (
            <p className="text-site-muted sm:truncate sm:border-l sm:border-site-hairline sm:pl-2.5">
              {item.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CopyButton
            value={`pnpm dlx shadcn@latest add @${namespace}/${item.name}`}
          >
            @{namespace}/{item.name}
          </CopyButton>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className="border-site-hairline bg-site-surface font-mono text-xs font-normal text-site-muted hover:bg-site hover:text-site-ink dark:border-site-hairline dark:bg-site-surface dark:hover:bg-site pointer-coarse:h-9"
            render={<a href={`/r/${json}`} title={json} />}
          >
            JSON
          </Button>
        </div>
      </div>

      {Example ? (
        <div className="flex min-h-72 items-center justify-center overflow-x-auto rounded-xl border bg-card p-8 text-card-foreground sm:min-h-96 sm:p-12">
          <Example />
        </div>
      ) : usage ? (
        <pre className="overflow-x-auto rounded-xl border bg-card px-5 py-5 font-mono text-[13px] leading-relaxed text-card-foreground sm:px-8 sm:py-7">
          {usage}
        </pre>
      ) : null}
    </section>
  );
}
