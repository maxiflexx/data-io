export function generateObjects<T>(
  n: number,
  callback: (...args: any) => T,
  ...args: any
): T[] {
  const answer: T[] = [];

  for (let i = 0; i < n; i++) {
    answer.push(callback(...args));
  }
  return answer;
}

export function expectPagingResponseSucceed(result: any) {
  expect(result).toHaveProperty('total');
  expect(result).toHaveProperty('data');
  expect(result).toHaveProperty('limit');
  expect(result).toHaveProperty('offset');
}

export function expectResponseFailed(result: any, statusCode?: number) {
  expect(result).toHaveProperty('statusCode');
  expect(result).toHaveProperty('name');
  expect(result).toHaveProperty('message');
  expect(result).toHaveProperty('stack');
  expect(result).toHaveProperty('path');
  expect(result).toHaveProperty('timestamp');

  if (statusCode) {
    expect(result.statusCode).toEqual(statusCode);
  }
}
