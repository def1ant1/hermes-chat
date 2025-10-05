const config = require('@hermeslabs/lint').stylelint;

module.exports = {
  ...config,
  rules: {
    'selector-id-pattern': null,
    ...config.rules,
  },
};
