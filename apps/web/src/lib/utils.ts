export function getIsEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

export const CARD_CLASS_NAME =
  "rounded-xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(17_17_16/4%),0_8px_24px_rgb(17_17_16/5%)]";

export function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
