interface QueryBuilder {
  setTerms(field: string, value: any): QueryBuilder;
  setRange(field: string, from: any, to: any): QueryBuilder;
  setSort(field: string, order: 'ASC' | 'DESC' | 'asc' | 'desc'): QueryBuilder;
  setLimit(limit: number): QueryBuilder;
  setOffset(offset: number): QueryBuilder;
  build(): SearchQuery;
}

export interface SearchQuery {
  query: {
    bool: {
      filter: {
        term?: {
          [field: string]: any;
        };
        range?: {
          [field: string]: {
            gt: any;
            lte: any;
          };
        };
      }[];
    };
  };
  sort: {
    [field: string]: {
      order: 'ASC' | 'DESC' | 'asc' | 'desc';
    };
  };
  from: number;
  size: number;
}

export class OpensearchQueryBuilder implements QueryBuilder {
  private terms = [];
  private range = {};
  private sort = {};
  private from = 10;
  private size = 0;

  setTerms(field: string, value: any): QueryBuilder {
    this.terms.push({ [field]: value });
    return this;
  }

  setRange(field: string, from: any, to: any): QueryBuilder {
    this.range[field] = { gt: from, lte: to };
    return this;
  }

  setSort(field: string, order: 'ASC' | 'DESC' | 'asc' | 'desc'): QueryBuilder {
    this.sort[field] = { order };
    return this;
  }

  setOffset(offset: number): QueryBuilder {
    this.from = offset;
    return this;
  }

  setLimit(limit: number): QueryBuilder {
    this.size = limit;
    return this;
  }

  build(): any {
    const filter = [];

    this.terms.forEach((term) => {
      filter.push({ term });
    });

    filter.push({ range: this.range });

    const query = { bool: { filter } };
    const sort = this.sort;
    const from = this.from;
    const size = this.size;

    return {
      query,
      sort,
      from,
      size,
    };
  }
}
