/**
 * @file
 * load.ts
 *
 * Simple, Promise-based loader for common data filetypes
 */

import 'isomorphic-fetch';
import * as R from 'ramda';
import { csvFormatRows, csvParse, tsvParse, tsvParseRows } from 'd3-dsv';

/**
 * Take either single or multiple URIs; parse; return as single promise.
 * @param  {string[]|string} urls   - One or more URIs
 * @return {Promise}                - Promise resolving to parsed data
 */
export default function loadData(urls: string[]|string) {
  return Promise.all(parseFilesBasedOnExt(makeStringIntoArray(urls)))
    .then(returnObjectIfLengthIsOne);
}

/**
 * Get extension, return array containing filename and extension
 * @param  {string} filename - File path or URL
 * @return {string[]}        - Array containing full file path and its extension
 */
const getFileExtension = R.converge(Array, [
  R.identity,
  R.compose(R.last, R.split('.')),
]);

/**
 * Fetch and parse an array of file paths/URIs
 * @param  {string[]} URIs  - Fully-qualified file URIs
 * @return {Promise[]}      - Array of promises resolving to data
 */
const parseFilesBasedOnExt = R.map(R.compose(fetchParseData, getFileExtension));

/**
 * If a string is provided, wrap in array and return.
 * If already array, return identity.
 * @param  {string} uri   - a URI string
 * @return {string[]}     - Array of URIs ready for processing
 */
const makeStringIntoArray = R.when(R.compose(R.not, Array.isArray), R.of);

/**
 * Return an object if only item in array; otherwise return identity
 * @param  {Array} results   - Results array containing one or more objects
 * @return {Object|Array}    - Either the only object in the array, or identity.
 */
const returnObjectIfLengthIsOne = R.when(R.compose(R.equals(1), R.length), R.head);

/**
 * Fetch data and parse based on ext.
 * @TODO This could be way more monadic than it is now.
 * @param  {string[]} fileData       -  Info about the file to consume
 * @param  {string}  fileData[0]     -  URL to fetch
 * @param  {string}  fileData[1]     -  File extension lacking dot
 * @return {Promise<Object|Array>}   -  Promise resolving to parsed data
 */
async function fetchParseData([url, ext]: [string, string]) {
  switch (ext) {
    case 'json':
      return (await fetch(url)).json();
    case 'csv':
      return csvParse(await (await fetch(url)).text());
    case 'tsv':
      const data = await (await fetch(url)).text();
      if (!isAnnotated(data)) return tsvParse(data);
      else return atsvParse(data);
    case 'atsv':
    case 'txt':
      return atsvParse(await (await fetch(url)).text());
    default:
      throw new Error('Unrecognised file extension');
  }
}

/**
 * Returns whether a TSV is annotated
 * @param  {string} data  - TSV as unparsed string
 * @return {boolean}      - Whether TSV has annotations denoted by '&'
 */
const isAnnotated = R.compose(
  R.converge(
    R.eqBy(R.length),
    [
      R.filter(R.isEmpty),
      R.tail
    ]
  ),
  R.last,
  tsvParseRows
);

/**
 * Parse an annotated TSV into data and annotations
 * @TODO this is way too complex and should be simplified
 * @param  {string}   data          - Unparsed ATSV string
 * @return {Object}   results
 * @return {Object}   results.meta  - Annotations
 * @return {Object[]} results.data  - Parsed TSV data
 */
function atsvParse(data: string) {
  const rows = tsvParseRows(data);
  const numCols = rows[0].length;
  const meta = rows.reduce((acc: any, cur: string[]) => {
    if (cur[0].indexOf('&') === 0 &&
        cur.filter(i => i === '').length === numCols - 1) {
      const [key, value] = cur[0].slice(1).split('=');
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});

  if (rows[0][0] === '&') rows[0][0] = 'date';
  const filtered = rows.filter(row => row[0].indexOf('&') === -1);
  const parsed = csvParse(csvFormatRows(filtered));

  return {
    meta,
    data: parsed,
  };
}
