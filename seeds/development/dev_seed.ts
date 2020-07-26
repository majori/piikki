import * as fs from 'fs';
import * as Knex from 'knex';
import runSeed from '../runSeed';
import { data } from '../data/dev';

// Write the data to file
fs.writeFileSync(
  `${__dirname}/${Date.now()}_data.json`,
  JSON.stringify(data, null, 1),
  'utf8',
);

export const seed = (knex: Knex, Promise: PromiseConstructor) =>
  runSeed(knex, data);
