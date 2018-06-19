/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   base-model.html
 */

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../app-pouchdb/pouchdb.d.ts" />
/// <reference path="../events-target-behavior/events-target-behavior.d.ts" />

declare namespace LogicElements {

  /**
   * A base class for all models.
   */
  class ArcBaseModel extends
    ArcBehaviors.EventsTargetBehavior(
    Polymer.Element) {

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
     * @param e [description]
     * @returns [description]
     */
    _handleException(e: any): any;
  }
}

interface HTMLElementTagNameMap {
  "arc-base-model": LogicElements.ArcBaseModel;
}
