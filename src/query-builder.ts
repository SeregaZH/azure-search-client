import { Query } from './indexes';
import { QueryFilter } from './query-filter';

/** Construct a query object to be used with Azure Search */
export class QueryBuilder {

  /** Apply Lucene-syntax escaping to the search string */
  static escape(search: string) {
    return search.replace(/(\+|-|\&\&|\|\||!|\(|\)|\{|\}|\[|\]|\^|\"|\~|\*|\?|\:|\\|\/)/g, '\\$1');
  }

  /** The current query value */
  readonly query: Query = {};

  /** Specifies whether to fetch the total count of results  */
  count(enabled = true) {
    this.query.count = enabled;
    return this;
  }

  /** A field to facet by (may be called multiple times for multiple fields) */
  facet(expression: string) {
    this.query.facets = this.query.facets || [];
    this.query.facets.push(expression);
    return this;
  }

  /** A structured search expression in standard OData syntax */
  filter(filter: string|QueryFilter) {
    this.query.filter = typeof filter === 'string'
      ? filter
      : filter.compile();
    return this;
  }

  /** Set fields used for hit highlighting */
  highlight(...fields: string[]) {
    this.query.highlight = fields.join(',');
    return this;
  }

  /**
   * Set string tags appended to hit highlights
   * @param pre tag before the highlight (default <em>)
   * @param post tag after the highlight (default </em>)
   */
  highlightTag(pre: string, post: string) {
    this.query.highlightPreTag = pre;
    this.query.highlightPostTag = post;
    return this;
  }

  /** A number between 0 and 100 indicating the percentage of the index that must be covered by a search query in order for the query to be reported as a success (default 100) */
  minimumCoverage(coverage: number) {
    this.query.minimumCoverage = coverage;
    return this;
  }

  /** Set ordering for a field (may be called multiple times for multiple fields) */
  orderbyAsc(field: string) {
    return this.orderby(field, 'asc');
  }

  /** Set ordering for a field (may be called multiple times for multiple fields) */
  orderbyDesc(field: string) {
    return this.orderby(field, 'desc');
  }

  /**
   * Add a scoring parameter
   * @param name parameter name
   * @param values parameter values (unescaped)
   */
  scoringParameter(name: string, ...values: string[]) {
    const valuesText = values.map((x) => `'${x.replace(`'`, `''`)}'`).join(',');
    this.query.scoringParameters = this.query.scoringParameters || [];
    this.query.scoringParameters.push(`${name}-${values}`);
    return this;
  }

  /**
   * The name of a scoring profile to evaluate match scores for matching documents in order to sort the results.
   */
  scoringProfile(profile: string) {
    this.query.scoringProfile = profile;
    return this;
  }

  /**
   * The text to search for
   */
  search(search: string) {
    this.query.search = search;
    return this;
  }

  /**
   * Field names to search for the specified text
   */
  searchFields(...fields: string[]) {
    this.query.searchFields = fields.join(',');
    return this;
  }

  /**
   * Specifies whether any or all of the search terms must be matched in order to count the document as a match (default any)
   */
  searchMode(mode: 'any' | 'all') {
    this.query.searchMode = mode;
    return this;
  }

  /**
   * Felds to include in the result set
   */
  select(...fields: string[]) {
    this.query.select = fields.join(',');
    return this;
  }

  /**
   * The number of search results to skip (max 100,000)
   */
  skip(skip: number) {
    this.query.skip = skip;
    return this;
  }

  /**
   * The number of search results to retrieve (default 50).
   * If you specify a value greater than 1000 and there are more than 1000 results, only the first 1000 results will be returned, along with a link to the next page of results.
   */
  top(top: number) {
    this.query.top = top;
    return this;
  }

  /**
   * When set to simple, search text is interpreted using a simple query language that allows for symbols such as +, * and "".
   * When the query type is set to full, search text is interpreted using the Lucene query language which allows field-specific and weighted searches.
   */
  queryType(type: 'simple' | 'full') {
    this.query.queryType = type;
    return this;
  }

  private orderby(field: string, dir: string) {
    this.query.orderby = this.query.orderby
      ? this.query.orderby + ','
      : '';
    this.query.orderby += `${field} ${dir}`;
    return this;
  }
}
