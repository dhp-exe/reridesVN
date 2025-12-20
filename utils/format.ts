export const formatCurrency = (amount: number): string => {
  return `${(amount / 1000).toFixed(0)}k`;
};

export const formatDuration = (minutes: number): string => {
  return `${minutes} min`;
};

export const getTrafficStatus = (factor: number) => {
  if (factor >= 1.4) return { label: 'High', color: 'text-red-500' };
  if (factor >= 1.1) return { label: 'Medium', color: 'text-yellow-600' };
  return { label: 'Low', color: 'text-green-500' };
};