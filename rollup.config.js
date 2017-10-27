import uglify from 'rollup-plugin-uglify';
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';

export default [
  // UMD bundle for web...
  {
    input: './index.ts',
    output: {
        file: 'dist/loadData.dist.min.js',
        format: 'umd',
        name: 'loadData',
    },
    context: undefined,
    moduleContext: {
      [require.resolve('isomorphic-fetch')]: 'window'
    },
    plugins: [
      resolve(),
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
      'isomorphic-fetch',
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
      'isomorphic-fetch',
    ],
    plugins: [
      typescript(),
    ],
  },
];
