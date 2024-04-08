export interface PaginateResponse<T> {
  total: number;
  limit: number;
  offset: number;
  data: T;
}

export const paginateResponse = <T>({
  total,
  limit,
  offset,
  data,
}: PaginateResponse<T>) => {
  return {
    total,
    limit: total > limit ? limit : total,
    offset,
    data,
  };
};
