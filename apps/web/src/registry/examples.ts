// Usage shown for items that have nothing to render, like hooks, for the base
// being previewed. Items with a demo in `bases/{base}/examples/{item}-demo.tsx`
// show the demo instead.
export const USAGE: Record<string, (base: string) => string> = {
  format: () => `formatDate(createdAt) // November 3, 2026
formatBytes(1_572_864, 1) // 1.5 MB
formatCompactNumber(12_400) // 12.4K`,
  "use-controllable-state":
    () => `const [value, setValue] = useControllableState({
  value: valueProp,
  defaultValue,
  onValueChange,
})`,
  "use-copy-to-clipboard": (base) => {
    // React Aria buttons take `onPress` instead of `onClick`.
    const onPress = base === "aria" ? "onPress" : "onClick";
    return `const { copy, isCopied } = useCopyToClipboard()

<Button ${onPress}={() => copy(value)}>
  {isCopied ? "Copied" : "Copy"}
</Button>`;
  },
};
