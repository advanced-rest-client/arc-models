import { fixture, assert, html } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import * as sinon from 'sinon';
import '../../websocket-url-history-model.js';
import { ArcModelEventTypes } from '../../src/events/ArcModelEventTypes.js';
import { ArcModelEvents } from '../../src/events/ArcModelEvents.js';

/* eslint-disable require-atomic-updates */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */

/** @typedef {import('../../src/WebsocketUrlHistoryModel').WebsocketUrlHistoryModel} WebsocketUrlHistoryModel */
/** @typedef {import('../../src/WebsocketUrlHistoryModel').ARCWebsocketUrlHistory} ARCWebsocketUrlHistory */

describe('WebsocketUrlHistoryModel - Events API', () => {
  /**
   * @return {Promise<WebsocketUrlHistoryModel>}
   */
  async function basicFixture() {
    return fixture(html`<websocket-url-history-model></websocket-url-history-model>`);
  }

  const generator = new DataGenerator();

  describe(`${ArcModelEventTypes.WSUrlHistory.list} event`, () => {
    before(async () => {
      const model = await basicFixture();
      const projects = /** @type ARCWebsocketUrlHistory[] */ (generator.generateUrlsData({ size: 30 }));
      await model.db.bulkDocs(projects);
    });

    let element = /** @type WebsocketUrlHistoryModel */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    after(async () => {
      await generator.destroyWebsocketsData();
    });

    it('returns a query result for default parameters', async () => {
      const result = await ArcModelEvents.WSUrlHistory.list(document.body);
      assert.typeOf(result, 'object', 'result is an object');
      assert.typeOf(result.nextPageToken, 'string', 'has page token');
      assert.typeOf(result.items, 'array', 'has response items');
      assert.lengthOf(result.items, element.defaultQueryOptions.limit, 'has default limit of items');
    });

    it('respects "limit" parameter', async () => {
      const result = await ArcModelEvents.WSUrlHistory.list(document.body, {
        limit: 5,
      });
      assert.lengthOf(result.items, 5);
    });

    it('respects "nextPageToken" parameter', async () => {
      const result1 = await ArcModelEvents.WSUrlHistory.list(document.body, {
        limit: 10,
      });
      const result2 = await ArcModelEvents.WSUrlHistory.list(document.body, {
        nextPageToken: result1.nextPageToken,
      });
      assert.lengthOf(result2.items, 20);
    });

    it('does not set "nextPageToken" when no more results', async () => {
      const result1 = await ArcModelEvents.WSUrlHistory.list(document.body, {
        limit: 40,
      });
      const result2 = await ArcModelEvents.WSUrlHistory.list(document.body, {
        nextPageToken: result1.nextPageToken,
      });
      assert.isUndefined(result2.nextPageToken);
    });
  });

  describe(`${ArcModelEventTypes.WSUrlHistory.insert} event`, () => {
    let element = /** @type WebsocketUrlHistoryModel */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    afterEach(async () => {
      await generator.destroyWebsocketsData();
    });

    it('returns the changelog', async () => {
      const entity = /** @type ARCWebsocketUrlHistory */ (generator.generateUrlObject());
      const result = await ArcModelEvents.WSUrlHistory.insert(document.body, entity._id);
      assert.typeOf(result, 'object', 'returns an object');
      assert.typeOf(result.id, 'string', 'has an id');
      assert.typeOf(result.rev, 'string', 'has a rev');
      assert.typeOf(result.item, 'object', 'has created object');
      assert.isUndefined(result.oldRev, 'has no oldRev');
    });

    it('creates an item in the data store', async () => {
      const entity = /** @type ARCWebsocketUrlHistory */ (generator.generateUrlObject());
      await ArcModelEvents.WSUrlHistory.insert(document.body, entity._id);
      const result = /** @type ARCWebsocketUrlHistory */ (await element.db.get(entity._id));
      assert.typeOf(result, 'object', 'returns an object');
      assert.equal(result._id, entity._id, 'has the id');
      assert.typeOf(result._rev, 'string', 'has a rev');
      assert.equal(result.cnt, 1, 'has default cnt property');
      assert.typeOf(result.time, 'number', 'has time property');
    });

    it('updates the counter on the same item', async () => {
      const entity = /** @type ARCWebsocketUrlHistory */ (generator.generateUrlObject());
      await ArcModelEvents.WSUrlHistory.insert(document.body, entity._id);
      await ArcModelEvents.WSUrlHistory.insert(document.body, entity._id);
      const result = /** @type ARCWebsocketUrlHistory */ (await element.db.get(entity._id));
      assert.equal(result.cnt, 2, 'has default cnt property');
    });

    it('dispatches change event', async () => {
      const entity = /** @type ARCWebsocketUrlHistory */ (generator.generateUrlObject());
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.WSUrlHistory.State.update, spy);
      await ArcModelEvents.WSUrlHistory.insert(document.body, entity._id);
      assert.isTrue(spy.calledOnce);
    });

    it('throws when no url', async () => {
      let thrown = false;
      try {
        await ArcModelEvents.WSUrlHistory.insert(document.body, undefined);
      } catch (_) {
        thrown = true;
      }
      assert.isTrue(thrown);
    });
  });

  describe(`${ArcModelEventTypes.WSUrlHistory.query} event`, () => {
    let created = /** @type ARCWebsocketUrlHistory[] */ (null)
    before(async () => {
      const model = await basicFixture();
      created = /** @type ARCWebsocketUrlHistory[] */ (generator.generateUrlsData({ size: 30 }));
      await model.db.bulkDocs(created);
    });

    beforeEach(async () => {
      await basicFixture();
    });

    after(async () => {
      await generator.destroyWebsocketsData();
    });

    it('returns a list of matched results', async () => {
      const result = await ArcModelEvents.WSUrlHistory.query(document.body, 'http://');
      assert.typeOf(result, 'array', 'result is an array');
      assert.lengthOf(result, 30, 'has all results');
    });

    it('matches the URL', async () => {
      const result = await ArcModelEvents.WSUrlHistory.query(document.body, created[0]._id);
      assert.lengthOf(result, 1);
    });

    it('returns empty array when not found', async () => {
      const result = await ArcModelEvents.WSUrlHistory.query(document.body, 'this will not exist');
      assert.lengthOf(result, 0);
    });
  });

  describe(`${ArcModelEventTypes.destroy} event`, () => {
    beforeEach(async () => {
      const created = /** @type ARCWebsocketUrlHistory[] */ (generator.generateUrlsData({ size: 30 }));
      const model = await basicFixture();
      await model.db.bulkDocs(created);
    });

    after(async () => {
      await generator.destroyWebsocketsData();
    });

    it('deletes saved model', async () => {
      await ArcModelEvents.destroy(document.body, ['websocket-url-history'])
      const result = await generator.getDatastoreWebsocketsData();
      assert.deepEqual(result, []);
    });
  });
});
