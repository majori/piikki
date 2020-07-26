import Knex from 'knex';
import runSeed from '../runSeed';
import { data } from '../data/test';

export const seed = (knex: Knex, Promise: PromiseConstructor) =>
  runSeed(knex, data);
