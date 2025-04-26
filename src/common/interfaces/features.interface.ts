export interface QueryString {
  readonly page?: number;
  readonly limit?: number;
  readonly sort?: string;
  readonly fields?: string;
  readonly search?: string;

  [key: string]: any;
}

export interface SearchQuery {
  $or?: Array<{ [key: string]: RegExp }>;

  [key: string]: any;
}

export interface PaginationQuery {
  currentPage?: number;
  limit?: number;
  numberOfPages?: number;
  next?: number;
  prev?: number;
}