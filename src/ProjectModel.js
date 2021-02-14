/**
@license
Copyright 2016 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { v4 } from '@advanced-rest-client/uuid-generator';
import { RequestBaseModel } from './RequestBaseModel.js';
import { ArcModelEventTypes } from './events/ArcModelEventTypes.js';
import { ArcModelEvents } from './events/ArcModelEvents.js';
import { createChangeRecord } from './ArcBaseModel.js';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-continue */
/* eslint-disable no-plusplus */

/** @typedef {import('@advanced-rest-client/arc-types').Project.ARCProject} ARCProject */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.ARCSavedRequest} ARCSavedRequest */
/** @typedef {import('@advanced-rest-client/arc-types').ArcRequest.ARCHistoryRequest} ARCHistoryRequest */
/** @typedef {import('./events/ProjectEvents').ARCProjectReadEvent} ARCProjectReadEvent */
/** @typedef {import('./events/ProjectEvents').ARCProjectReadBulkEvent} ARCProjectReadBulkEvent */
/** @typedef {import('./events/ProjectEvents').ARCProjectUpdateEvent} ARCProjectUpdateEvent */
/** @typedef {import('./events/ProjectEvents').ARCProjectUpdateBulkEvent} ARCProjectUpdateBulkEvent */
/** @typedef {import('./events/ProjectEvents').ARCProjectDeleteEvent} ARCProjectDeleteEvent */
/** @typedef {import('./events/ProjectEvents').ARCProjectListEvent} ARCProjectListEvent */
/** @typedef {import('./events/ProjectEvents').ARCProjectListAllEvent} ARCProjectListAllEvent */
/** @typedef {import('./events/ProjectEvents').ARCProjectMoveEvent} ARCProjectMoveEvent */
/** @typedef {import('./types').ARCEntityChangeRecord} ARCEntityChangeRecord */
/** @typedef {import('./types').ARCModelListResult} ARCModelListResult */
/** @typedef {import('./types').ARCModelListOptions} ARCModelListOptions */
/** @typedef {import('./types').DeletedEntity} DeletedEntity */

export const readHandler = Symbol('readHandler');
export const readBulkHandler = Symbol('readBulkHandler');
export const updateHandler = Symbol('updateHandler');
export const updateBulkHandler = Symbol('updateBulkHandler');
export const deleteHandler = Symbol('deleteHandler');
export const listHandler = Symbol('listHandler');
export const listAllHandler = Symbol('listAllHandler');
export const moveToHandler = Symbol('moveToHandler');
export const addToHandler = Symbol('addToHandler');
export const removeFromHandler = Symbol('removeFromHandler');
export const normalizeProjects = Symbol('normalizeProjects');
export const processUpdateBulkResponse = Symbol('processUpdateBulkResponse');

/**
 * A model to access projects data in Advanced REST Client.
 * This component provides direct access to the data via the API
 * and Events API defined in events/ folder.
 */
export class ProjectModel extends RequestBaseModel {
  /**
   * @constructor
   */
  constructor() {
    super('legacy-projects');
    this[readHandler] = this[readHandler].bind(this);
    this[readBulkHandler] = this[readBulkHandler].bind(this);
    this[updateHandler] = this[updateHandler].bind(this);
    this[deleteHandler] = this[deleteHandler].bind(this);
    this[listHandler] = this[listHandler].bind(this);
    this[listAllHandler] = this[listAllHandler].bind(this);
    this[updateBulkHandler] = this[updateBulkHandler].bind(this);
    this[moveToHandler] = this[moveToHandler].bind(this);
    this[addToHandler] = this[addToHandler].bind(this);
    this[removeFromHandler] = this[removeFromHandler].bind(this);
  }

  /**
   * Paginate project entities
   *
   * @param {ARCModelListOptions=} opts Query options.
   * @return {Promise<ARCModelListResult>} A promise resolved to a list of projects.
   */
  async list(opts={}) {
    return this.listEntities(this.projectDb, opts);
  }

  /**
   * Lists all project entities.
   *
   * @param {string[]=} keys Project keys to read. When not set it reads all projects
   * @return {Promise<ARCProject[]>} A promise resolved to a list of projects.
   */
  async listAll(keys) {
    const opts = {
      include_docs: true,
    };
    if (Array.isArray(keys) && keys.length) {
      opts.keys = keys;
    }
    const response = await this.projectDb.allDocs(opts);
    let items = [];
    if (response && response.rows.length > 0) {
      items = response.rows.map((item) => item.doc);
    }
    return items;
  }

