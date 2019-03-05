/**
@license
Copyright 2017 The Advanced REST client authors <arc@mulesoft.com>
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
import {ArcBaseModel} from './base-model.js';
/**
 * Model for variables
 *
 * Available events:
 *
 * - `environment-read` Read environment object
 * - `environment-updated` Change / add record
 * - `environment-deleted` Remove record
 * - `environment-list-variables` List variables for an environment
 * - `environment-list` List variables
 * - `variable-updated` - Add / update variable
 * - `variable-deleted` - Delete variable
 * - `destroy-model` - Delete model action
 *
 * Each event must be cancelable or it will be ignored.
 * The insert, change and delete events dispatches non cancelable update/delete
 * events. Application should listen for this events to update it's state.
 *
 * @polymer
 * @customElement
 * @memberof LogicElements
 */
export class VariablesModel extends ArcBaseModel {
  constructor() {
    super();
    this._envReadHandler = this._envReadHandler.bind(this);
    this._envUpdateHandler = this._envUpdateHandler.bind(this);
    this._envDeleteHandler = this._envDeleteHandler.bind(this);
    this._envListHandler = this._envListHandler.bind(this);
    this._varUpdateHandler = this._varUpdateHandler.bind(this);
    this._varDeleteHandler = this._varDeleteHandler.bind(this);
    this._varListHandler = this._varListHandler.bind(this);
  }

  _attachListeners(node) {
    node.addEventListener('environment-read', this._envReadHandler);
    node.addEventListener('environment-updated', this._envUpdateHandler);
    node.addEventListener('environment-deleted', this._envDeleteHandler);
    node.addEventListener('environment-list-variables', this._varListHandler);
    node.addEventListener('environment-list', this._envListHandler);
    node.addEventListener('variable-updated', this._varUpdateHandler);
    node.addEventListener('variable-deleted', this._varDeleteHandler);
    node.addEventListener('destroy-model', this._deleteModelHandler);
  }

  _detachListeners(node) {
    node.removeEventListener('environment-read', this._envReadHandler);
    node.removeEventListener('environment-updated', this._envUpdateHandler);
    node.removeEventListener('environment-deleted', this._envDeleteHandler);
    node.removeEventListener('environment-list-variables', this._varListHandler);
    node.removeEventListener('environment-list', this._envListHandler);
    node.removeEventListener('variable-updated', this._varUpdateHandler);
    node.removeEventListener('variable-deleted', this._varDeleteHandler);
    node.removeEventListener('destroy-model', this._deleteModelHandler);
  }

  /**
   * Handler to the environments database.
   *
   * @return {Object}
   */
  get environmentDb() {
    /* global PouchDB */
    return new PouchDB('variables-environments');
  }
  /**
   * Handler to the variables database.
   *
   * @return {Object}
   */
  get variableDb() {
    return new PouchDB('variables');
  }
  /**
   * Handler for `environment-read` custom event.
   * Reads environment onject info by it's name.
   * @param {CustomEvent} e
   */
  _envReadHandler(e) {
    if (this._eventCancelled(e)) {
      return;
    }
    this._cancelEvent(e);
    const {environment} = e.detail;
    e.detail.result = this.listEnvironments()
    .then((list) => {
      if (!list) {
        return;
      }
      return list.find((item) => item.name === environment);
    });
  }
  /**
   * A handler for the `environment-updated` custom event.
   * Updates the environment in the data store.
   *
   * The `environment-updated` custom event should be cancellable or the event
   * won't be handled at all.
   *
   @param {CustomEvent} e
   */
  _envUpdateHandler(e) {
    if (this._eventCancelled(e)) {
      return;
    }
    this._cancelEvent(e);
    e.detail.result = this.updateEnvironment(e.detail.value);
  }

