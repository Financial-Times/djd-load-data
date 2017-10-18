import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';

export default [
  {
    input: './index.ts',
    output: {
        file: 'dist/loadData.dist.js',
        format: 'umd',
        name: 'loadData',
    },
    moduleContext: {
      [require.resolve('whatwg-fetch')]: 'window'
    },
    plugins: [
      resolve(),
      typescript(),
    ],
  },
  {
    input: './index.ts',
    output: {
        file: 'dist/loadData.cjs.js',
        format: 'cjs',
    },
    external: [
      'ramda',
      'd3-dsv',
    ],
    plugins: [
      typescript(),
    ],
  },
  {
    input: './index.ts',
    output: {
        file: 'dist/loadData.module.js',
        format: 'es',
    },
    external: [
      'ramda',
      'd3-dsv',
      'isomorphic-fetch',
    ],
    plugins: [
      typescript(),
    ],
  },
];