  /**
   * Updates or creates a project object.
   *
   * @param {ARCProject} project Project object to update.
   * @return {Promise<ARCEntityChangeRecord>}
   */
  async post(project) {
    if (!project) {
      throw new Error('The argument is missing');
    }
    const db = this.projectDb;
    let item = { ...project };
    if (item._id && !item._rev) {
      try {
        const doc = await db.get(item._id);
        item = { ...doc, ...item };
      } catch (e) {
        /* istanbul ignore if */
        if (e.status !== 404) {
          this._handleException(e);
          return undefined;
        }
      }
    } else if (!item._id) {
      item._id = v4();
    }
    return this.updateProject(item);
  }

  /**
   * Link to `#readProject()` for API consistency
   *
   * @param {string} id The ID of the datastore entry.
   * @param {string=} rev Specific revision to read. Defaults to the latest revision.
   * @returns {Promise<ARCProject>} Promise resolved to a datastore object.
   */
  async get(id, rev) {
    return this.readProject(id, rev);
  }

  /**
   * Bulk read a list of projects
   * @param {string[]} ids The list of ids to read.
   * @returns {Promise<ARCProject[]>} Read projects.
   */
  async getBulk(ids) {
    if (!Array.isArray(ids) || !ids.length) {
      throw new Error('The "ids" property is required');
    }
    const response = await this.projectDb.allDocs({
      keys: ids,
      include_docs: true,
    });
    const { rows } = response;
    const result = rows.map((item) => item.doc);
    return result;
  }

  /**
   * Link to `#removeProject()` for API consistency
   *
   * @param {string} id The ID of the datastore entry.
   * @return {Promise<DeletedEntity>} Promise resolved to a new `_rev` property of deleted object.
   */
  async delete(id) {
    return this.removeProject(id);
  }

  /**
   * Updates more than one project in a bulk request.
   * @param {ARCProject[]} projects List of requests to update.
   * @return {Promise<ARCEntityChangeRecord[]>}
   */
  async postBulk(projects) {
    if (!Array.isArray(projects) || !projects.length) {
      throw new Error('The "projects" property is required');
    }
    const items = this[normalizeProjects](projects);
    const response = await this.projectDb.bulkDocs(items);
    return this[processUpdateBulkResponse](items, response);
  }

  /**
   * Adds a request to a project.
   * @param {string} pid Project id
   * @param {string} rid Request id
   * @param {string} type Request type
   * @param {number=} position The index at which to add the request. Default to the last position
   * @returns {Promise<void>}
   */
  async addRequest(pid, rid, type, position) {
    const requestDb = this.getDatabase(type);
    const request = /** @type ARCHistoryRequest */ (await requestDb.get(rid));
    const isHistory = type === 'history';
    let copy = /** @type ARCSavedRequest */ (null);
    if (isHistory) {
      copy = this.historyToSaved(request);
    } else {
      copy = /** @type ARCSavedRequest */ (this.normalizeRequestWithTime(request));
    }

    // project has to be handled after the request to make sure it has the correct id
    const project = await this.readProject(pid);
    if (!project.requests) {
      project.requests = /** @type string[] */ ([]);
    }
    if (!project.requests.includes(copy._id)) {
      if (typeof position === 'number') {
        project.requests.splice(position, 0, copy._id);
      } else {
        project.requests.push(copy._id);
      }
      await this.updateProject(project);
    }
    
    const oldRev = copy._rev;
    if (!copy.projects) {
      copy.projects = /** @type string[] */ ([]);
    }
    if (!copy.projects.includes(pid)) {
      copy.projects.push(pid);
      const response = await this.savedDb.put(copy);
      const record = this[createChangeRecord](copy, response, oldRev);
      ArcModelEvents.Request.State.update(this, type, record);
    }
  }

