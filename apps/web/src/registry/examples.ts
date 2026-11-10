// Usage shown for items that have nothing to render, like hooks, for the base
// being previewed. Items with a demo in `bases/{base}/examples/{item}-demo.tsx`
// show the demo instead.
export const USAGE: Record<string, (base: string) => string> = {
  "use-copy-to-clipboard": (base) => {
    // React Aria buttons take `onPress` instead of `onClick`.
    const onPress = base === "aria" ? "onPress" : "onClick";
    return `const { copy, isCopied } = useCopyToClipboard()

<Button ${onPress}={() => copy(value)}>
  {isCopied ? "Copied" : "Copy"}
</Button>`;
  },
};
