/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   request-base-model.html
 */

/// <reference path="base-model.d.ts" />

/**
 * A base class for Request and Projects` models.
 */
declare class RequestBaseModel {
  readonly savedDb: any;
  readonly historyDb: any;
  readonly projectDb: PouchDB|null;

  /**
   * Deletes database data by tye.
   *
   * @param type Either `saved-requests` or `history-requests`
   */
  deleteModel(type: String|null): Promise<any>|null;

  /**
   * Returns a reference to a PouchDB database instance for given type.
   *
   * @param type Either `saved-requests` or `history-requests`
   * @returns PouchDB instance for the datastore.
   */
  getDatabase(type: String|null): PouchDB|null;

  /**
   * Reads an entry from the datastore.
   *
   * @param id The ID of the datastore entry.
   * @param rev Specific revision to read. Defaults to latest
   * revision.
   * @returns Promise resolved to a datastore object.
   */
  readProject(id: String|null, rev: String|null): Promise<any>|null;

  /**
   * Updates / saves a project object in the datastore.
   * This function fires `project-object-changed` event.
   *
   * @param project A project to save / update
   * @returns Resolved promise to project object with updated `_rev`
   */
  updateProject(project: object|null): Promise<any>|null;

  /**
   * Removed an object from the datastore.
   * This function fires `project-object-deleted` event.
   *
   * @param id The ID of the datastore entry.
   * @param rev Specific revision to read. Defaults to latest revision.
   * @returns Promise resolved to a new `_rev` property of deleted object.
   */
  removeProject(id: String|null, rev: String|null): Promise<any>|null;
}
