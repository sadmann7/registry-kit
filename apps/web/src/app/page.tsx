import Link from "next/link";
import type { Registry } from "shadcn/schema";

import { StyleClass } from "@/components/style-class";
import baseRegistry from "@/registry/bases/base/registry.json";
import radixRegistry from "@/registry/bases/radix/registry.json";
import {
  BASES,
  DEFAULT_BASE,
  DEFAULT_STYLE,
  STYLES,
  type BaseName,
  type StyleName,
} from "@/registry/config";
import { EXAMPLES } from "@/registry/examples";

const REGISTRIES = { radix: radixRegistry, base: baseRegistry } as Record<BaseName, Registry>;

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

  return (
    <main className={`style-${style} container mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8`}>
      <StyleClass style={style} />

      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{registry.name}</h1>
        <Switcher
          label="Base"
          options={BASES}
          value={base}
          href={(name) => ({ query: { base: name, style } })}
        />
        <Switcher
          label="Style"
          options={STYLES}
          value={style}
          href={(name) => ({ query: { base, style: name } })}
        />
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
          {`// components.json\n"registries": {\n  "@${registry.name}": "${registry.homepage}/r/{style}/{name}.json"\n}`}
        </pre>
      </header>

      {registry.items.map((item) => {
        const Example = EXAMPLES[base][item.name];
        return (
          <section key={item.name} className="flex flex-col gap-3 rounded-lg border p-4">
            <div>
              <h2 className="font-medium">{item.title ?? item.name}</h2>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
            <code className="text-xs text-muted-foreground">
              pnpm dlx shadcn@latest add @{registry.name}/{item.name}
            </code>
            {Example && (
              <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed p-6">
                <Example />
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}

function Switcher<T extends string>({
  label,
  options,
  value,
  href,
}: {
  label: string;
  options: readonly { name: T; title: string }[];
  value: T;
  href: (name: T) => { query: Record<string, string> };
}) {
  return (
    <nav aria-label={label} className="flex flex-wrap items-center gap-1.5 text-sm">
      <span className="w-12 text-muted-foreground">{label}</span>
      {options.map((option) => (
        <Link
          key={option.name}
          href={href(option.name)}
          aria-current={option.name === value || undefined}
          className="rounded-md border px-2.5 py-1 hover:bg-muted aria-[current]:bg-primary aria-[current]:text-primary-foreground"
        >
          {option.title}
        </Link>
      ))}
    </nav>
  );
}
