module.exports = {
  presets: [
    ['@babel/preset-env', {
      // Configure targets if needed, e.g.,
      // targets: { browsers: '>0.5%, not dead, not op_mini all' }
    }],
    ['@babel/preset-react', {
      runtime: 'automatic' // Use the new JSX transform
    }]
  ],
  plugins: [
    // This needs to be installed: npm install --save-dev @babel/plugin-transform-runtime
    // or yarn add --dev @babel/plugin-transform-runtime
    '@babel/plugin-transform-runtime'
  ]
};
