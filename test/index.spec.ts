/**
 * @file
 * Unit tests for load-data
 */

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import loadData from '../index'; // tslint:disable-line
import { resolve } from 'path';

const StaticServer = require('static-server'); // tslint:disable-line
const server = new StaticServer({
  rootPath: resolve(__dirname, 'fixtures'),
  port: 5555,
});

chai.use(chaiAsPromised);
chai.should();
const { expect } = chai;

const result = require(resolve(__dirname, 'fixtures', 'test.json'));

const resultMeta = {
  title: 'Estimated ecommerce sales in Greater Southeast Asia',
  subtitle: '$bn',
  source: 'Sea S1 filing',
  footnote: 'delete if not required',
  comment: 'Any message you want Graphics to see during processing; delete if not required',
  doublescale: '0',
  accumulate: 'false',
};

const webroot = 'http://localhost:5555';

describe('default export', () => {
  before(done => server.start(done));
  after(server.stop);

  describe('with one file', () => {
    it('parses JSON', () => {
      return loadData(`${webroot}/test.json`).should.eventually.eql(result);
    });

    it('parses CSV', () => {
      return loadData(`${webroot}/test.csv`).should.eventually.eql(result);
    });

    it('parses TSV', () => {
      return loadData(`${webroot}/test.tsv`).should.eventually.eql(result);
    });

    it('parses ATSV/txt', () => {
      return Promise.all([
        loadData(`${webroot}/test.atsv.tsv`)
          .should.eventually.eql({ data: result, meta: resultMeta }),
        loadData(`${webroot}/test.atsv`)
          .should.eventually.eql({ data: result, meta: resultMeta }),
        loadData(`${webroot}/test.txt`)
          .should.eventually.eql({ data: result, meta: resultMeta }),
      ]);
    });
  });

  describe('with multiple files', () => {
    it('parses correctly', () => {
      return loadData([
        `${webroot}/test.json`,
        `${webroot}/test.csv`,
        `${webroot}/test.tsv`,
        `${webroot}/test.atsv`,
        `${webroot}/test.txt`,
      ]).should.eventually.eql([
        result,
        result,
        result,
        { data: result, meta: resultMeta },
        { data: result, meta: resultMeta },
      ]);
    });
  });
  describe('parsing unrecognised format', () => {
    it('throws', () => {
      expect(() => loadData(`${webroot}/herpa-derpa.nope`)).to.throw();
    });
  });
});
