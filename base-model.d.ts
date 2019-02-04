/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   base-model.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../uuid-generator/uuid-generator.d.ts" />
/// <reference path="../events-target-behavior/events-target-behavior.d.ts" />

/**
 * A base class for all models.
 */
declare class ArcBaseModel extends
  ArcBehaviors.EventsTargetBehavior(
  Object) {

  /**
   * Note, the element does not include PouchDB to the document!
   */
  readonly db: PouchDB|null;

  /**
   * Useful to generate uuid string.
   * Use it as `this.uuid.generate()`.
   */
  readonly uuid: Element|null;

  /**
   * @param dbname Name of the data store
   * @param revsLimit Limit number of revisions on the data store.
   */
  constructor(dbname: String|null, revsLimit: Number|null);
  disconnectedCallback(): void;
  _attachListeners(node: any): void;
  _detachListeners(node: any): void;

  /**
   * Reads an entry from the datastore.
   *
   * @param id The ID of the datastore entry.
   * @param rev Specific revision to read. Defaults to latest revision.
   * @returns Promise resolved to a datastore object.
   */
  read(id: String|null, rev: String|null): Promise<any>|null;

  /**
   * Computes past mindnight for given timestamp.
   *
   * @param time Timestamp
   * @returns Time reduced to midnight.
   */
  _computeMidnight(time: Number|null): Number|null;

  /**
   * Dispatches non-cancelable change event.
   *
   * @param type Event type
   * @param detail A detail object to dispatch.
   * @returns Created and dispatched event.
   */
  _fireUpdated(type: String|null, detail: object|null): CustomEvent|null;

  /**
   * Handles any exception in the model in a unified way.
   *
   * @param e An error object
   * @param noThrow If set the function will not throw error.
   * This allow to do the logic without stopping program.
   */
  _handleException(e: Error|object|null, noThrow: Boolean|null): void;

  /**
   * Deletes current datastore.
   * Note that `name` property must be set before calling this function.
   */
  deleteModel(): Promise<any>|null;

  /**
   * Notifies the application that the model has been removed and data sestroyed.
   *
   * @param type Database name.
   * @returns Dispatched event
   */
  _notifyModelDestroyed(type: String|null): CustomEvent|null;

  /**
   * Handler for `destroy-model` custom event.
   * Deletes current data when scheduled for deletion.
   */
  _deleteModelHandler(e: CustomEvent|null): void;

  /**
   * Checks if event can be processed giving it's cancelation status or if
   * it was dispatched by current element.
   *
   * @param e Event to test
   * @returns True if event is already cancelled or dispatched by self.
   */
  _eventCancelled(e: Event|CustomEvent|null): Boolean|null;

  /**
   * Helper method to cancel the event and stop it's propagation.
   *
   * @param e Event to cancel
   */
  _cancelEvent(e: Event|CustomEvent|null): void;
}