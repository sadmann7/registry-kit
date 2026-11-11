function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale = "en-US",
) {
  // A date-only string is read as UTC, which is the day before west of it.
  const dateOnly =
    typeof date === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(date) : null;
  const value = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3]),
      )
    : new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  // `dateStyle` and `timeStyle` can't be combined with the fields below.
  const hasStyle =
    options.dateStyle !== undefined || options.timeStyle !== undefined;
  return new Intl.DateTimeFormat(
    locale,
    hasStyle
      ? options
      : { month: "long", day: "numeric", year: "numeric", ...options },
  ).format(value);
}

function formatBytes(bytes: number, decimals = 0) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  if (!Number.isFinite(bytes) || bytes < 1) return `0 ${units[0]}`;

  let index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  let value = bytes / 1024 ** index;
  // Rounding can reach the next unit, like 1023.9 KB.
  if (
    index < units.length - 1 &&
    Number(value.toFixed(index === 0 ? 0 : decimals)) >= 1024
  ) {
    index += 1;
    value /= 1024;
  }
  return `${value.toFixed(index === 0 ? 0 : decimals)} ${units[index]}`;
}

function formatCompactNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
  locale = "en-US",
) {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: Math.max(1, options.minimumFractionDigits ?? 0),
    ...options,
  }).format(value);
}

export { formatBytes, formatCompactNumber, formatDate };
