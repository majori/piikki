const _ = require('lodash');
const moment = require('moment');

const USER_AMOUNT = 50;

const users = _.times(USER_AMOUNT, (i) => ({
  username: `user${i}`,
  password: '1234'
}));

const groups = _.times(4, (i) => ({ groupName: `group${i}` }));

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

const userSaldos = [];

const transactions = _.flatMap(users, user => {
  const quantity = _.times(_.random(1,20), () => _.random(-10, 10));
  const groupName = _.sample(groups, 2).groupName;
  const saldos = [];

  const finalSaldo = _.reduce(quantity, (current, value) => {
    const newSaldo = current + value;
    saldos.push({
      username: user.username,
      token: tokens[_.random(1)].token,
      groupName,
      oldSaldo: current,
      newSaldo
    })

    return current + value;
  }, 0);

  userSaldos.push({
    username: user.username,
    groupName,
    saldo: finalSaldo
  });

  const time = moment();
  return _.chain(saldos)
    .reverse()
    .map(saldo => _.set(saldo, 'timestamp', time
        .subtract(_.random(1,24), 'hours')
        .subtract(_.random(60), 'minutes')
        .format('YYYY-MM-DD HH:mm:ss')
      )
    )
    .value();
});

module.exports = {
  users,
  groups,
  userSaldos,
  transactions,
  tokens,
  tokenGroupAccess,
}
