const config = require('@hermeslabs/lint').remarklint;

module.exports = {
  ...config,
  plugins: ['remark-mdx', ...config.plugins],
};
