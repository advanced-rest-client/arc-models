/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   host-rules-model.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="base-model.d.ts" />

declare namespace LogicElements {

  /**
   * Model for host rules.
   *
   * Available events:
   *
   * - `host-rules-insert` Bulk add hosts
   * - `host-rules-changed` Change / add record
   * - `host-rules-deleted` Remove record
   * - `host-rules-list` Lists all rules
   * - `host-rules-clear` Clears hosts datastore
   *
   * Each event must be cancelable or it will be ignored.
   * The insert, change and delete events dispatches non cancelable update/delete
   * events. Application should listen for this events to update it's state.
   */
  class HostRulesModel extends ArcBaseModel {

    /**
     * @param dbname Name of the data store
     * @param revsLimit Limit number of revisions on the data store.
     */
    constructor(dbname: String|null, revsLimit: Number|null);
    _attachListeners(node: any): void;
    _detachListeners(node: any): void;

    /**
     * Updates / saves the host rule object in the datastore.
     * This function fires `host-rules-changed` event.
     *
     * @param rule A rule object to save / update
     * @returns Resolved promise to updated object with updated `_rev`
     */
    update(rule: object|null): Promise<any>|null;

    /**
     * Updates / saves the host rule object in the datastore.
     * This function fires `host-rules-changed` event.
     *
     * @param rules List of rules to save / update
     * @returns Resolved promise to the result of Pouch DB operation
     */
    updateBulk(rules: Array<object|null>|null): Promise<any>|null;

    /**
     * Removed an object from the datastore.
     * This function fires `host-rules-deleted` event.
     *
     * @param id The ID of the datastore entry.
     * @param rev Specific revision to read. Defaults to latest revision.
     * @returns Promise resolved to a new `_rev` property of deleted object.
     */
    remove(id: String|null, rev: String|null): Promise<any>|null;

    /**
     * Lists all existing host rules
     *
     * @returns Promise resolved to list of the host rules
     */
    list(): Promise<any>|null;

    /**
     * Handler for `host-rules-insert` custom event. Creates rules in bulk.
     * It sets `result` property on event detail object with a result of calling
     * `updateBulk()` function.
     */
    _insertHandler(e: CustomEvent|null): void;
    _updatedHandler(e: any): void;
    _deletedHandler(e: any): void;
    _listHandler(e: any): void;
    _clearHandler(e: any): void;
  }
}

interface HTMLElementTagNameMap {
  "host-rules-model": LogicElements.HostRulesModel;
}