  /**
   * Updates environment value.
   *
   * If the `value` doesn't contains the `_id` property a new environment is
   * created. The `_rev` property is always updated to the latest value.
   *
   * @param {Object} data A PouchDB object to be stored. It should contain the
   * `_id` property if the object is about to be updated. If the `_id` doesn't
   * exists a new object is created.
   * @return {Promise}
   */
  updateEnvironment(data) {
    if (!data.name) {
      const error = new Error('Can\'t create an environment without the name.');
      return Promise.reject(error);
    }
    if (!data.created) {
      data.created = Date.now();
    }
    if (data.created instanceof Date) {
      data.created = data.created.getTime();
    }
    let promise;
    let oldName;
    if (!data._id) {
      // creates new environment
      promise = Promise.resolve(data);
    } else {
      promise = this.environmentDb.get(data._id)
      .then((doc) => {
        if (data.name !== doc.name) {
          oldName = doc.name;
          doc.name = data.name;
        }
        data._rev = doc._rev;
        return data;
      })
      .catch((error) => {
        if (error.status === 404) {
          delete data._id;
          return data;
        }
        this._handleException(error);
      });
    }
    return promise
    .then((doc) => this.environmentDb[!!(doc._id) ? 'put' : 'post'](doc))
    .then((result) => {
      if (!result.ok) {
        this._handleException(result);
      }
      data._id = result.id;
      data._rev = result.rev;
      if (oldName) {
        return this.__updateEnvironmentName(oldName, data)
        .then(() => {
          this._fireUpdated('environment-updated', {
            value: Object.assign({}, data)
          });
          return data;
        });
      }
      this._fireUpdated('environment-updated', {
        value: Object.assign({}, data)
      });
      return data;
    })
    .catch((cause) => {
      this._handleException(cause);
      throw new Error(cause.message);
    });
  }
  /**
   * A special case when the name of the environment changes.
   * It updates any related to this environment variables.
   *
   * If this is current environment it also changes its name.
   *
   * @param {String} oldName Name of the environment befoe the change
   * @param {String} data Updated data store entry
   * @return {Promise}
   */
  __updateEnvironmentName(oldName, data) {
    return this.listVariables(oldName)
    .then((variables) => {
      if (!variables || !variables.length) {
        return;
      }
      variables.forEach((item) => item.environment = data.name);
      return this.variableDb.bulkDocs(variables);
    });
  }
  /**
   * A handler for the `environment-deleted` custom event.
   * Deletes a variable in the data store.
   *
   * The `environment-deleted` custom event should be cancellable or the event
   * won't be handled at all.
   *
   * The delete function fires non cancellable `environment-deleted` custom
   * event so the UI components can use it to update their values.
   *
   * @param {CustomEvent} e
   */
  _envDeleteHandler(e) {
    if (this._eventCancelled(e)) {
      return;
    }
    this._cancelEvent(e);
    e.detail.result = this.deleteEnvironment(e.detail.id);
  }
  /**
   * Deletes an environment from the data store.
   *
   * After updating the data store this method sends the `environment-deleted`
   * event that can't be cancelled so other managers that are present in the DOM
   * will not update the value again. If you don't need updated `_rev` you don't
   * have to listen for this event.
   *
   * Because this function changes the `environments` array the
   * `environments-list-changed` event is fired alongside the `environment-deleted`
   * event.
   *
   * @param {Object} id The PouchDB `_id` property of the object to delete.
   * @return {Promise}
   */
  deleteEnvironment(id) {
    if (!id) {
      const error = new Error('Can\'t delete an environment without its id');
      return Promise.reject(error);
    }
    let environment;
    const db = this.environmentDb;
    return db.get(id)
    .then((doc) => {
      environment = doc.name;
      return db.remove(doc);
    })
    .then((result) => {
      if (!result.ok) {
        this._handleException(result);
      }
      const detail = {
        id: result.id,
        rev: result.rev
      };
      return this._deleteEnvironmentVariables(environment)
      .then(() => detail);
    })
    .then((detail) => {
      this._fireUpdated('environment-deleted', detail);
      return detail;
    })
    .catch((error) => {
      if (error.status === 404) {
        return;
      }
      this._handleException(error);
    });
  }
  /**
   * To be called after the environment has been deleted. It clears variables
   * for the environment.
   *
   * @param {String} environment The environment name.
   * @return {Promise}
   */
  _deleteEnvironmentVariables(environment) {
    if (!environment) {
      return Promise.resolve();
    }
    environment = environment.toLowerCase();
    if (environment === 'default') {
      return Promise.resolve();
    }
    return this.listVariables(environment)
    .then((variables) => {
      // It is possible to not have a result here.
      if (!variables || !variables.length) {
        return;
      }
      variables.forEach((doc) => doc._deleted = true);
      return this.variableDb.bulkDocs(variables)
      .then((result) => {
        result.forEach((item) => {
          if (item.error) {
            this._handleException(item, true);
          }
        });
      });
    })
    // This will not fire `variable-deleted` event because it doesn't make
    // sense. UIs and managers should relay on `environment-deleted` event.
    .catch((error) => {
      this._handleException(error);
    });
  }
  /**
   * A handler for the `environment-list` custom event.
   * Adds a `value` propety of the event `detail` object with the array of the
   * user defined environments objects. Each item is a PouchDb data store item
   * (with `_id` and `_rev`).
   *
   * The `value` set on the details object can be undefined if the user haven't
   * defined any environments or if the manager haven't restored the list yet.
   * In the later case the event target element should listen for
   * `environments-list-changed` event to update the list of available environments.
   *
   * The `environment-current` custom event should be cancellable or the event
   * won't be handled at all.
   *
   * @param {CustomEvent} e
   */
  _envListHandler(e) {
    if (this._eventCancelled(e)) {
      return;
    }
    this._cancelEvent(e);
    e.detail.result = this.listEnvironments();
  }
  /**
   * Lists all user defined environments.
   *
   * @return {Promise} Resolved promise with the list of environments.
   */
  listEnvironments() {
    return this.environmentDb.allDocs({
      // jscs:disable
      include_docs: true
      // jscs:enable
    })
    .then((docs) => docs.rows.map((i) => i.doc));
  }
  /**
   * A handler for the `variable-list` custom event.
   *
   * Adds a `value` propety of the event `detail` object with the array of the
   * variables restored for current environment. Each item is a PouchDb data
   * store item (with `_id` and `_rev`).
   *
   * @param {CustomEvent} e
   */
  _varListHandler(e) {
    if (this._eventCancelled(e)) {
      return;
    }
    this._cancelEvent(e);
    e.detail.result = this.listVariables(e.detail.environment);
  }
  /**
   * Refreshes list of variables for the `environment`.
   *
   * @param {?String} environment Name of the environment to get the variables
   * from. If not set then `default` fill be used.
   * @return {Promise} Resolved promise with the list of variables for the
   * environment.
   */
  listVariables(environment) {
    environment = environment.toLowerCase();
    return this.variableDb.allDocs({
      // jscs:disable
      include_docs: true
      // jscs:enable
    })
    .then((docs) => {
      return docs.rows.filter((item) => {
        if (!item.doc.environment) {
          return false;
        }
        return item.doc.environment.toLowerCase() === environment;
      })
      .map((item) => item.doc);
    });
  }

