export const generateDateRange = (startDate: Date, endDate: Date): string[] => {
  const dateRange: string[] = [];

  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  // 시작 날짜부터 종료 날짜까지 반복하면서 연도와 월의 조합을 생성
  while (currentDate <= end) {
    const yearMonth = currentDate.toISOString().slice(0, 7);
    dateRange.push(yearMonth);

    // 다음 달로 이동
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return dateRange;
};
