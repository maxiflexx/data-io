export function generateDateRange(startDate: Date, endDate: Date): string[] {
  const dateRange: string[] = [];

  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  // 시작 날짜부터 종료 날짜까지 반복하면서 연도와 월의 조합을 생성
  while (currentDate <= end) {
    const yearMonth = currentDate.toISOString().slice(0, 7).replace('-', ''); // YYYY-MM 형식에서 '-' 제거
    dateRange.push(yearMonth);

    // 다음 달로 이동
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return dateRange;
}

// 테스트
const startDate = new Date('2021-02-11');
const endDate = new Date('2024-06-23');
console.log(generateDateRange(startDate, endDate));
