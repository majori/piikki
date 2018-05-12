import * as _ from 'lodash';

import cfg from './config';

module.exports = {
  development: _.cloneDeep(cfg.db),
  production: _.cloneDeep(cfg.db),
  test: _.cloneDeep(cfg.db),
};
