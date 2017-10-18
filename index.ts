/**
 * @file
 * load.ts
 *
 * Simple, Promise-based loader for common data filetypes
 */

import 'isomorphic-fetch';
import { compose, map } from 'ramda';
import { csvFormatRows, csvParse, tsvParse, tsvParseRows } from 'd3-dsv';

export default function loadData(urls: string[]|string) {
  return Promise.all(map(compose(
    fetchParseData,
    getFileExtension,
  ))(urls instanceof Array ? urls : [urls]))
  .then(results =>
    results.length === 1 ? results[0] : results);
}

function getFileExtension(filename: string) {
  const frags = filename.split('.');
  const ext = frags[frags.length - 1];
  return [filename, ext];
}

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

function isAnnotated(data: string) {
  const rows = tsvParseRows(data);
  const lastRow = rows[rows.length - 1];
  return lastRow.filter(col => col === '').length === lastRow.length - 1;
}

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
