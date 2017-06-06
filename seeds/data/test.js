module.exports = {
  "users": [
    {
      "username": "testUser1",
      "password": "1234"
    },
    {
      "username": "testUser2",
      "password": "4321"
    },
    {
      "username": "testUser3",
      "password": "1243"
    },
    {
      "username": "testUser4",
      "password": "4312"
    }
  ],
  "groups": [
    { "groupName": "group1" },
    { "groupName": "group2" }
  ],
  "userSaldos": [
    {
      "username": "testUser1",
      "groupName": "group1",
      "saldo": 10
    },
    {
      "username": "testUser2",
      "groupName": "group1",
      "saldo": -10
    },
    {
      "username": "testUser3",
      "groupName": "group2",
      "saldo": 5
    },
    {
      "username": "testUser3",
      "groupName": "group2",
      "saldo": -5
    }
  ],
  "tokens": [
    {
      "token": "restricted_token",
      "role": "restricted",
      "comment": "For restricted"
    },
    {
      "token": "global_token",
      "role": "global",
      "comment": "For global"
    },
    {
      "token": "admin_token",
      "role": "admin",
      "comment": "For admin"
    }
  ],
  "tokenGroupAccess": [
    {
      "groupName": "group1",
      "token": "restricted_token"
    }
  ],
  "transactions": [
    {
      "username": "testUser1",
      "groupName": "group1",
      "token": "restricted_token",
      "oldSaldo": 0,
      "newSaldo": 10
    },
    {
      "username": "testUser2",
      "groupName": "group1",
      "token": "restricted_token",
      "oldSaldo": 0,
      "newSaldo": -10
    },
    {
      "username": "testUser3",
      "groupName": "group2",
      "token": "global_token",
      "oldSaldo": 0,
      "newSaldo": 5
    },
    {
      "username": "testUser3",
      "groupName": "group2",
      "token": "global_token",
      "oldSaldo": 0,
      "newSaldo": -5
    }
  ]
}