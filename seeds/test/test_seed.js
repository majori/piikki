const runSeed = require('../runSeed')
const data = require('./test_data.json');

exports.seed = (knex, Promise) => runSeed(knex, Promise, data);
