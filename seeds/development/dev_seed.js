const runSeed = require('../runSeed')
const data = require('../data/dev');

exports.seed = (knex, Promise) => runSeed(knex, Promise, data);
