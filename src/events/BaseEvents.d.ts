import { ARCEntityChangeRecord, ARCModelListResultDetail, ARCModelListOptions, DeletedEntity } from '../types';
/**
 * Detail definition for a read event.
 */
export declare interface ARCModelReadEventDetail<T> {
  /**
   * This property is set by the models, a promise resolved to the
   * requested object.
   */
  result?: Promise<T>|null;
}

/**
 * Detail definition for a read event.
 */
export declare interface ARCModelReadBulkEventDetail<T> {
  /**
   * The list of ids of the entities to read.
   */
  ids: string[];
  /**
   * This property is set by the models, a promise resolved to the
   * list of requested object.
   */
  result?: Promise<T[]>|null;
}

/**
 * Detail definition for an object create/update event.
 */
export declare interface ARCModelUpdateEventDetail<T> {
  /**
   * This property is set by the store, a promise resolved when a transaction finish.
   * The value if the same as the value of the change state event.
   */
  result?: Promise<ARCEntityChangeRecord<T>>;
}

/**
 * Detail definition for a bulk object create/update event.
 */
export declare interface ARCModelUpdateBulkEventDetail<T> {
  /**
   * This property is set by the store, a promise resolved when the transaction finish.
   */
  result?: Promise<ARCEntityChangeRecord<T>[]>;
}

/**
 * Detail definition for an entity delete event.
 */
export declare interface ARCModelDeleteEventDetail {
  /**
   * This property is set by the data store, a promise resolved to the
   * new revision of an entity.
   */
  result?: Promise<DeletedEntity>|null;
}

/**
 * Detail definition for an event that has no side results
 */
export declare interface ARCModelDestroyEventDetail {
  /**
   * This property is set by the data store, a promise resolved when operation finish.
   */
  result?: Promise<void>[]|null;
}

/**
 * Detail definition for an entity delete event.
 */
export declare interface ARCModelDeleteBulkEventDetail {
  /**
   * This property is set by the data store, a promise resolved to the
   * object containing the id of the deleted item and updated revision.
   */
  result?: Promise<DeletedEntity[]>|null;
}

export declare class ARCEntityDeletedEvent extends Event {
  /**
   * The id of the deleted entity
   */
  readonly id: string;
  /**
   * New revision id.
   */
  readonly rev: string;
  /**
   * @param type The event type
   * @param id Entity id
   * @param rev Entity updated revision id
   */
  constructor(type: string, id: string, rev: string);
}

export declare class ARCEntityListEvent<T> extends CustomEvent<ARCModelListResultDetail<T>> {
  /**
   * The number of results per the page.
   */
  readonly limit?: number|null;
  /**
   * A string that should be used with pagination.
   */
  readonly nextPageToken?: string|null;

  /**
   * @param type The event type
   * @param opts Query options.
   */
  constructor(type: string, opts?: ARCModelListOptions);
}

/**
 * An event to be dispatched by the UI to destroy all data in a data
 * store.
 */
export class ARCModelDeleteEvent extends CustomEvent<ARCModelDestroyEventDetail> {
  /**
   * The list of stores used to initialize the event.
   */
  readonly stores: string[]
  /**
   * @param stores A list of store names to delete the data from
   */
  constructor(stores: string[]);
}

/**
 * An event dispatched by the data store to inform the application that a data model
 * has been destroyed.
 */
export class ARCModelStateDeleteEvent extends Event {
  /**
   * @return {string[]} The list of deleted stores used to initialize the event.
   */
  readonly stores: string[];
  /**
   * @param stores A list of store names that has been destroyed.
   */
  constructor(stores: string[]);
}
