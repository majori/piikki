const runSeed = require('../runSeed')
const data = require('../data/test');

exports.seed = (knex, Promise) => runSeed(knex, Promise, data);
