const runSeed = require('../runSeed')
const data = require('./dev_data.json');

exports.seed = (knex, Promise) => runSeed(knex, Promise, data);