  /**
   * Moves a request to a project.
   * @param {string} pid Target project id
   * @param {string} rid Request id
   * @param {string} type Request type
   * @param {number=} position The index at which to add the request. Default to the last position
   * @returns {Promise<void>}
   */
  async moveRequest(pid, rid, type, position) {
    const requestDb = this.getDatabase(type);
    const request = /** @type ARCSavedRequest */ (await requestDb.get(rid));
    const isHistory = type === 'history';
    let copy = /** @type ARCSavedRequest */ (null);
    if (isHistory) {
      copy = this.historyToSaved(request);
    } else {
      copy = /** @type ARCSavedRequest */ (this.normalizeRequestWithTime(request));
      await this.removeFromProjects(copy);
      copy.projects = undefined;
    }

    // project has to be handled after the request to make sure it has the correct id
    const project = await this.readProject(pid);
    if (!project.requests) {
      project.requests = /** @type string[] */ ([]);
    }
    if (!project.requests.includes(copy._id)) {
      if (typeof position === 'number') {
        project.requests.splice(position, 0, copy._id);
      } else {
        project.requests.push(copy._id);
      }
      await this.updateProject(project);
    }
    
    const oldRev = copy._rev;
    if (!copy.projects) {
      copy.projects = /** @type string[] */ ([]);
    }
    if (!copy.projects.includes(pid)) {
      copy.projects.push(pid);
      const response = await this.savedDb.put(copy);
      const record = this[createChangeRecord](copy, response, oldRev);
      ArcModelEvents.Request.State.update(this, type, record);
    }
  }

  /**
   * Removes request from a project
   * @param {string} pid Project id
   * @param {string} rid Request id
   * @returns {Promise<void>}
   */
  async removeRequest(pid, rid) {
    const project = await this.readProject(pid);
    if (!project.requests) {
      project.requests = /** @type string[] */ ([]);
    }
    const request = /** @type ARCSavedRequest */ (await this.savedDb.get(rid));
    if (!request.projects) {
      request.projects = /** @type string[] */ ([]);
    }
    if (request.projects.includes(pid)) {
      const index = request.projects.indexOf(pid);
      request.projects.splice(index, 1);
      const oldRev = request._id;
      const copy = /** @type ARCSavedRequest */ (this.normalizeRequestWithTime(request));
      const response = await this.savedDb.put(copy);
      const record = this[createChangeRecord](copy, response, oldRev);
      ArcModelEvents.Request.State.update(this, 'saved', record);
    }
    if (project.requests.includes(rid)) {
      const index = project.requests.indexOf(pid);
      project.requests.splice(index, 1);
      await this.updateProject(project);
    }
  }

  /**
   * @param {EventTarget} node
   */
  _attachListeners(node) {
    super._attachListeners(node);
    node.addEventListener(ArcModelEventTypes.Project.read, this[readHandler]);
    node.addEventListener(ArcModelEventTypes.Project.readBulk, this[readBulkHandler]);
    node.addEventListener(ArcModelEventTypes.Project.update, this[updateHandler]);
    node.addEventListener(ArcModelEventTypes.Project.updateBulk, this[updateBulkHandler]);
    node.addEventListener(ArcModelEventTypes.Project.delete, this[deleteHandler]);
    node.addEventListener(ArcModelEventTypes.Project.list, this[listHandler]);
    node.addEventListener(ArcModelEventTypes.Project.listAll, this[listAllHandler]);
    node.addEventListener(ArcModelEventTypes.Project.moveTo, this[moveToHandler]);
    node.addEventListener(ArcModelEventTypes.Project.addTo, this[addToHandler]);
    node.addEventListener(ArcModelEventTypes.Project.removeFrom, this[removeFromHandler]);
  }

  /**
   * @param {EventTarget} node
   */
  _detachListeners(node) {
    super._detachListeners(node);
    node.removeEventListener(ArcModelEventTypes.Project.read, this[readHandler]);
    node.removeEventListener(ArcModelEventTypes.Project.readBulk, this[readBulkHandler]);
    node.removeEventListener(ArcModelEventTypes.Project.update, this[updateHandler]);
    node.removeEventListener(ArcModelEventTypes.Project.updateBulk, this[updateBulkHandler]);
    node.removeEventListener(ArcModelEventTypes.Project.delete, this[deleteHandler]);
    node.removeEventListener(ArcModelEventTypes.Project.list, this[listHandler]);
    node.removeEventListener(ArcModelEventTypes.Project.listAll, this[listAllHandler]);
    node.removeEventListener(ArcModelEventTypes.Project.moveTo, this[moveToHandler]);
    node.removeEventListener(ArcModelEventTypes.Project.addTo, this[addToHandler]);
    node.removeEventListener(ArcModelEventTypes.Project.removeFrom, this[removeFromHandler]);
  }

