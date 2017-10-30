import uglify from 'rollup-plugin-uglify';
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default [
  // UMD bundle for web...
  {
    input: './index.ts',
    output: {
        file: 'dist/loadData.dist.min.js',
        format: 'umd',
        name: 'loadData',
    },
    context: 'window',
    plugins: [
      resolve({
        browser: true,
      }),
      cjs(),
      json(),
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            target: 'es5',
          },
        },
      }),
      uglify(),
    ],
  },
  // CommonJS bundle for Node...
  {
    input: './index.ts',
    output: {
        file: 'dist/loadData.cjs.js',
        format: 'cjs',
    },
    external: [
      'ramda',
      'd3-dsv',
      'axios',
    ],
    plugins: [
      typescript(),
    ],
  },
  // TypeScript for awesome people
  {
    input: './index.ts',
    output: {
        file: 'dist/loadData.module.js',
        format: 'es',
    },
    external: [
      'ramda',
      'd3-dsv',
      'axios',
    ],
    plugins: [
      typescript(),
    ],
  },
];
