export const PAGINATION = {
  LIMIT: 10,
  DEFAULT_PAGE: 1,
  ON_END_REACHED_THRESHOLD: 0.3,
} as const;

export const DEBOUNCE_DELAY = 1200;

export const SEARCH = {
  PLACEHOLDER: 'Search products...',
  MIN_LENGTH: 1,
} as const;

export const MESSAGES = {
  LOAD_ERROR: 'Failed to load stock inventory',
  SEARCH_ERROR: 'Failed to search products',
  EMPTY_STATE: 'No stock available',
  SEARCH_EMPTY: 'No products found',
} as const;

export const ANIMATION = {
  DURATION: 400,
  START_OPACITY: 0,
  END_OPACITY: 1,
} as const;