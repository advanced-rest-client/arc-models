/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   websocket-url-history-model.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="base-model.d.ts" />

declare namespace LogicElements {

  /**
   * Events based access to websockets URL history datastore.
   *
   * Note: **All events must be cancelable.** When the event is cancelled by an instance
   * of the element it won't be handled again by other instance that possibly exists
   * in the DOM.
   *
   * Cancellable event is a request to models for change. Non-cancellable event
   * is a notification for views to update their values.
   * For example `request-object-changed` event notifies model to update object in
   * the datastore if the event is cancelable and to update views if it's not
   * cancellable.
   *
   * Each handled event contains the `result` property on the `detail` object. It
   * contains a `Promise` object with a result of the operation. Also, for update / delete
   * events the same non-cancelable event is fired.
   *
   * Events handled by this element are cancelled and propagation of the event is
   * stopped.
   */
  class WebsocketUrlHistoryModel extends ArcBaseModel {

    /**
     * @param dbname Name of the data store
     * @param revsLimit Limit number of revisions on the data store.
     */
    constructor(dbname: String|null, revsLimit: Number|null);
    _attachListeners(node: any): void;
    _detachListeners(node: any): void;

    /**
     * Handles the read object event
     */
    _handleRead(e: any): void;
    _handleChange(e: any): void;

    /**
     * Updates / saves the object in the datastore.
     * This function fires `websocket-url-history-changed` event.
     *
     * @param obj A project to save / update
     * @returns Resolved promise to project object with updated `_rev`
     */
    update(obj: object|null): Promise<any>|null;
    _handleQueryHistory(e: any): void;
    _handleQuery(e: any): void;

    /**
     * Lists websocket history objects.
     *
     * @param query A partial url to match results.
     * @returns A promise resolved to a list of PouchDB documents.
     */
    list(query: String|null): Promise<any>|null;
    _sortFunction(a: any, b: any): any;

    /**
     * Computes time for timestamp's day, month and year and time set to 0.
     *
     * @param item Database entry item.
     * @returns The same database item with `_time` property.
     */
    _computeTime(item: object|null): object|null;
  }
}

interface HTMLElementTagNameMap {
  "websocket-url-history-model": LogicElements.WebsocketUrlHistoryModel;
}
