// rollup.config.js
import nodeResolve  from 'rollup-plugin-node-resolve';
import json         from 'rollup-plugin-json';
import {terser}     from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.js',
    external:['events','t-matrix'],
    output: [
      {
        file: 'index.mjs',
        format: 'es',
      },
      {
        file: 'index.js',
        format: 'cjs',
      },
    ],
    plugins: [
      nodeResolve({jsnext: true}), // load npm modules from npm_modules
      json(), // avoid the package.json parsing issue
      terser(),
    ],
  },
];

