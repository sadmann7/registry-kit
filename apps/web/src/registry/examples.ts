// Usage shown for items that have nothing to render, like hooks. Items with a
// demo in `bases/{base}/examples/{item}-demo.tsx` show the demo instead.
export const USAGE: Record<string, string> = {
  "use-copy-to-clipboard": `const { copy, isCopied } = useCopyToClipboard()

<Button onClick={() => copy(value)}>
  {isCopied ? "Copied" : "Copy"}
</Button>`,
};
