const runSeed = require('../runSeed')
const seed = require('../data/test');

exports.seed = (knex, Promise) => runSeed(knex, Promise, seed.data);
