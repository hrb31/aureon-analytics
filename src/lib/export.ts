/**
 * Export utility for converting data to CSV and triggering download
 */

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Determine columns from data if not provided
  const cols = columns ?? Object.keys(data[0]).map((key) => ({
    key: key as keyof T,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
  }));

  // Build CSV header
  const header = cols.map((col) => escapeCSVValue(col.label)).join(",");

  // Build CSV rows
  const rows = data.map((row) =>
    cols
      .map((col) => {
        const value = row[col.key];
        return escapeCSVValue(formatValue(value));
      })
      .join(",")
  );

  // Combine header and rows
  const csvContent = [header, ...rows].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSVValue(value: string): string {
  // If value contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
