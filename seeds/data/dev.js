const faker = require('faker');
const _ = require('lodash');
const moment = require('moment');

const USER_AMOUNT = 100;

const users = _.times(USER_AMOUNT, (i) => ({
  username: `user${i}`,
  password: '1234'
}));

const groups = _.times(5, (i) => ({ groupName: `group${i}` }));

const userSaldos = _.concat(
  _.map(_.sampleSize(users, USER_AMOUNT * 0.6), (user) => ({
    username: user.username,
    groupName: `group${_.random(1)}`,
    saldo: _.random(-10, 10)
  })),
  _.map(_.sampleSize(users, USER_AMOUNT * 0.6), (user) => ({
    username: user.username,
    groupName: `group${_.random(2,3)}`,
    saldo: _.random(-20, 20)
  }))
);

const tokens = [
  {
    token: 'restricted_token',
    role: 'restricted',
    comment: 'For restricted'
  },
  {
    token: 'global_token',
    role: 'global',
    comment: 'For global'
  },
  {
    token: 'admin_token',
    role: 'admin',
    comment: 'For admin'
  }
];

const tokenGroupAccess = [
  {
    groupName: 'group1',
    token: 'restricted_token'
  }
];

const transactions = _.map(userSaldos, saldo => ({
  username: saldo.username,
  groupName: saldo.groupName,
  token: tokens[_.random(1)].token,
  timestamp: moment().subtract(_.random(15), 'days').format('YYYY-MM-DD HH:mm:ss'),
  oldSaldo: 0,
  newSaldo: saldo.saldo
}));

module.exports = {
  users,
  groups,
  userSaldos,
  transactions,
  tokens,
  tokenGroupAccess,
}
