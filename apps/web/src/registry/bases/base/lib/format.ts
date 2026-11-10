function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale = "en-US",
) {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

function formatBytes(bytes: number, decimals = 0) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  if (bytes < 1) return `0 ${units[0]}`;

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : decimals)} ${units[index]}`;
}

function formatCompactNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
  locale = "en-US",
) {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  }).format(value);
}

export { formatBytes, formatCompactNumber, formatDate };
