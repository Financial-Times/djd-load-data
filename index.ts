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
 * Fetch data and parse based on ext.
 * @param  {string[]} fileData       -  Info about the file to consume
 * @param  {string}  fileData[0]     -  URL to fetch
 * @param  {string}  fileData[1]     -  File extension lacking dot
 * @return {Promise<Object|Array>}   -  Promise resolving to parsed data
 */
const fetchParseData = ([url, ext]: [string, string]) => R.cond([
  [R.equals('json'), async () => (await fetch(url)).json()],
  [R.equals('csv'), async () => csvParse(await (await fetch(url)).text())],
  [R.equals('tsv'), async () => {
    const data = await (await fetch(url)).text();
    if (!isAnnotated(data)) return tsvParse(data);
    else return atsvParse(data);
  }],
  [R.either(R.equals('atsv'), R.equals('txt')), async () =>
    atsvParse(await (await fetch(url)).text())],
  [R.T, () => {
    throw new Error('Unrecognised file extension');
  }],
])(ext);

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
 * Returns whether a TSV is annotated
 * @param  {string} data  - TSV as unparsed string
 * @return {boolean}      - Whether TSV has annotations denoted by '&'
 */
const isAnnotated = R.compose(
  R.converge(
    R.eqBy(R.length),
    [
      R.filter(R.isEmpty),
      R.tail,
    ],
  ),
  R.last,
  tsvParseRows,
);

/**
 * Creates a meta object from annotated TSV comments
 * @param {string[][]} - Parsed TSV rows
 * @return {Object}    - Extracted metadata
 */
const getMeta = R.compose(
  R.fromPairs,
  R.map(R.compose(R.split('='), R.tail)),
  R.filter(R.compose(R.gt(R.__, -1), R.indexOf('='))),
  R.map(R.head),
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
  const meta = getMeta(rows);

  if (rows[0][0] === '&') rows[0][0] = 'date';
  const filtered = rows.filter(row => row[0].indexOf('&') === -1);
  const parsed = csvParse(csvFormatRows(filtered));

  return {
    meta,
    data: parsed,
  };
}
