//   node --test scripts/*.test.ts

import assert from "node:assert/strict";
import { test } from "node:test";
import { transformStyle } from "shadcn/utils";

import { getUncompiledMarkers } from "./registry.ts";

const styleMap = { "cn-card": "p-4", "cn-card-open": "bg-muted" };

function component(body: string) {
  return `import { cn } from "cn";

export function Card({ open, className }: { open: boolean; className?: string }) {
  ${body}
}
`;
}

async function compile(source: string) {
  return getUncompiledMarkers(await transformStyle(source, { styleMap }));
}

test("a marker in a plain string compiles", async () => {
  assert.deepEqual(
    await compile(
      component(`return <div className={cn("cn-card flex", className)} />;`),
    ),
    [],
  );
});

test("a marker in a condition is left behind", async () => {
  assert.deepEqual(
    await compile(
      component(
        `return <div className={cn("cn-card", open && "cn-card-open", className)} />;`,
      ),
    ),
    ["cn-card-open"],
  );
});

test("a marker in a variable is left behind", async () => {
  assert.deepEqual(
    await compile(
      component(
        `const extra = open ? "cn-card-open" : "";
  return <div className={cn("cn-card", extra, className)} />;`,
      ),
    ),
    ["cn-card-open"],
  );
});

test("markers the CLI resolves on install are not reported", async () => {
  assert.deepEqual(
    await compile(
      component(`return <svg className={cn("cn-rtl-flip", className)} />;`),
    ),
    [],
  );
});
