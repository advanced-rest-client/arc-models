/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   auth-data-model.html
 */

/// <reference path="base-model.d.ts" />

declare namespace LogicElements {

  /**
   * Model for host rules.
   */
  class AuthDataModel extends Polymer.Element {
    _attachListeners(node: any): void;
    _detachListeners(node: any): void;
    _queryHandler(e: any): void;

    /**
     * Queries for a datastore entry. Similar to `read()` but without using `id`
     * but rather the URL.
     *
     * @param url The URL of the request
     * @param authMethod The Authorization method to restore data for.
     */
    query(url: String|null, authMethod: String|null): Promise<any>|null;
    _updateHandler(e: any): void;

    /**
     * Creates or updates the auth data in the data store for given method and URl.
     *
     * @param url The URL of the request
     * @param authMethod The Authorization method to restore data for.
     * @param authData The authorization data to store. Schema depends on
     * the `authMethod` property. From model standpoint schema does not matter.
     */
    update(url: String|null, authMethod: String|null, authData: object|null): Promise<any>|null;

    /**
     * Removes query parameters and the fragment part from the URL
     *
     * @param url URL to process
     * @returns Canonical URL.
     */
    _normalizeUrl(url: String|null): String|null;

    /**
     * Computes the database key for auth data
     *
     * @param method The Authorization method to restore data for.
     * @param url The URL of the request
     * @returns Datastore key for auth data
     */
    _computeKey(method: String|null, url: String|null): String|null;
  }
}

interface HTMLElementTagNameMap {
  "auth-data-model": LogicElements.AuthDataModel;
}
