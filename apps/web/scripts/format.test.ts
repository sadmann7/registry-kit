//   node --test scripts/*.test.ts

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { BASES } from "../src/registry/config.ts";

// West of UTC, where a date-only string read as UTC lands on the day before.
process.env.TZ = "America/Los_Angeles";

interface Format {
  formatDate: (
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions,
    locale?: string,
  ) => string;
  formatBytes: (bytes: number, decimals?: number) => string;
  formatCompactNumber: (
    value: number,
    options?: Intl.NumberFormatOptions,
    locale?: string,
  ) => string;
}

for (const { name: base } of BASES) {
  const file = path.resolve(
    import.meta.dirname,
    `../src/registry/bases/${base}/lib/format.ts`,
  );
  // `registry:init` can remove the example items.
  const skip = !existsSync(file);
  const load = () => import(file) as Promise<Format>;

  test(
    `${base}: formatDate keeps the day of a date-only string`,
    { skip },
    async () => {
      const { formatDate } = await load();
      assert.equal(formatDate("2026-11-03"), "November 3, 2026");
      assert.equal(
        formatDate("2026-11-03", { month: "short", year: undefined }),
        "Nov 3",
      );
      assert.equal(formatDate(new Date(2026, 0, 5)), "January 5, 2026");
    },
  );

  test(
    `${base}: formatDate takes dateStyle and invalid dates`,
    { skip },
    async () => {
      const { formatDate } = await load();
      assert.equal(
        formatDate("2026-11-03", { dateStyle: "medium" }),
        "Nov 3, 2026",
      );
      assert.equal(formatDate("not a date"), "");
      assert.equal(formatDate("2026-02-30"), "");
    },
  );

  test(
    `${base}: formatDate shows a date-only string's day in every time zone`,
    { skip },
    async () => {
      const { formatDate } = await load();
      const timeZone = process.env.TZ;
      try {
        for (const zone of ["America/Los_Angeles", "UTC", "Asia/Tokyo"]) {
          process.env.TZ = zone;
          assert.equal(formatDate("2026-11-03"), "November 3, 2026");
          assert.equal(
            formatDate("2026-11-03", {
              month: "short",
              year: undefined,
              timeZone: "UTC",
            }),
            "Nov 3",
          );
        }
      } finally {
        process.env.TZ = timeZone;
      }
    },
  );

  test(
    `${base}: formatBytes rolls over to the next unit`,
    { skip },
    async () => {
      const { formatBytes } = await load();
      assert.equal(formatBytes(0), "0 B");
      assert.equal(formatBytes(1023), "1023 B");
      assert.equal(formatBytes(1024), "1 KB");
      assert.equal(formatBytes(1536, 1), "1.5 KB");
      assert.equal(formatBytes(1048575), "1 MB");
      assert.equal(formatBytes(1048576), "1 MB");
      assert.equal(formatBytes(Number.NaN), "0 B");
      assert.equal(formatBytes(Number.POSITIVE_INFINITY), "0 B");
    },
  );

  test(
    `${base}: formatCompactNumber takes minimumFractionDigits`,
    { skip },
    async () => {
      const { formatCompactNumber } = await load();
      assert.equal(formatCompactNumber(1234), "1.2K");
      assert.equal(
        formatCompactNumber(1234, { minimumFractionDigits: 2 }),
        "1.23K",
      );
    },
  );
}
