// src/common/helpers/build-filters.helper.ts
import { FilterQuery } from 'mongoose';

export interface BuildFiltersOptions {
  searchFields?: string[];
  exactMatchFields?: string[];
  searchTerm?: string;
  caseSensitive?: boolean;
  customFilters?: Record<string, (value: any) => any>;
}

export const buildFilters = <T>(
  queryParams: Record<string, any>,
  options: BuildFiltersOptions = {},
): FilterQuery<T> => {
  const {
    searchFields = [],
    exactMatchFields = [],
    searchTerm = 'search',
    caseSensitive = false,
    customFilters = {},
  } = options;

  const filter: Record<string, any> = {}; // Use Record<string, any> instead of FilterQuery<T>
  const regexOptions = caseSensitive ? '' : 'i';

  // Handle multi-field search
  const searchValue = queryParams[searchTerm];
  if (searchValue && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: searchValue, $options: regexOptions },
    }));
  }

  // Handle exact match fields
  exactMatchFields.forEach((field) => {
    const value = queryParams[field];
    if (value !== undefined && value !== null && value !== '') {
      filter[field] = { $regex: value, $options: regexOptions };
    }
  });

  // Handle all other query params dynamically
  Object.keys(queryParams).forEach((key) => {
    // Skip reserved params and already processed fields
    if (
      key === searchTerm ||
      searchFields.includes(key) ||
      exactMatchFields.includes(key) ||
      key === 'page' ||
      key === 'limit' ||
      key === 'sortBy' ||
      key === 'sortOrder' ||
      key === 'populate'
    ) {
      return;
    }

    const value = queryParams[key];
    if (value !== undefined && value !== null && value !== '') {
      // Apply custom filter logic if provided
      if (customFilters[key]) {
        filter[key] = customFilters[key](value);
      } else {
        filter[key] = { $regex: value, $options: regexOptions };
      }
    }
  });

  return filter as FilterQuery<T>;
};
