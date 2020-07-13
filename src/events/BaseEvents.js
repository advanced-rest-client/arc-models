/* eslint-disable max-classes-per-file */

import { ArcModelEventTypes } from './ArcModelEventTypes.js';

export const idValue = Symbol('idValue');
export const revisionValue = Symbol('revisionValue');
export const limitValue = Symbol('limitValue');
export const nextPageTokenValue = Symbol('nextPageTokenValue');
export const storesValue = Symbol('storesValue');

/** @typedef {import('../types').ARCModelListOptions} ARCModelListOptions */

/**
 * An event dispatched by the store after deleting an entity.
 * Chect the event type to learn which type of an entity was deleted.
 */
export class ARCEntityDeletedEvent extends Event {
  /**
   * @param {string} type The event type
   * @param {string} id Entity id
   * @param {string} rev Entity updated revision id
   */
  constructor(type, id, rev) {
    super(type, {
      bubbles: true,
      composed: true,
    });
    this[idValue] = id;
    this[revisionValue] = rev;
  }

  /**
   * @return {string} The id of the deleted entity
   */
  get id() {
    return this[idValue];
  }

  /**
   * @return {string} New revision id.
   */
  get rev() {
    return this[revisionValue];
  }
}

/**
 * A base class for data store query events.
 */
export class ARCEntityListEvent extends CustomEvent {
  /**
   * @return {number|null} The number of results per the page.
   */
  get limit() {
    return this[limitValue];
  }

  /**
   * @return {string|null} A string that should be used with pagination.
   */
  get nextPageToken() {
    return this[nextPageTokenValue];
  }

  /**
   * @param {string} type The event type
   * @param {ARCModelListOptions=} [opts={}] Query options.
   */
  constructor(type, opts={}) {
    super(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {},
    });

    this[limitValue] = opts.limit;
    this[nextPageTokenValue] = opts.nextPageToken;
  }
}

/**
 * An event to be dispatched by the UI to destroy all data in a data
 * store.
 */
export class ARCModelDeleteEvent extends CustomEvent {
  /**
   * @param {string[]} stores A list of store names to delete the data from
   */
  constructor(stores) {
    super(ArcModelEventTypes.destroy, {
      bubbles: true,
      composed: true,
      detail: {},
    });
    this[storesValue] = stores;
  }

  /**
   * @return {string[]} The list of stores used to initialize the event.
   */
  get stores() {
    return this[storesValue];
  }
}

/**
 * An event dispatched by the data store to inform the application that a data model
 * has been destroyed.
 */
export class ARCModelStateDeleteEvent extends Event {
  /**
   * @param {string[]} stores A list of store names that has been destroyed.
   */
  constructor(stores) {
    super(ArcModelEventTypes.destroyed, {
      bubbles: true,
      composed: true,
    });
    this[storesValue] = stores;
  }

  /**
   * @return {string[]} The list of deleted stores used to initialize the event.
   */
  get stores() {
    return this[storesValue];
  }
}
