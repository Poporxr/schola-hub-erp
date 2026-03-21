export type DomainScale = 1 | 2 | 3 | 4 | 5;

export function domainScaleToLabel(value?: number | null) {
  if (value === 5) return "Excellent";
  if (value === 4) return "Very Good";
  if (value === 3) return "Good";
  if (value === 2) return "Fair";
  if (value === 1) return "Poor";
  return null;
}
