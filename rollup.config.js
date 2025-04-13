import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import external from 'rollup-plugin-peer-deps-external';
// Removed url plugin import - add back if needed for assets

// Import package.json to read main and module fields
import pkg from './package.json';

export default {
  input: 'src/index.js', // Your main entry point
  output: [
    {
      file: pkg.main, // Output path for CommonJS from package.json
      format: 'cjs',
      sourcemap: true,
      exports: 'named', // Recommended for CJS compatibility
    },
    {
      file: pkg.module, // Output path for ES Module from package.json
      format: 'es',
      sourcemap: true,
      exports: 'named', // Recommended for ESM compatibility
    }
  ],
  plugins: [
    external(), // Automatically externalize peerDependencies
    resolve(), // Locates modules using the Node resolution algorithm
    babel({
      exclude: 'node_modules/**', // Only transpile our source code
      babelHelpers: 'runtime', // Use runtime helpers (@babel/plugin-transform-runtime)
      // Assumes Babel config is in babel.config.js or .babelrc.js now
      // If not, you can configure presets here:
      // presets: ['@babel/preset-env', '@babel/preset-react']
    }),
    commonjs() // Converts CommonJS modules to ES6
    // url() // Add back if you import assets like images/fonts
  ]
};
