export function compactNumber(value: number) {
  const absolute = Math.abs(value);
  const units: [number, string][] = [
    [1e16, "경"],
    [1e12, "조"],
    [1e8, "억"],
    [1e4, "만"],
  ];
  const unit = units.find(([threshold]) => absolute >= threshold);
  if (!unit) return Math.floor(value).toLocaleString("ko-KR");
  const shown = value / unit[0];
  return `${shown >= 100 ? shown.toFixed(0) : shown.toFixed(1).replace(/\.0$/, "")}${unit[1]}`;
}
