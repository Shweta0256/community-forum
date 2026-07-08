export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PaginationResult = {
  page: number;
  pageSize: number;
  offset: number;
};

export function normalizePagination(input: PaginationInput): PaginationResult {
  const page = Number.isFinite(input.page) && input.page && input.page > 0 ? Math.floor(input.page) : 1;
  const rawPageSize =
    Number.isFinite(input.pageSize) && input.pageSize && input.pageSize > 0 ? Math.floor(input.pageSize) : 10;
  const pageSize = Math.min(rawPageSize, 50);

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize
  };
}