  /**
   * A handler for the `variable-updated` custom event.
   * Updates the variable in the data store.
   *
   * The `variable-updated` custom event should be cancellable or the event
   * won't be handled at all.
   * @param {CustomEvent} e
   */
  _varUpdateHandler(e) {
    if (this._eventCancelled(e)) {
      return;
    }
    this._cancelEvent(e);
    e.detail.result = this.updateVariable(e.detail.value);
  }
  /**
   * Updates a variable value.
   *
   * If the `value` doesn't contains the `_id` property a new variable will
   * be created. The `_rev` property will be always updated to the latest value
   * so there's no need to set it on the object.
   *
   * After saving the data this method sends the `variable-updated` event that
   * can't be cancelled so other managers that are present in the DOM will not
   * update the value again.
   *
   * @param {Object} data A PouchDB object to be stored. It should contain the
   * `_id` property if the object is about to be updated. If the `_id` doesn't
   * exists a new object is created.
   * @return {Promise}
   */
  updateVariable(data) {
    if (!data.variable) {
      const m = 'Can\'t create a variable without the variable property';
      const error = new Error(m);
      return Promise.reject(error);
    }
    const db = this.variableDb;
    let promise;
    if (!data._id) {
      // creates new variable
      promise = Promise.resolve(data);
    } else {
      promise = db.get(data._id)
      .then(function(doc) {
        data._rev = doc._rev;
        return data;
      })
      .catch((error) => {
        if (error.status === 404) {
          return data;
        }
        this._handleException(error);
      });
    }
    return promise
    .then((doc) => db[doc._id ? 'put' : 'post'](doc))
    .then((result) => {
      if (!result.ok) {
        this._handleException(result);
      }
      data._id = result.id;
      data._rev = result.rev;
      this._fireUpdated('variable-updated', {
        value: Object.assign({}, data)
      });
      return data;
    });
  }

  /**
   * Deletes a variable from the data store.
   *
   * @param {Event} e Optional. If it is called from the event handler, this
   * is the event object. If initial validation fails then it will set `error`
   * property on the `detail` object.
   */
  _varDeleteHandler(e) {
    if (this._eventCancelled(e)) {
      return;
    }
    this._cancelEvent(e);
    e.detail.result = this.deleteVariable(e.detail.id);
  }

  /**
   * Deletes a variable from the data store.
   *
   * After updating the data store this method sends the `variable-deleted`
   * event that can't be cancelled so other managers that are present in the DOM
   * will not update the value again. If you don't need updated `_rev` you don't
   * have to listen for this event.
   *
   * Because this function changes the `variables` array the
   * `variables-list-changed` event is fired alongside the `variable-deleted`
   * event.
   *
   * @param {Object} id The PouchDB `_id` property of the object to delete.
   * @return {Promise}
   */
  deleteVariable(id) {
    if (!id) {
      const error = new Error('Can\'t delete a variable without its id');
      return Promise.reject(error);
    }
    const db = this.variableDb;
    return db.get(id)
    .then((doc) => db.remove(doc))
    .then((result) => {
      if (!result.ok) {
        this._handleException(result);
      }
      const detail = {
        id: result.id,
        rev: result.rev
      };
      this._fireUpdated('variable-deleted', detail);
      return detail;
    })
    .catch((error) => {
      if (error.status === 404) {
        return;
      }
      this._handleException(error);
    });
  }
  /**
   * Handler for `destroy-model` custom event.
   * Deletes saved or history data when scheduled for deletion.
   * @param {CustomEvent} e
   */
  _deleteModelHandler(e) {
    const models = e.detail.models;
    if (!models || !models.length) {
      return;
    }
    if (models.indexOf('variables') === -1) {
      return;
    }
    const p = [
      this._delVariablesModel(),
      this._delEnvironmentsModel(),
    ];
    if (!e.detail.result) {
      e.detail.result = [];
    }
    e.detail.result = e.detail.result.concat(p);
  }

  _delVariablesModel() {
    return this.variableDb.destroy()
    .then(() => this._notifyModelDestroyed('variables'));
  }

  _delEnvironmentsModel() {
    return this.environmentDb.destroy()
    .then(() => this._notifyModelDestroyed('variables-environments'));
  }
}
window.customElements.define('variables-model', VariablesModel);
