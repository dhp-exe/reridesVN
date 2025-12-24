const HISTORY_KEY = 'rerides_search_history';
const MAX_HISTORY = 5;

export const saveSearchHistory = (term: string) => {
  if (!term) return;
  
  const current = getSearchHistory();
  // Remove duplicate if exists, add to top
  const updated = [term, ...current.filter(item => item !== term)].slice(0, MAX_HISTORY);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const getSearchHistory = (): string[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};