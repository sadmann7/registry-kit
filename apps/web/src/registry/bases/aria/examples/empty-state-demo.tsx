import { Button } from "@/registry/bases/aria/ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/registry/bases/aria/ui/empty-state";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

export default function EmptyStateDemo() {
  return (
    <EmptyState className="w-95 max-w-full">
      <EmptyStateIcon>
        <IconPlaceholder
          lucide="FolderPlusIcon"
          tabler="IconFolderPlus"
          hugeicons="FolderAddIcon"
          phosphor="FolderPlusIcon"
          remixicon="RiFolderAddLine"
        />
      </EmptyStateIcon>
      <EmptyStateTitle>No projects yet</EmptyStateTitle>
      <EmptyStateDescription>
        Create a project to get started, or import one.
      </EmptyStateDescription>
      <EmptyStateActions>
        <Button size="sm">
          <IconPlaceholder
            lucide="PlusIcon"
            tabler="IconPlus"
            hugeicons="PlusSignIcon"
            phosphor="PlusIcon"
            remixicon="RiAddLine"
            data-icon="inline-start"
          />
          New project
        </Button>
        <Button size="sm" variant="outline">
          Import
        </Button>
      </EmptyStateActions>
    </EmptyState>
  );
}
