export const generateDateRange = (startDate: Date, endDate: Date): string[] => {
  const dateRange: string[] = [];

  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const yearMonth = currentDate.toISOString().slice(0, 7);
    dateRange.push(yearMonth);

    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(1);
  }

  return dateRange;
};
