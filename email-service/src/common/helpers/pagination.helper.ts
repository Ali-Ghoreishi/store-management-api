// src/common/helpers/pagination.helper.ts
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
  page: number;
}

export const getPaginationOptions = (
  query: PaginationOptions,
): PaginationResult => {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, query.limit || 10);
  const skip = (page - 1) * limit;

  const sort: Record<string, 1 | -1> = {};

  if (query.sortBy) {
    // Handle descending sort (e.g., '-createdAt')
    const sortField = query.sortBy.startsWith('-')
      ? query.sortBy.substring(1)
      : query.sortBy;
    const sortOrderValue = query.sortOrder === 'asc' ? 1 : -1;

    // If sortBy has '-', it overrides sortOrder
    const order = query.sortBy.startsWith('-') ? -1 : sortOrderValue;
    sort[sortField] = order;
  } else {
    // Default sort by createdAt descending
    sort['createdAt'] = -1;
  }

  return { skip, limit, sort, page };
};
