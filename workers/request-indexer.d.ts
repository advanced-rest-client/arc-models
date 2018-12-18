/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   workers/request-indexer.js
 */

/**
 * A web worker responsible for indexing request data.
 *
 * Most request properties are indexed using PouchDB search plugin.
 * The problem is with the `url`. The plugin can't search for parts of the words
 * (like the url) and therefore the user would have to search for full URL.
 * This indexer splits request url into parts and indexes them separately.
 * Then the search logic can separately use PouchDB search for searching for
 * and request data and separate logic for querying for url data only.
 */
declare class RequestIndexer {

  /**
   * Listens for message event.
   */
  listen(): void;

  /**
   * A function handling a message from the main thread.
   */
  _messageHandler(e: Event|null): void;

  /**
   * Notifies owner about end of task.
   *
   * @param task Task name
   */
  notifyEnd(task: String|null): void;

  /**
   * Notifies owner about error
   */
  notifyError(cause: Error|null): void;

  /**
   * Indexes request data in dedicated index store for requests.
   *
   * @param requests List of requests to index.
   */
  _indexRequests(requests: any[]|null): Promise<any>|null;

  /**
   * Removes indexed data for given requests.
   *
   * @param ids List of request ids to remove.
   */
  _deleteIndexedData(ids: Array<String|null>|null): Promise<any>|null;

  /**
   * Retreives existing index data for the request.
   *
   * @param db Database reference
   * @param requestId Request ID.
   */
  _getIndexedData(db: object|null, requestId: String|null): Promise<Array<object|null>|null>;

  /**
   * Prepares a list of objects to put into the indexeddb to index the request.
   *
   * @param request Request object with `id` and `url` properties
   * @param indexed List of already indexed properties
   * @returns A list of objects to store
   */
  _prepareRequestIndexData(request: object|null, indexed: Array<object|null>|null): Array<object|null>|null;

  /**
   * Generates ID for URL index object
   *
   * @param url URL to search for. It should be lower case
   * @param type Request type
   */
  _generateId(url: String|null, type: String|null): String|null;

  /**
   * Creates an index datastore object if it doesn't exists in the list
   * of indexed items.
   *
   * @param url URL to search for.
   * @param id Request ID
   * @param type Request type
   * @param indexed Already indexed data.
   * @returns Index object to store.
   */
  _createIndexIfMissing(url: String|null, id: String|null, type: String|null, indexed: Array<object|null>|null): object|null;

  /**
   * Creates an index object for the whole url, if it doesn't exists in already
   * indexed data.
   *
   * @param request The request object to index
   * @param indexed Already indexed data.
   * @returns Object to store or `undefined` if the object
   * already exists.
   */
  _getUrlObject(request: object|null, indexed: Array<object|null>|null): object|null|undefined;

  /**
   * Creates an index object for authority part of the url,
   * if it doesn't exists in already indexed data.
   *
   * @param parser Instance of URL object
   * @param id Request ID
   * @param type Request type
   * @param indexed Already indexed data.
   * @returns Object to store or `undefined` if the object
   * already exists.
   */
  _getAuthorityPath(parser: URL|null, id: String|null, type: String|null, indexed: Array<object|null>|null): object|null|undefined;

  /**
   * Creates an index object for path part of the url,
   * if it doesn't exists in already indexed data.
   *
   * @param parser Instance of URL object
   * @param id Request ID
   * @param type Request type
   * @param indexed Already indexed data.
   * @returns Object to store or `undefined` if the object
   * already exists.
   */
  _getPathQuery(parser: URL|null, id: String|null, type: String|null, indexed: Array<object|null>|null): object|null|undefined;

  /**
   * Creates an index object for query string of the url,
   * if it doesn't exists in already indexed data.
   *
   * @param parser Instance of URL object
   * @param id Request ID
   * @param type Request type
   * @param indexed Already indexed data.
   * @returns Object to store or `undefined` if the object
   * already exists.
   */
  _getQueryString(parser: URL|null, id: String|null, type: String|null, indexed: Array<object|null>|null): object|null|undefined;

  /**
   * Creates an index object for each query parameter of the url,
   * if it doesn't exists in already indexed data.
   *
   * @param parser Instance of URL object
   * @param id Request ID
   * @param type Request type
   * @param indexed Already indexed data.
   * @param target A list where to put generated data
   */
  _appendQueryParams(parser: URL|null, id: String|null, type: String|null, indexed: Array<object|null>|null, target: Array<object|null>|null): void;

  /**
   * Stores indexes in the data store.
   *
   * @param indexes List of indexes to store.
   * @returns window
   */
  _storeIndexes(db: object|null, indexes: Array<object|null>|null): Promise<any>|null;

  /**
   * Removes indexed items that are no longer relevant for the request.
   *
   * @param items List of datastore index items.
   */
  _removeRedundantIndexes(db: object|null, items: Array<object|null>|null): Promise<any>|null;

  /**
   * Queries for indexed data
   *
   * @param id An ID returned to the calling application
   * @param query The query
   * @param opts Search options:
   * - type (string: saved || history): Request type
   * - detailed (Booelan): If set it uses slower algorithm but performs full
   * search on the index. When false it only uses filer like query + '*'.
   */
  _queryIndex(id: String|null, query: String|null, opts: object|null): Promise<any>|null;

  /**
   * Performance search on the data store using `indexOf` on the primary key.
   * This function is slower than `_searchCasing` but much, much faster than
   * other ways to search for this data.
   * It allows to perform a search on the part of the url only like:
   * `'*' + q + '*'` while `_searchCasing` only allows `q + '*'` type search.
   *
   * @param db Reference to the database
   * @param q A string to search for
   * @param type A type of the request to include into results.
   */
  _searchIndexOf(db: object|null, q: String|null, type: String|null): Promise<any>|null;

  /**
   * Uses (in most parts) algorithm described at
   * https://www.codeproject.com/Articles/744986/How-to-do-some-magic-with-indexedDB
   * Distributed under Apache 2 license
   *
   * This is much faster than `_searchIndexOf` function. However may not find
   * some results. For ARC it's a default search function.
   *
   * @param db Reference to the database
   * @param q A string to search for
   * @param type A type of the request to include into results.
   */
  _searchCasing(db: object|null, q: String|null, type: String|null): Promise<any>|null;

  /**
   * https://www.codeproject.com/Articles/744986/How-to-do-some-magic-with-indexedDB
   * Distributed under Apache 2 license
   *
   * @param key [description]
   * @param lowerKey [description]
   * @param upperNeedle [description]
   * @param lowerNeedle [description]
   */
  _nextCasing(key: String|null, lowerKey: String|null, upperNeedle: String|null, lowerNeedle: String|null): String|null|undefined;

  /**
   * Removes all indexed data.
   */
  _clearIndexedData(): Promise<any>|null;
}