  /**
   * Handler for project read event request.
   * @param {ARCProjectReadEvent} e
   */
  [readHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const { id, rev } = e;
    e.detail.result = this.readProject(id, rev);
  }

  /**
   * Handler for project bulk read event.
   * @param {ARCProjectReadBulkEvent} e
   */
  [readBulkHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const { ids } = e;
    e.detail.result = this.getBulk(ids);
  }

  /**
   * Handles project save / update
   * @param {ARCProjectUpdateEvent} e
   */
  [updateHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const { project } = e;
    e.detail.result = this.post(project);
  }

  /**
   * Handler for `project-update-bulk` custom event.
   * @param {ARCProjectUpdateBulkEvent} e
   */
  [updateBulkHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const { projects } = e;
    e.detail.result = this.postBulk(projects);
  }

  /**
   * Normalizes projects list to common model.
   * It updates `updated` property to current time.
   * If an item is not an object then it is removed.
   *
   * @param {ARCProject[]} projects List of projects.
   * @return {ARCProject[]}
   */
  [normalizeProjects](projects) {
    const items = [...projects];
    for (let i = items.length - 1; i >= 0; i--) {
      let item = items[i];
      if (!item || typeof item !== 'object') {
        items.splice(i, 1);
        continue;
      }
      item = {
        order: 0,
        requests: [],
        ...item,
      };
      item.updated = Date.now();
      if (!item.created) {
        item.created = item.updated;
      }
      items[i] = item;
    }
    return items;
  }

  /**
   * Processes datastore response after calling `updateBulk()` function.
   * @param {ARCProject[]} projects List of requests to update.
   * @param {Array<PouchDB.Core.Response|PouchDB.Core.Error>} responses PouchDB response
   * @return {ARCEntityChangeRecord[]} List of projects with updated `_id` and `_rew`
   */
  [processUpdateBulkResponse](projects, responses) {
    const result = /** @type ARCEntityChangeRecord[] */ ([]);
    for (let i = 0, len = responses.length; i < len; i++) {
      const response = responses[i];
      const project = { ...projects[i] };
      const typedError = /** @type PouchDB.Core.Error */ (response);
      /* istanbul ignore if */
      if (typedError.error) {
        this._handleException(typedError, true);
        continue;
      }
      const oldRev = project._rev;
      project._rev = response.rev;
      /* istanbul ignore if */
      if (!project._id) {
        project._id = response.id;
      }
      const record = /** @type ARCEntityChangeRecord */ ({
        id: project._id,
        rev: response.rev,
        item: project,
      });
      if (oldRev) {
        record.oldRev = oldRev;
      }
      result.push(record);
      ArcModelEvents.Project.State.update(this, record);
    }
    return result;
  }

  /**
   * Removes a project from the data store.
   *
   * @param {ARCProjectDeleteEvent} e
   */
  [deleteHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const { id } = e;
    e.detail.result = this.removeProject(id);
  }

  /**
   * Queries for a list of projects in pagination
   * @param {ARCProjectListEvent} e
   */
  [listHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const { limit, nextPageToken } = e;
    e.detail.result = this.list({
      limit,
      nextPageToken,
    });
  }

  /**
   * List all projects.
   * @param {ARCProjectListAllEvent} e
   */
  [listAllHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const { keys } = e;
    e.detail.result = this.listAll(keys);
  }

  /** 
   * @param {ARCProjectMoveEvent} e
   */
  [moveToHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const { projectId, requestId, requestType, position } = e;
    e.detail.result = this.moveRequest(projectId, requestId, requestType, position);
  }

  /** 
   * @param {ARCProjectMoveEvent} e
   */
  [addToHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const { projectId, requestId, requestType, position } = e;
    e.detail.result = this.addRequest(projectId, requestId, requestType, position);
  }

  /** 
   * @param {ARCProjectMoveEvent} e
   */
  [removeFromHandler](e) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const { projectId, requestId } = e;
    e.detail.result = this.removeRequest(projectId, requestId);
  }
}
