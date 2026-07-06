export const fieldAreaHectares = 1;
export const litersPerMillimeterPerHectare = 10000;

export function rainfallVolumeLiters(rainfallMm: number) {
  return Math.round(rainfallMm * fieldAreaHectares * litersPerMillimeterPerHectare);
}

export function formatLiters(liters: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(liters);
}
