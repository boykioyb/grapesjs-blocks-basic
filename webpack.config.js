module.exports = ({ config }) => ({
  ...config,
  output: {
    ...config.output,
    library: 'bob-gjs-blocks-basic',
  },
});
