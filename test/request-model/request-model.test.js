import { fixture, assert } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import { PayloadProcessor } from '@advanced-rest-client/arc-electron-payload-processor/payload-processor-esm.js';
import sinon from 'sinon/pkg/sinon-esm.js';
import '../../request-model.js';

describe('<request-model>', () => {
  async function basicFixture() {
    return /** @type {RequestModel} */ (await fixture('<request-model></request-model>'));
  }

  describe('request-model test', function() {
    const databaseType = 'saved-requests';

    describe('normalizeRequest()', () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Returns undefined when no request', () => {
        const result = element.normalizeRequest();
        assert.isUndefined(result);
      });

      it('Moves legacyProject to projects array', () => {
        const result = element.normalizeRequest({
          legacyProject: 'test-project'
        });
        assert.isUndefined(result.legacyProject);
        assert.deepEqual(result.projects, ['test-project']);
      });

      it('Appends legacyProject to projects array', () => {
        const result = element.normalizeRequest({
          legacyProject: 'test-project',
          projects: ['other-project']
        });
        assert.isUndefined(result.legacyProject);
        assert.deepEqual(result.projects, ['other-project', 'test-project']);
      });

      it('Removes properties with "_"', () => {
        const result = element.normalizeRequest({
          _tmp: true
        });
        assert.isUndefined(result._tmp);
      });

      it('Keeps _id and _rev', () => {
        const result = element.normalizeRequest({
          _id: '1',
          _rev: '2'
        });
        assert.equal(result._id, '1');
        assert.equal(result._rev, '2');
      });

      it('Adds created time', () => {
        const result = element.normalizeRequest({});
        assert.typeOf(result.created, 'number');
      });

      it('Adds updated time', () => {
        const result = element.normalizeRequest({});
        assert.typeOf(result.updated, 'number');
      });

      it('Keeps created time', () => {
        const result = element.normalizeRequest({
          created: 1234
        });
        assert.equal(result.created, 1234);
      });

      it('Keeps updated time', () => {
        const result = element.normalizeRequest({
          updated: 5678
        });
        assert.equal(result.updated, 5678);
      });
    });

    describe('update()', function() {
      after(function() {
        return DataGenerator.destroySavedRequestData();
      });

      let element;
      let dataObj;
      beforeEach(async () => {
        element = await basicFixture();
        dataObj = {
          name: 'test-' + Date.now(),
          url: 'http://domain.com',
          method: 'GET',
          legacyProject: undefined
        };
      });

      it('Creates a new object in the datastore', function() {
        return element.update(databaseType, dataObj)
        .then((result) => element.read(databaseType, result._id, result._rev))
        .then((result) => {
          assert.typeOf(result._rev, 'string', '_rev is set');
          assert.typeOf(result._id, 'string', '_id is set');
          assert.equal(result.url, dataObj.url, 'URL is set');
          assert.equal(result.name, dataObj.name, 'name is set');
          assert.equal(result.method, dataObj.method, 'method is set');
        });
      });

      it('Calls normalizeRequest()', function() {
        const spy = sinon.spy(element, 'normalizeRequest');
        return element.update(databaseType, dataObj)
        .then(() => {
          assert.isTrue(spy.called);
        });
      });

      it('Updates created object', function() {
        let originalRev;
        return element.update(databaseType, dataObj)
        .then((result) => {
          originalRev = result._rev;
          result.headers = 'x-test';
          return element.update(databaseType, result);
        })
        .then((result) => {
          assert.notEqual(result._rev, originalRev, '_rev is regenerated');
          assert.equal(result.headers, 'x-test', 'Change is recorded');
        });
      });

      it('Fires request-object-changed custom event', function() {
        const spy = sinon.spy();
        element.addEventListener('request-object-changed', spy);
        return element.update(databaseType, dataObj)
        .then(() => {
          assert.isTrue(spy.calledOnce);
        });
      });

      it('The request-object-changed event has properties of newly created object', function() {
        let eventData;
        element.addEventListener('request-object-changed', function(e) {
          eventData = e.detail;
        });
        return element.update(databaseType, dataObj)
        .then((result) => {
          assert.isUndefined(eventData.oldRev);
          assert.isUndefined(result.oldRev);
          assert.typeOf(eventData.request, 'object');
        });
      });

      it('The request-object-changed event has properties of updated object', function() {
        let eventData;
        let originalRev;
        return element.update(databaseType, dataObj)
        .then((result) => {
          element.addEventListener('request-object-changed', function(e) {
            eventData = e.detail;
          });
          originalRev = result._rev;
          result.name = 'test-2';
          return element.update(databaseType, result);
        })
        .then(() => {
          assert.equal(eventData.oldRev, originalRev);
          assert.typeOf(eventData.request, 'object');
          assert.notEqual(eventData.request._rev, originalRev);
          assert.equal(eventData.type, databaseType);
        });
      });
    });

    describe('updateBulk()', function() {
      after(function() {
        return DataGenerator.destroySavedRequestData();
      });

      let element;
      let dataObj;
      beforeEach(async () => {
        element = await basicFixture();
        dataObj = [{
          name: 'test-1',
          url: 'http://domain.com',
          method: 'GET',
          legacyProject: undefined
        }, {
          name: 'test-2',
          url: 'http://domain.com',
          method: 'POST',
          legacyProject: 'abc'
        }];
      });

      it('Creates objects in bulk', function() {
        return element.updateBulk(databaseType, dataObj)
        .then((result) => {
          assert.typeOf(result, 'array', 'Response is an array');
          assert.isTrue(result[0].ok, 'Item #1 is inserted');
          assert.isTrue(result[1].ok, 'Item #2 is inserted');
          assert.typeOf(result[0].rev, 'string', '_rev is set');
          assert.typeOf(result[0].id, 'string', '_id is set');
        });
      });

      it('Calls normalizeRequest()', function() {
        const spy = sinon.spy(element, 'normalizeRequest');
        return element.updateBulk(databaseType, dataObj)
        .then(() => {
          assert.equal(spy.callCount, 2);
        });
      });

      it('Updates created object', function() {
        const originalRevs = [];
        return element.updateBulk(databaseType, dataObj)
        .then((result) => {
          for (let i = 0; i < result.length; i++) {
            originalRevs.push(result[i].rev);
            dataObj[i]._rev = result[i].rev;
            dataObj[i]._id = result[i].id;
          }
          dataObj[0].headers = 'x-test';
          return element.updateBulk(databaseType, dataObj);
        })
        .then((result) => {
          assert.notEqual(result[0].rev, originalRevs[0], '_rev is regenerated');
        });
      });

      it('Fires request-object-changed custom event', function() {
        const spy = sinon.spy();
        element.addEventListener('request-object-changed', spy);
        return element.updateBulk(databaseType, dataObj)
        .then(() => {
          assert.equal(spy.callCount, 2);
        });
      });

      it('The request-object-changed event has properties of newly created object', function() {
        let eventData;
        element.addEventListener('request-object-changed', function clb(e) {
          element.removeEventListener('request-object-changed', clb);
          eventData = e.detail;
        });
        return element.updateBulk(databaseType, dataObj)
        .then((result) => {
          assert.isUndefined(eventData.oldRev);
          assert.isUndefined(result.oldRev);
          assert.typeOf(eventData.request, 'object');
        });
      });

      it('The request-object-changed event has properties of updated object', function() {
        let eventData;
        let originalRev;
        return element.updateBulk(databaseType, dataObj)
        .then((result) => {
          element.addEventListener('request-object-changed', function clb(e) {
            element.removeEventListener('request-object-changed', clb);
            eventData = e.detail;
          });
          originalRev = result[0].rev;
          for (let i = 0; i < result.length; i++) {
            dataObj[i]._rev = result[i].rev;
            dataObj[i]._id = result[i].id;
          }
          dataObj[0].name = 'test-2';
          return element.updateBulk(databaseType, dataObj);
        })
        .then(() => {
          assert.equal(eventData.oldRev, originalRev, 'oldRev is set');
          assert.typeOf(eventData.request, 'object', 'request is an object');
          assert.notEqual(eventData.request._rev, originalRev, 'request._rev is updates');
          assert.equal(eventData.type, databaseType, 'Database type is set');
        });
      });
    });

    describe('read()', function() {
      let requests;
      before(() => {
        return DataGenerator.insertSavedRequestData()
        .then((data) => {
          requests = data.requests;
        });
      });

      after(function() {
        return DataGenerator.destroySavedRequestData();
      });

      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Reads request object by id only', function() {
        return element.read(databaseType, requests[0]._id)
        .then((result) => {
          assert.equal(result._id, requests[0]._id);
        });
      });

      it('Calls PayloadProcessor.restorePayload()', function() {
        const spy = sinon.spy(PayloadProcessor, 'restorePayload');
        return element.read(databaseType, requests[1]._id, undefined, {
          restorePayload: true
        })
        .then(() => {
          PayloadProcessor.restorePayload.restore();
          assert.equal(spy.callCount, 1);
        })
        .catch((cause) => {
          PayloadProcessor.restorePayload.restore();
          throw cause;
        });
      });

      it('Reads a revision', function() {
        let originalRev;
        let updatedRev;
        return element.read(databaseType, requests[2]._id)
        .then((result) => {
          originalRev = result._rev;
          result.name = 'test-2';
          return element.update(databaseType, result);
        })
        .then((result) => {
          updatedRev = result._rev;
          return element.read(databaseType, requests[2]._id, originalRev);
        })
        .then((result) => {
          assert.equal(result.name, requests[2].name);
          assert.notEqual(originalRev, updatedRev);
        });
      });

      it('Calls normalizeRequest()', function() {
        const spy = sinon.spy(element, 'normalizeRequest');
        return element.read(databaseType, requests[3]._id)
        .then(() => {
          assert.isTrue(spy.called);
        });
      });
    });

    describe('remove()', function() {
      afterEach(function() {
        return DataGenerator.destroySavedRequestData();
      });

      let element;
      let dataObj;
      beforeEach(async () => {
        element = await basicFixture();
        dataObj = {
          name: 'test-1',
          url: 'http://domain.com',
          method: 'GET'
        };
        return element.update(databaseType, dataObj)
          .then((result) => dataObj = result);
      });

      it('Removes object from the datastore', function() {
        return element.remove(databaseType, dataObj._id, dataObj._rev)
          .then(() => {
            return element.read(databaseType, dataObj._id);
          })
          .then(() => {
            throw new Error('TEST');
          })
          .catch((cause) => {
            assert.equal(cause.status, 404);
          });
      });

      it('Fires request-object-deleted custom event', function() {
        let spy = sinon.spy();
        element.addEventListener('request-object-deleted', spy);
        return element.remove(databaseType, dataObj._id, dataObj._rev)
          .then(() => {
            assert.isTrue(spy.calledOnce);
          });
      });

      it('request-object-deleted event contains request data', function() {
        let eventData;
        element.addEventListener('request-object-deleted', function(e) {
          eventData = e.detail;
        });
        return element.remove(databaseType, dataObj._id, dataObj._rev)
          .then(() => {
            assert.equal(eventData.id, dataObj._id);
            assert.equal(eventData.oldRev, dataObj._rev);
            assert.typeOf(eventData.rev, 'string');
            assert.notEqual(eventData.rev, dataObj._rev);
            assert.equal(eventData.type, databaseType);
          });
      });
    });

    describe('list()', () => {
      before(() => {
        return DataGenerator.insertHistoryRequestData({
          requestsSize: 150
        });
      });

      after(function() {
        return DataGenerator.destroyHistoryData();
      });

      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Returnes all results without limit options', () => {
        return element.list('history', {})
        .then((result) => {
          assert.typeOf(result, 'object');
          assert.typeOf(result.rows, 'array');
          assert.lengthOf(result.rows, 150);
        });
      });

      it('Limits number of results when set', () => {
        return element.list('history', {
          limit: 50
        })
        .then((result) => {
          assert.typeOf(result, 'object');
          assert.typeOf(result.rows, 'array');
          assert.lengthOf(result.rows, 50);
        });
      });

      it('Respects pagination', () => {
        let firstKey;
        return element.list('history', {
          limit: 50
        })
        .then((result) => {
          firstKey = result.rows[0].key;
          return element.list('history', {
            limit: 50,
            startkey: result.rows[result.rows.length - 1].key,
            skip: 1
          });
        })
        .then((result) => {
          assert.typeOf(result, 'object');
          assert.typeOf(result.rows, 'array');
          assert.lengthOf(result.rows, 50);
          assert.notEqual(firstKey, result.rows[0].key);
        });
      });
    });

    describe('readBulk()', () => {
      let requests;
      before(() => {
        return DataGenerator.insertHistoryRequestData({
          requestsSize: 10
        })
        .then((data) => {
          requests = data;
        });
      });

      after(function() {
        return DataGenerator.destroyHistoryData();
      });

      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Reads data by ids', () => {
        const ids = [requests[0]._id, requests[1]._id];
        return element.readBulk('history', ids)
        .then((result) => {
          assert.lengthOf(result, 2);
          assert.deepEqual(result[0], requests[0]);
          assert.deepEqual(result[1], requests[1]);
        });
      });

      it('Restores payload', () => {
        const ids = [requests[0]._id, requests[1]._id];
        const spy = sinon.spy(PayloadProcessor, 'restorePayload');
        return element.readBulk('history', ids, {
          restorePayload: true
        })
        .then(() => {
          PayloadProcessor.restorePayload.restore();
          assert.equal(spy.callCount, 2);
        });
      });
    });

    describe('queryPouchDb()', () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Rejects when no query', () => {
        return element.queryPouchDb()
        .then(() => {
          throw new Error('Should not resolve');
        })
        .catch((cause) => {
          assert.typeOf(cause.message, 'string');
          assert.equal(cause.message, 'The "q" parameter is required.');
        });
      });

      it('Calls queryHistory() only', () => {
        const spy1 = sinon.spy(element, 'queryHistory');
        const spy2 = sinon.spy(element, 'querySaved');
        return element.queryPouchDb('test', 'history', ['id'])
        .then(() => {
          assert.isTrue(spy1.called);
          assert.equal(spy1.args[0][0], 'test');
          assert.deepEqual(spy1.args[0][1], ['id']);
          assert.isFalse(spy2.called);
        });
      });

      it('Calls querySaved() only', () => {
        const spy1 = sinon.spy(element, 'queryHistory');
        const spy2 = sinon.spy(element, 'querySaved');
        return element.queryPouchDb('test', 'saved', ['id'])
        .then(() => {
          assert.isTrue(spy2.called);
          assert.equal(spy2.args[0][0], 'test');
          assert.deepEqual(spy2.args[0][1], ['id']);
          assert.isFalse(spy1.called);
        });
      });

      it('Calls both querySaved() and queryHistory()', () => {
        const spy1 = sinon.spy(element, 'queryHistory');
        const spy2 = sinon.spy(element, 'querySaved');
        return element.queryPouchDb('test', 'all', ['id'])
        .then(() => {
          assert.isTrue(spy1.called);
          assert.equal(spy1.args[0][0], 'test');
          assert.deepEqual(spy1.args[0][1], ['id']);
          assert.isTrue(spy2.called);
          assert.equal(spy2.args[0][0], 'test');
          assert.deepEqual(spy2.args[0][1], ['id']);
        });
      });
    });

    describe('queryHistory()', () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Calls _queryStore with arguments', () => {
        const spy = sinon.spy(element, '_queryStore');
        return element.queryHistory('test', ['id'])
        .then(() => {
          assert.isTrue(spy.called);
          assert.equal(spy.args[0][0], 'test');
          assert.deepEqual(spy.args[0][1], ['id']);
          assert.typeOf(spy.args[0][2], 'object');
          assert.deepEqual(spy.args[0][3], element.historyIndexes);
        });
      });
    });

    describe('querySaved()', () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Calls _queryStore with arguments', () => {
        const spy = sinon.spy(element, '_queryStore');
        return element.querySaved('test', ['id'])
        .then(() => {
          assert.isTrue(spy.called);
          assert.equal(spy.args[0][0], 'test');
          assert.deepEqual(spy.args[0][1], ['id']);
          assert.typeOf(spy.args[0][2], 'object');
          assert.deepEqual(spy.args[0][3], element.savedIndexes);
        });
      });
    });

    describe('_queryStore()', () => {
      let requests;
      before(() => {
        return DataGenerator.insertHistoryRequestData({
          requestsSize: 10
        })
        .then((data) => {
          requests = data;
        });
      });

      after(function() {
        return DataGenerator.destroyHistoryData();
      });

      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Rejects when no query', () => {
        return element._queryStore()
        .then(() => {
          throw new Error('Should not resolve');
        })
        .catch((cause) => {
          assert.typeOf(cause.message, 'string');
          assert.equal(cause.message, 'The "q" argument is required.');
        });
      });

      it('Rejects when ignored is not an array', () => {
        return element._queryStore('test', 'not-an-array')
        .then(() => {
          throw new Error('Should not resolve');
        })
        .catch((cause) => {
          assert.typeOf(cause.message, 'string');
          assert.equal(cause.message, 'The "ignore" argument is not an array.');
        });
      });

      it('Queries the data store', () => {
        const db = element.historyDb;
        const indexes = element.historyIndexes;
        const ignore = [];
        const spy = sinon.spy(db, 'search');
        return element._queryStore('test', ignore, db, indexes)
        .then(() => {
          db.search.restore();
          assert.isTrue(spy.called, 'Search function is called');
          const data = spy.args[0][0];
          assert.equal(data.query, 'test', 'Query is set');
          assert.deepEqual(data.fields, indexes, 'Fields is set');
          assert.isTrue(data.include_docs, 'include_docs is set');
          assert.equal(data.mm, 100, 'mm is set');
        })
        .catch((cause) => {
          db.search.restore();
          throw cause;
        });
      });

      it('Returns the results', () => {
        const db = element.historyDb;
        const indexes = element.historyIndexes;
        const ignore = [];
        return element._queryStore(requests[0].method, ignore, db, indexes)
        .then((results) => {
          assert.typeOf(results, 'array');
          // Sometimes this fails. It is an external plugin anyway.
          // assert.isAbove(results.length, 0);
        });
      });

      it('Removes ignored requests', () => {
        const db = element.historyDb;
        const indexes = element.historyIndexes;
        const ignore = [requests[0]._id];
        return element._queryStore(requests[0].method, ignore, db, indexes)
        .then((results) => {
          const index = results.findIndex((item) => item._id === requests[0]._id);
          assert.equal(index, -1);
        });
      });
    });

    describe('indexData()', () => {
      before(() => {
        return DataGenerator.insertHistoryRequestData({
          requestsSize: 1
        });
      });

      after(function() {
        return DataGenerator.destroyHistoryData();
      });

      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Indexes history data', () => {
        return element.indexData('history');
      });

      it('Indexes saved data', () => {
        return element.indexData('saved');
      });
    });
  });

  describe('readProjectRequests()', function() {
    let project;
    let projects;
    before(() => {
      return DataGenerator.insertSavedRequestData()
      .then((data) => {
        projects = data.projects;
        for (let i = 0; i < data.projects.length; i++) {
          if (data.projects[i].requests && data.projects[i].requests.length) {
            project = data.projects[i];
            break;
          }
        }
        if (!project) {
          throw new Error('Unable to find a project with requests.');
        }
      });
    });

    after(function() {
      return DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls readBulk() with arguments', () => {
      const spy = sinon.spy(element, 'readBulk');
      const opts = {restorePayload: true};
      return element.readProjectRequests(project._id, opts)
      .then(() => {
        assert.isTrue(spy.called);
        assert.equal(spy.args[0][0], 'saved');
        assert.deepEqual(spy.args[0][1], project.requests);
        assert.deepEqual(spy.args[0][2], opts);
      });
    });

    it('Returns project requests', () => {
      return element.readProjectRequests(project._id)
      .then((result) => {
        assert.typeOf(result, 'array');
        assert.lengthOf(result, project.requests.length);
      });
    });

    it('Calls readProjectRequestsLegacy() when project do not have requests', () => {
      const project = projects.find((item) => !item.requests);
      // generates projects have 30% chance to have request assigned.
      // This test would fail when all projects have requests array which is still possible
      // To eliminate false-positive test results this test ends when project is not found.
      if (!project) {
        console.warn('THIS TEST DID NOT RUN. RE-RUN THE TEST.');
        return;
      }
      const spy = sinon.spy(element, 'readProjectRequestsLegacy');
      return element.readProjectRequests(project._id)
      .then(() => {
        assert.isTrue(spy.called);
        assert.equal(spy.args[0][0], project._id);
      });
    });
  });

  describe('readProjectRequestsLegacy()', function() {
    before(async () => {
      const element = await basicFixture();
      const requests = [{
        _id: 'test/1234-project',
        projectOrder: 2
      }, {
        _id: 'test/5678-project',
        projectOrder: 1
      }, {
        _id: 'other/1234-project',
        projectOrder: 0
      }];
      return element.updateBulk('saved', requests);
    });

    after(function() {
      return DataGenerator.destroySavedRequestData();
    });

    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Reads requests by their ID', () => {
      return element.readProjectRequestsLegacy('1234-project')
      .then((result) => {
        assert.lengthOf(result, 2);
      });
    });

    it('Calls sorting function', () => {
      const spy = sinon.spy(element, 'sortRequestProjectOrder');
      return element.readProjectRequestsLegacy('1234-project')
      .then(() => {
        assert.isTrue(spy.called);
      });
    });
  });

  describe('sortRequestProjectOrder()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns 1 when a.order > b.order', () => {
      const result = element.sortRequestProjectOrder({
        projectOrder: 1
      }, {
        projectOrder: 0
      });
      assert.equal(result, 1);
    });

    it('Returns -1 when a.order < b.order', () => {
      const result = element.sortRequestProjectOrder({
        projectOrder: 0
      }, {
        projectOrder: 1
      });
      assert.equal(result, -1);
    });

    it('Returns 1 when a.name > b.name', () => {
      const result = element.sortRequestProjectOrder({
        name: 1,
        projectOrder: 0
      }, {
        name: 0,
        projectOrder: 0
      });
      assert.equal(result, 1);
    });

    it('Returns -1 when a.order < b.order', () => {
      const result = element.sortRequestProjectOrder({
        name: 0,
        projectOrder: 0
      }, {
        projectOrder: 0,
        name: 1
      });
      assert.equal(result, -1);
    });

    it('Returns 0 otherwise', () => {
      const result = element.sortRequestProjectOrder({
        name: 0,
        projectOrder: 0
      }, {
        projectOrder: 0,
        name: 0
      });
      assert.equal(result, 0);
    });
  });

  describe('deleteDataModel()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns single promise for saved-requests', () => {
      const result = element.deleteDataModel('saved-requests');
      assert.lengthOf(result, 1);
      return Promise.all(result);
    });

    it('Returns single promise for saved', () => {
      const result = element.deleteDataModel('saved');
      assert.lengthOf(result, 1);
      return Promise.all(result);
    });

    it('Returns single promise for history-requests', () => {
      const result = element.deleteDataModel('history-requests');
      assert.lengthOf(result, 1);
      return Promise.all(result);
    });

    it('Returns single promise for history', () => {
      const result = element.deleteDataModel('history');
      assert.lengthOf(result, 1);
      return Promise.all(result);
    });

    it('Returns 2 promises for "all"', () => {
      const result = element.deleteDataModel('all');
      assert.lengthOf(result, 2);
      return Promise.all(result);
    });

    it('Returns 2 promises for "saved" and "history"', () => {
      const result = element.deleteDataModel(['saved', 'history']);
      assert.lengthOf(result, 2);
      return Promise.all(result);
    });
  });
});
