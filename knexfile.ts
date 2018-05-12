import * as _ from 'lodash';

import cfg from './src/config';

module.exports = {
  development: _.cloneDeep(cfg.db),
  production: _.cloneDeep(cfg.db),
  test: _.cloneDeep(cfg.db),
};
