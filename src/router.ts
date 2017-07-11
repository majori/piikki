import { Router } from 'express';

import groupEndpoint from './endpoints/group-endpoint';
import transactionEndpoint from './endpoints/transaction-endpoint';
import userEndpoint from './endpoints/user-endpoint';
import adminEndpoint from './endpoints/admin-endpoint';

import { IExtendedRequest } from './models/http';

export function initApiRoutes() {
  const mainRouter = Router();

  mainRouter.use('/restricted', _restrictedTokenRoutes());
  mainRouter.use('/global', _globalTokenRoutes());
  mainRouter.use('/admin', _adminTokenRoutes());

  return mainRouter;
}

// These routes can be used from both gloabl and restricted routes
function _commonRoutes() {
  const commonR = Router();

  // Root is forbidden
  commonR.get('/', (req, res) => res.status(403).send());

  commonR.post('/users/create', userEndpoint.createUser);
  commonR.post('/users/authenticate', userEndpoint.authenticateUser);
  commonR.post('/users/authenticate/alternative', userEndpoint.alternativeAuthenticateUser);
  commonR.post('/users/authenticate/alternative/create', userEndpoint.createAlternativeLogin);
  commonR.get('/users/authenticate/alternative/count', userEndpoint.getAlternativeLoginCount);
  commonR.put('/users/reset/username', userEndpoint.resetUsername);
  commonR.put('/users/reset/password', userEndpoint.resetPassword);
  commonR.post('/transaction', transactionEndpoint.makeTransaction);

  return commonR;
}

// These routes which can be accessed by restricted token
function _restrictedTokenRoutes() {
  const restrictedR = Router();

  // Authorize restricted token
  restrictedR.use((req: IExtendedRequest, res, next) => {
    if (!req.piikki.groupAccess.all) {
      next();
    } else {
      res.status(403).json({
        ok: false,
        error: {
          type: 'AuthorizationError',
          message: 'You tried to access restricted routes without a proper token',
        },
      });
    }
  });

  // Apply common routes
  restrictedR.use(_commonRoutes());

  restrictedR.get('/group', groupEndpoint.getCurrentGroup);

  restrictedR.get('/group/members', groupEndpoint.getGroupMembers);
  restrictedR.get('/group/members/:username', groupEndpoint.getGroupMember);

  restrictedR.delete('/group/removeMember', groupEndpoint.removeMember);
  restrictedR.post('/group/addMember', groupEndpoint.addMember);
  restrictedR.get('/group/transactions', transactionEndpoint.getGroupTransactions);
  restrictedR.get('/group/transactions/:username', transactionEndpoint.getUserTransactionsFromGroup);
  restrictedR.get('/group/saldo', transactionEndpoint.getGroupSaldo);
  restrictedR.get('/group/saldo/daily', transactionEndpoint.getDailyGroupSaldos);

  return restrictedR;
}

// These routes which can be accessed by global token
function _globalTokenRoutes() {
  const globalR = Router();

  // Authorize global token
  globalR.use((req: IExtendedRequest, res, next) => {
    if (req.piikki.groupAccess.all) {
      next();
    } else {
      res.status(403).json({
        ok: false,
        error: {
          type: 'AuthorizationError',
          message: 'You tried to access global routes without a proper token',
        },
      });
    }
  });

  // If client targets some group, insert the group name to request
  // so endpoint functions can look the group name from the same place
  globalR.param('groupName', (req: IExtendedRequest, res, next, name) => {
    req.piikki.groupAccess.group.name = name;
    next();
  });

  // Apply common routes
  globalR.use(_commonRoutes());

  globalR.get('/users', userEndpoint.getUsers);
  globalR.get('/users/:username', userEndpoint.getUser);
  globalR.delete('/users', userEndpoint.deleteUser);

  globalR.get('/groups', groupEndpoint.getGroups);
  globalR.post('/groups/create', groupEndpoint.createGroup);

  globalR.get('/groups/:groupName/members', groupEndpoint.getGroupMembers);
  globalR.get('/groups/:groupName/members/:username', groupEndpoint.getGroupMember);

  globalR.post('/groups/:groupName/addMember', groupEndpoint.addMember);
  globalR.get('/group/:groupName/saldo', transactionEndpoint.getGroupSaldo);
  globalR.get('/group/:groupName/saldo/daily', transactionEndpoint.getDailyGroupSaldos);
  globalR.delete('/groups/:groupName/removeMember', groupEndpoint.removeMember);

  globalR.get('/transactions/user/:username', transactionEndpoint.getUserTransactions);
  globalR.get('/transactions/group/:groupName', transactionEndpoint.getGroupTransactions);

  return globalR;
}

// These routes which can be accessed by admin token
function _adminTokenRoutes() {
  const adminR = Router();

  // Authorize admin token
  adminR.use((req: IExtendedRequest, res, next) => {
    if (req.piikki.admin.isAdmin) {
      next();
    } else {
      res.status(403).json({
        ok: false,
        error: {
          type: 'AuthorizationError',
          message: 'You tried to access admin routes without a proper token',
        },
      });
    }
  });

  adminR.get('/tokens', adminEndpoint.getTokens);
  adminR.post('/tokens/global', adminEndpoint.createGlobalToken);
  adminR.post('/tokens/restricted', adminEndpoint.createRestrictedToken);
  adminR.post('/tokens/admin', adminEndpoint.createAdminToken);
  adminR.delete('/tokens', adminEndpoint.deleteToken);
  adminR.put('/users/force-reset/password', userEndpoint.forceResetPassword);

  return adminR;
}
