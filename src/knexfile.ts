import * as _ from 'lodash';

import * as cfg from './config';

export const production = _.cloneDeep(cfg.db.production);
export const development = _.cloneDeep(cfg.db.development);
export const test = _.cloneDeep(cfg.db.development);
