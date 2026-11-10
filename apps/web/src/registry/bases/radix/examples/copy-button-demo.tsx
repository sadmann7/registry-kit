import { CopyButton } from "@/registry/bases/radix/ui/copy-button";

export default function CopyButtonDemo() {
  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-sm">
      <span>pnpm dlx shadcn@latest init</span>
      <CopyButton value="pnpm dlx shadcn@latest init" />
    </div>
  );
}
