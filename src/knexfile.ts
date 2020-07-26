import * as _ from 'lodash';

import cfg from './config';

export const development = _.cloneDeep(cfg.db);
export const production = _.cloneDeep(cfg.db);
export const test = _.cloneDeep(cfg.db);
