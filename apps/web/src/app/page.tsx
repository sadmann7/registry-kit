import type { Registry } from "shadcn/schema";

import { Button } from "@registry-kit/ui/components/button";
import { ArrowUpRightIcon } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { PreviewControls } from "@/components/preview-controls";
import { StyleClass } from "@/components/style-class";
import { pluralize } from "@/lib/utils";
import { EXAMPLES, REGISTRIES } from "@/registry/__generated__/registries";
import {
  type BaseName,
  BASES,
  DEFAULT_BASE,
  DEFAULT_STYLE,
  type Direction,
  type StyleName,
  STYLES,
} from "@/registry/config";

type Item = Registry["items"][number];

// Matches the pen's two-layer card shadow.
const CARD_CLASS_NAME =
  "rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(17_17_16/4%),0_8px_24px_rgb(17_17_16/5%)]";

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
  const dir: Direction = params.dir === "rtl" ? "rtl" : "ltr";
  const registry = REGISTRIES[base];
  const registryUrl = `${registry.homepage}/r/{style}/{name}.json`;
  const examples = EXAMPLES[base];
  const components = registry.items.filter((item) => examples[item.name]);
  const extras = registry.items.filter((item) => !examples[item.name]);

  return (
    <main className={`style-${style}`}>
      <StyleClass style={style} />

      <section className="grid items-end gap-8 px-4 pt-10 pb-8 sm:gap-12 sm:px-12 sm:pt-18 sm:pb-14 lg:grid-cols-[minmax(0,620px)_460px] lg:justify-between lg:gap-16">
        <div className="flex flex-col gap-4 sm:gap-5">
          <p className="w-fit rounded-full border bg-card px-2.5 py-1 font-mono text-xs tracking-[0.02em]">
            {pluralize(BASES.length, "base")} ·{" "}
            {pluralize(STYLES.length, "style")} · RTL
          </p>
          <h1 className="text-[2.5rem] leading-[1.02] font-semibold tracking-[-1.2px] sm:text-6xl sm:leading-none sm:tracking-[-2.2px]">
            One registry for every shadcn project.
          </h1>
          <p className="max-w-120 text-base leading-normal text-muted-foreground">
            Components, hooks and utilities for shadcn/ui. Each one installs in
            your project&apos;s base and style, with RTL support.
          </p>
        </div>

        <div className={`${CARD_CLASS_NAME} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-border bg-background py-2.5 pr-3 pl-4">
            <span className="font-mono text-xs">components.json</span>
            <CopyButton
              label="Copy registry config"
              value={`"registries": {\n  "@${registry.name}": "${registryUrl}"\n}`}
              className="size-6 rounded-md border-transparent bg-transparent text-muted-foreground hover:bg-muted dark:bg-transparent pointer-coarse:size-9"
            />
          </div>
          <pre className="overflow-x-auto px-4 pt-4 pb-4.5 font-mono text-[12.5px] leading-normal text-muted-foreground">
            <span className="text-foreground">&quot;registries&quot;</span>
            {": {\n  "}
            <span className="text-foreground">
              &quot;@{registry.name}&quot;
            </span>
            {": "}
            <span className="text-foreground">&quot;{registryUrl}&quot;</span>
            {"\n}"}
          </pre>
        </div>
      </section>

      <div className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex items-center px-4 py-3 sm:px-12 sm:py-3.5">
          <PreviewControls base={base} style={style} dir={dir} />
          <span className="ml-auto hidden font-mono text-xs text-muted-foreground sm:block">
            {pluralize(registry.items.length, "item")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-12 px-4 pt-10 pb-14 sm:gap-16 sm:px-12 sm:pt-14 sm:pb-18">
        {components.length > 0 && (
          <div className="flex flex-col gap-10 sm:gap-12">
            {components.map((item) => {
              const Example = examples[item.name];
              return (
                <ItemSection
                  key={item.name}
                  item={item}
                  base={base}
                  style={style}
                  namespace={registry.name}
                  dir={dir}
                >
                  <Example />
                </ItemSection>
              );
            })}
          </div>
        )}

        {extras.length > 0 && (
          <section
            aria-labelledby="extras-title"
            className="flex flex-col gap-3 sm:gap-3.5"
          >
            <Heading
              id="extras-title"
              title="Hooks and utilities"
              description="Shared logic for your components."
            />
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {extras.map((item) => (
                <article
                  key={item.name}
                  id={item.name}
                  aria-labelledby={`${item.name}-title`}
                  className={`${CARD_CLASS_NAME} flex scroll-mt-36 flex-col justify-between gap-4 p-5 sm:scroll-mt-24`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                      <h3
                        id={`${item.name}-title`}
                        className="truncate font-mono text-sm"
                      >
                        {item.title ?? item.name}
                      </h3>
                      <TypeTag item={item} />
                    </div>
                    {item.description && (
                      <p className="text-sm leading-[1.45] text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <ItemLinks
                    item={item}
                    base={base}
                    style={style}
                    namespace={registry.name}
                  />
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="border-t border-border px-4 py-6 text-center text-[13px] text-muted-foreground sm:px-12 sm:py-7">
        {/* Points at the template's author, not at siteConfig.links, which
            forks change to their own repo. */}
        <p>
          Built by{" "}
          <a
            href="https://github.com/sadmann7"
            target="_blank"
            rel="noreferrer"
            className="rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            sadman
          </a>
          .
        </p>
      </footer>
    </main>
  );
}

// Title and description on one line, split by a rule; stacked on phones.
function Heading({
  id,
  title,
  description,
}: {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-sm sm:flex-row sm:items-center sm:gap-3">
      <h2
        id={id}
        className="shrink-0 text-base font-semibold tracking-[-0.01em] sm:text-[15px]"
      >
        {title}
      </h2>
      {description && (
        <p className="leading-[1.45] text-muted-foreground sm:truncate sm:border-l sm:pl-3">
          {description}
        </p>
      )}
    </div>
  );
}

function TypeTag({ item }: { item: Item }) {
  return (
    <span className="shrink-0 rounded-full bg-secondary px-2 py-px font-mono text-[11px] text-muted-foreground">
      {item.type.replace("registry:", "")}
    </span>
  );
}

function ItemLinks({
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
  const json = `${base}-${style}/${item.name}.json`;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <CopyButton
        value={`pnpm dlx shadcn@latest add @${namespace}/${item.name}`}
        className="min-w-0 shrink"
      >
        <span className="truncate">
          @{namespace}/{item.name}
        </span>
      </CopyButton>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        className="gap-1.5 border-border bg-card font-mono text-xs font-normal text-foreground hover:bg-muted hover:text-foreground dark:border-border dark:bg-card dark:hover:bg-muted pointer-coarse:h-9"
        render={<a href={`/r/${json}`} title={json} />}
      >
        JSON
        <ArrowUpRightIcon className="text-muted-foreground" />
      </Button>
    </div>
  );
}

function ItemSection({
  item,
  base,
  style,
  namespace,
  dir,
  children,
}: {
  item: Item;
  base: BaseName;
  style: StyleName;
  namespace: string;
  dir: Direction;
  children: React.ReactNode;
}) {
  return (
    <section
      id={item.name}
      aria-labelledby={`${item.name}-title`}
      className="flex scroll-mt-36 flex-col gap-3 sm:scroll-mt-24 sm:gap-3.5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Heading
          id={`${item.name}-title`}
          title={item.title ?? item.name}
          description={item.description}
        />
        <ItemLinks
          item={item}
          base={base}
          style={style}
          namespace={namespace}
        />
      </div>

      <div
        dir={dir}
        className={`${CARD_CLASS_NAME} flex min-h-72 items-center justify-center overflow-x-auto px-4 py-7 sm:min-h-75 sm:px-10 sm:py-8`}
      >
        {children}
      </div>
    </section>
  );
}
