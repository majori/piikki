const runSeed = require('../runSeed')
const data = require('../data/dev');
const fs = require('fs');

// Write the data to file
fs.writeFileSync(`${__dirname}/${Date.now()}_data.json`, JSON.stringify(data, null, 1), 'utf8');

exports.seed = (knex, Promise) => runSeed(knex, Promise, data);
