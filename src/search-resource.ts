import { SearchRequester } from './search-requester';
import { AzureSearchResponse, OptionsOrCallback, SearchCallback, SearchOptions, SearchRequest } from './types';

export interface ISearchResource<T> {

  /**
   * Get the current schema
   * @param options optional request options
   */
  get(options?: SearchOptions): Promise<AzureSearchResponse<T>>;
  get(callback: SearchCallback<T>): void;
  get(options: SearchOptions, callback: SearchCallback<T>): void;

  /**
   * Delete this resource
   * @param options optional request options
   */
  delete(options?: SearchOptions): Promise<AzureSearchResponse<void>>;
  delete(callback: SearchCallback<void>): void;
  delete(options: SearchOptions, callback: SearchCallback<void>): void;
}

/**
 * Base class for search resources
 */
export abstract class SearchResource<T> implements ISearchResource<T> {

  /**
   * Create new instance of the search resource
   * @param requester http handler
   * @param type the type of resource (should match /{resource}/ in the REST url path)
   * @param name the name of the current resource (should match /{resource}/{name} in the REST url path)
   */
  constructor(private requester: SearchRequester, private type: string, public name: string) { }

  get(optionsOrCallback?: OptionsOrCallback<T>, callback?: SearchCallback<T>) {
    return this.request<T>({
      method: 'get',
      path: '/',
    }, optionsOrCallback, callback);
  }

  delete(optionsOrCallback?: OptionsOrCallback<void>, callback?: SearchCallback<void>) {
    return this.request<void>({
      method: 'delete',
      path: '/',
    }, optionsOrCallback, callback);
  }

  protected request<T>(req: SearchRequest<T>, optionsOrCallback?: OptionsOrCallback<T>, callback?: SearchCallback<T>) {
    req.path = `/${this.type}/${this.name}${req.path}`;
    return this.requester.request<T>(req, optionsOrCallback, callback);
  }
}
