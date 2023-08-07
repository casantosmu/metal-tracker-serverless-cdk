export const getDateDaysAgo = (daysBefore: number) =>
  new Date(new Date().getTime() - daysBefore * 24 * 60 * 60 * 1000);
