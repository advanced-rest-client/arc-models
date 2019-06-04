import { fixture, assert } from '@open-wc/testing';
import {UrlHistoryHelper} from './common.js';
import '../../url-history-model.js';

describe('<url-history-model> - Querying', () => {
  async function basicFixture() {
    return /** @type {UrlHistoryModel} */ (await fixture('<url-history-model></url-history-model>'));
  }

  describe('Storing the data', function() {
    let element;
    const baseUrl = 'https://api.mulesoft.com/endpoint/path?query=parameter';
    const similarUrl = 'https://api.mulesoft.com/';
    const otherUrl = 'https://api.domain.com/endpoint/';

    describe('query()', function() {
      beforeEach(async () => {
        element = await basicFixture();
      });

      before(function() {
        // return UrlHistoryHelper.deleteDatabase()
        return UrlHistoryHelper.getDatabase().destroy()
        .then(function() {
          UrlHistoryHelper.insertData([
            baseUrl, similarUrl, otherUrl
          ]);
        });
      });

      it('Should not result with data', function() {
        return element.query('ranodm')
        .then(function(result) {
          assert.typeOf(result, 'array', 'Result is an array');
          assert.lengthOf(result, 0, 'Result is empty');
        });
      });

      it('Should result with single URL that equals URL', function() {
        return element.query(baseUrl)
        .then(function(result) {
          assert.lengthOf(result, 1);
        });
      });

      it('Should result with matching URLs', function() {
        return element.query(similarUrl)
        .then(function(result) {
          assert.lengthOf(result, 2);
        });
      });

      it('Should result with not valid URL', function() {
        return element.query('https')
        .then(function(result) {
          assert.lengthOf(result, 3);
        });
      });
    });

    describe('query() event based', function() {
      beforeEach(async () => {
        element = await basicFixture();
      });

      before(function() {
        return UrlHistoryHelper.getDatabase().destroy()
        // return UrlHistoryHelper.deleteDatabase()
        .then(function() {
          UrlHistoryHelper.insertData([
            baseUrl, similarUrl, otherUrl
          ]);
        });
      });

      it('Should not result with data', function() {
        const e = UrlHistoryHelper.fire('url-history-query', {
          q: 'ranodm'
        });
        return e.detail.result
        .then(function(result) {
          assert.typeOf(result, 'array', 'Result is an array');
          assert.lengthOf(result, 0, 'Result is empty');
        });
      });

      it('Should result with single URL that equals URL', function() {
        const e = UrlHistoryHelper.fire('url-history-query', {
          q: baseUrl
        });
        return e.detail.result
        .then(function(result) {
          assert.lengthOf(result, 1);
        });
      });

      it('Should result with matching URLs', function() {
        const e = UrlHistoryHelper.fire('url-history-query', {
          q: similarUrl
        });
        return e.detail.result
        .then(function(result) {
          assert.lengthOf(result, 2);
        });
      });

      it('Should result with not valid URL', function() {
        const e = UrlHistoryHelper.fire('url-history-query', {
          q: 'https'
        });
        return e.detail.result
        .then(function(result) {
          assert.lengthOf(result, 3);
        });
      });

      it('Event is cancelled', function() {
        const e = UrlHistoryHelper.fire('url-history-query', {
          q: baseUrl
        });
        assert.isTrue(e.defaultPrevented);
      });
    });
  });
});
