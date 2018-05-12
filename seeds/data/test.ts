import * as moment from 'moment';
import { Seed, SeedData } from './seed';

export const data: SeedData = {
  users: [
    {
      username: 'testUser1',
      password: '1234',
      defaultGroup: 'group1',
    },
    {
      username: 'testUser2',
      password: '4321',
      defaultGroup: 'group1',
    },
    {
      username: 'testUser3',
      password: '1243',
      defaultGroup: 'group2',
    },
    {
      username: 'testUser4',
      password: '4312',
      defaultGroup: null,
    },
  ],
  groups: [
    { groupName: 'group1', private: false },
    { groupName: 'group2', private: false },
    { groupName: 'group3', private: true, password: '1234' },
  ],
  userSaldos: [
    {
      username: 'testUser1',
      groupName: 'group1',
      saldo: 10,
    },
    {
      username: 'testUser2',
      groupName: 'group1',
      saldo: -10,
    },
    {
      username: 'testUser3',
      groupName: 'group2',
      saldo: 5,
    },
  ],
  tokens: [
    {
      token: 'restricted_token',
      role: 'restricted',
      comment: 'For restricted',
    },
    {
      token: 'global_token',
      role: 'global',
      comment: 'For global',
    },
    {
      token: 'admin_token',
      role: 'admin',
      comment: 'For admin',
    },
  ],
  tokenGroupAccess: [
    {
      groupName: 'group1',
      token: 'restricted_token',
    },
  ],
  transactions: [
    {
      username: 'testUser1',
      groupName: 'group1',
      token: 'restricted_token',
      oldSaldo: 0,
      newSaldo: 10,
      timestamp: moment().toISOString(),
    },
    {
      username: 'testUser2',
      groupName: 'group1',
      token: 'restricted_token',
      oldSaldo: 0,
      newSaldo: -10,
      timestamp: moment().subtract(1, 'minute').toISOString(),
    },
    {
      username: 'testUser3',
      groupName: 'group2',
      token: 'global_token',
      oldSaldo: 0,
      newSaldo: 5,
      timestamp: moment().subtract(2, 'minute').toISOString(),
    },
    {
      username: 'testUser3',
      groupName: 'group2',
      token: 'global_token',
      oldSaldo: 0,
      newSaldo: -5,
      timestamp: moment().subtract(3, 'minute').toISOString(),
    },
  ],
  alternativeLogins: [
    {
      username: 'testUser1',
      groupName: 'group1',
      token: 'global_token',
      type: 10,
      key: '1234',
    },
  ],
};

export const meta = {
  groups: {
    all: 3,
    public: 2,
    private: 1,
  },
  membersInGroup: {
    group1: 2,
    group2: 2,
  },
  saldos: {
    testUser1: {
      group1: 10,
    },
    testUser2: {
      group1: -10,
    },
    testUser3: {
      group2: 5,
    },
  },
};

export default {
  data,
  meta,
} as Seed;
