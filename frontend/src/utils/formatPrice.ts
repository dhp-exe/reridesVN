export const formatPriceK = (priceVnd: number): string => {
  return `${(priceVnd / 1000).toFixed(0)}k`;
};