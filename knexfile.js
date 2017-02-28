const _ = require('lodash');
const cfg = require('./config');

module.exports = {
  development: _.cloneDeep(cfg.db),
  production: _.cloneDeep(cfg.db)
}