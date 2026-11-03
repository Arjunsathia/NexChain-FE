import { useMemo, useState } from "react";

/**
 * Client-side sorting for tables. `columns` maps a key to a value getter;
 * nullish values always sort last. Clicking a new column starts descending
 * (biggest first), except for the keys listed in `ascFirst`.
 */
export default function useSortedRows(rows, columns, initial, ascFirst = ["name", "rank"]) {
  const [sort, setSort] = useState(initial);

  const sorted = useMemo(() => {
    const get = columns[sort.key];
    if (!get) return rows;
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null || Number.isNaN(va)) return 1;
      if (vb == null || Number.isNaN(vb)) return -1;
      return (va > vb ? 1 : va < vb ? -1 : 0) * sign;
    });
  }, [rows, columns, sort]);

  const toggleSort = (key) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: ascFirst.includes(key) ? "asc" : "desc" },
    );

  return { sorted, sort, setSort, toggleSort };
}
