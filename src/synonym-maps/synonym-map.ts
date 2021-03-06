import { SynonymMaps } from ".";
import { SearchRequester } from "../search-requester";
import { ISearchResource, SearchResource } from "../search-resource";
import { SynonymMapSchema } from "./types";

export { SynonymMapSchema };

export interface ISynonymMap extends ISearchResource<SynonymMapSchema> {
}

/**
 * Manage an Azure Search synonym map resource
 */
export class SynonymMap extends SearchResource<SynonymMapSchema> implements ISynonymMap {

  /**
   * Manage an Azure Search synonym map resource
   * @param requester http handler
   * @param type must be 'synonymmaps'
   * @param name name of the current synonym map
   */
  constructor(requester: SearchRequester, type: string, name: string) {
    super(requester, type, name);
  }
}
