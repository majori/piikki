import * as knex from 'knex';

const cfg = require('../config.js');

let db = knex(cfg.db);

/*
db('users').insert({username: 'test'})
.then(() => {
    console.log('Test insert succesful!');
});
*/

export default db;