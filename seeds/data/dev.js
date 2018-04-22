const _ = require('lodash');
const moment = require('moment');

const USER_AMOUNT = 50;
const GROUP_AMOUNT = 3;
const MAX_TRANSACTION_AMOUNT = 20;

const users = _.times(USER_AMOUNT, (i) => ({
  username: `user${i}`,
  password: '1234'
}));

const groups = _.times(GROUP_AMOUNT, (i) => ({ groupName: `group${i}` }));

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
    groupName: _.first(groups).groupName,
    token: 'restricted_token'
  }
];

const userSaldos = [];

const transactions = _.flatMap(users, (user) => {
  const quantity = _.times(_.random(1, MAX_TRANSACTION_AMOUNT), () => _.round(_.random(-10, 10, true), 2));
  const groupName = _.sample(_.initial(groups)).groupName;
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

  const time = moment().utc();
  return _.chain(saldos)
    .reverse()
    .map(saldo => _.set(saldo, 'timestamp', time
        .subtract(_.random(1,24), 'hours')
        .subtract(_.random(60), 'minutes')
        .format()
      )
    )
    .value();
});

const alternativeLogins = _.map(userSaldos, saldo => ({
  username: saldo.username,
  groupName: saldo.groupName,
  token: tokens[1].token,
  type: 10,
  key: '1234',
}));

module.exports = {
  users,
  groups,
  userSaldos,
  transactions,
  tokens,
  tokenGroupAccess,
  alternativeLogins,
}
