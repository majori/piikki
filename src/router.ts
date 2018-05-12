import { Router } from 'express';
import { badRequest } from 'boom';

import groupEndpoint from './endpoints/group-endpoint';
import transactionEndpoint from './endpoints/transaction-endpoint';
import userEndpoint from './endpoints/user-endpoint';
import adminEndpoint from './endpoints/admin-endpoint';

/**
 * @swagger
 * tags:
 * - name: Global
 *   description: Endpoints which are authorized for global token
 * - name: Restricted
 *   description: Endpoints which are authorized for restricted token
 * - name: Admin
 *   description: Endpoints which are authorized for admin token
 */

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

  /**
   * @swagger
   * /restricted/users/create:
   *   post:
   *     tags:
   *     - Restricted
   *     summary: Create a new user
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       description: User to add to the database
   *       required: true
   *       schema:
   *         "$ref": "#/definitions/user"
   *     responses:
   *       '200':
   *         description: Returns username of the new user
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: string
   *
   * /global/users/create:
   *   post:
   *     tags:
   *     - Global
   *     summary: Create a new user
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       description: User to add to the database
   *       required: true
   *       schema:
   *         "$ref": "#/definitions/user"
   *     responses:
   *       '200':
   *         description: Returns username of the new user
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: string
   */
  commonR.post('/users/create', userEndpoint.createUser);

  /**
   * /restricted/users/authenticate:
   *   post:
   *     tags:
   *     - Restricted
   *     summary: Authenticate user
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       description: User to authenticate
   *       required: true
   *       schema:
   *         "$ref": "#/definitions/user"
   *     responses:
   *       '200':
   *         description: Returns if password was right/wrong
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties:
   *                 authenticated:
   *                   type: boolean
   * /global/users/authenticate:
   *   post:
   *     tags:
   *     - Global
   *     summary: Authenticate user
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       description: User to authenticate
   *       required: true
   *       schema:
   *         "$ref": "#/definitions/user"
   *     responses:
   *       '200':
   *         description: Returns if password was right/wrong
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties:
   *                 authenticated:
   *                   type: boolean
   */
  commonR.post('/users/authenticate', userEndpoint.authenticateUser);

  /**
   * @swagger
   * /restricted/users/authenticate/alternative:
   *   post:
   *     tags:
   *     - Restricted
   *     summary: Find user with a login key
   *     description: Find user with a login key (ex. card ID)
   *     parameters:
   *     - name: body
   *       in: body
   *       required: true
   *       schema:
   *         properties:
   *           key:
   *             type: string
   *           type:
   *             type: number
   *             description: Categorize keys
   *             required: false
   *     responses:
   *       '200':
   *         description: Return user if found
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties:
   *                 authenticated:
   *                   type: boolean
   *                 username:
   *                   type: string
   *                 groupName:
   *                   type: string
   *                   nullable: true
   *
   * /global/users/authenticate/alternative:
   *   post:
   *     tags:
   *     - Global
   *     summary: Find user with a login key
   *     description: Find user with a login key (ex. card ID)
   *     parameters:
   *     - name: body
   *       in: body
   *       required: true
   *       schema:
   *         properties:
   *           key:
   *             type: string
   *           type:
   *             type: number
   *             description: Categorize keys
   *             required: false
   *           groupName:
   *             type: string
   *             required: false
   *     responses:
   *       '200':
   *         description: Return user if found
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties:
   *                 authenticated:
   *                   type: boolean
   *                 username:
   *                   type: string
   *                 groupName:
   *                   type: string
   *                   nullable: true
   */
  commonR.post('/users/authenticate/alternative', userEndpoint.alternativeAuthenticateUser);

  /**
   * @swagger
   * /restricted/users/authenticate/alternative/create:
   *   post:
   *     tags:
   *     - Restricted
   *     summary: TODO
   * /global/users/authenticate/alternative/create:
   *   post:
   *     tags:
   *     - Global
   *     summary: TODO
   */
  commonR.post('/users/authenticate/alternative/create', userEndpoint.createAlternativeLogin);

  /**
   * @swagger
   * /restricted/users/authenticate/alternative/count:
   *   post:
   *     tags:
   *     - Restricted
   *     summary: TODO
   * /global/users/authenticate/alternative/count:
   *   post:
   *     tags:
   *     - Global
   *     summary: TODO
   */
  commonR.get('/users/authenticate/alternative/count', userEndpoint.getAlternativeLoginCount);

  /**
   * @swagger
   * /restricted/users/reset/username:
   *   put:
   *     tags:
   *     - Restricted
   *     summary: Reset user username
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       required: true
   *       schema:
   *         properties:
   *           oldUsername:
   *             "$ref": "#/definitions/username"
   *           newUsername:
   *             "$ref": "#/definitions/username"
   *           password:
   *             "$ref": "#/definitions/password"
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties: {}
   *
   * /global/users/reset/username:
   *   put:
   *     tags:
   *     - Global
   *     summary: Reset user username
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       required: true
   *       schema:
   *         properties:
   *           oldUsername:
   *             "$ref": "#/definitions/username"
   *           newUsername:
   *             "$ref": "#/definitions/username"
   *           password:
   *             "$ref": "#/definitions/password"
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties: {}
   */
  commonR.put('/users/reset/username', userEndpoint.resetUsername);

  /**
   * @swagger
   * /restricted/users/reset/password:
   *   put:
   *     tags:
   *     - Restricted
   *     summary: Reset user password
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       required: true
   *       schema:
   *         properties:
   *           username:
   *             "$ref": "#/definitions/username"
   *           oldPassword:
   *             "$ref": "#/definitions/password"
   *           newPassword:
   *             "$ref": "#/definitions/password"
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties: {}
   *
   * /global/users/reset/password:
   *   put:
   *     tags:
   *     - Global
   *     summary: Reset user password
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       required: true
   *       schema:
   *         properties:
   *           username:
   *             "$ref": "#/definitions/username"
   *           oldPassword:
   *             "$ref": "#/definitions/password"
   *           newPassword:
   *             "$ref": "#/definitions/password"
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties: {}
   */
  commonR.put('/users/reset/password', userEndpoint.resetPassword);

  /**
   * @swagger
   * /restricted/transaction:
   *   post:
   *     tags:
   *     - Restricted
   *     summary: Make a transaction
   *     description: ''
   *     parameters:
   *     - description: Body can also be list of items showed below
   *       name: body
   *       in: body
   *       required: true
   *       schema:
   *         properties:
   *           username:
   *             "$ref": "#/definitions/username"
   *           amount:
   *             "$ref": "#/definitions/amount"
   *     responses:
   *       '200':
   *         description: Return list of users with their new saldo in the group
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: array
   *               items:
   *                 "$ref": "#/definitions/userWithSaldo"
   *
   * /global/transaction:
   *   post:
   *     tags:
   *     - Global
   *     summary: Make a transaction
   *     description: ''
   *     parameters:
   *     - description: Body can also be list of items showed below
   *       name: body
   *       in: body
   *       required: true
   *       schema:
   *         properties:
   *           username:
   *             "$ref": "#/definitions/username"
   *           groupName:
   *             "$ref": "#/definitions/groupName"
   *           amount:
   *             "$ref": "#/definitions/amount"
   *     responses:
   *       '200':
   *         description: Return list of users with their new saldo in the group
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: array
   *               items:
   *                 "$ref": "#/definitions/userWithSaldo"
   */
  commonR.post('/transaction', transactionEndpoint.makeTransaction);

  return commonR;
}

// These routes which can be accessed by restricted token
function _restrictedTokenRoutes() {
  const restrictedR = Router();

  // Authorize restricted token
  restrictedR.use((req, res, next) => {
    if (!req.piikki.groupAccess.all) {
      next();
    } else {
      throw badRequest('You tried to access restricted routes without a proper token');
    }
  });

  // Apply common routes
  restrictedR.use(_commonRoutes());

  /**
   *
   */
  restrictedR.get('/group', groupEndpoint.getCurrentGroup);

  /**
   * @swagger
   * /restricted/group/members:
   *   get:
   *     tags:
   *     - Restricted
   *     summary: Get all members of the group
   *     description: ''
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: array
   *               items:
   *                 "$ref": "#/definitions/userWithSaldo"
   */
  restrictedR.get('/group/members', groupEndpoint.getGroupMembers);

  /**
   * @swagger
   * /restricted/group/members/{username}:
   *   get:
   *     tags:
   *     - Restricted
   *     summary: Get user from the group
   *     description: ''
   *     parameters:
   *     - name: username
   *       in: path
   *       required: 'true'
   *       type: string
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               "$ref": "#/definitions/userWithSaldo"
   */
  restrictedR.get('/group/members/:username', groupEndpoint.getGroupMember);

  /**
   * @swagger
   * /restricted/group/removeMember:
   *   delete:
   *     tags:
   *     - Restricted
   *     summary: Remove user from the group
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       required: true
   *       schema:
   *         properties:
   *           username:
   *             "$ref": "#/definitions/username"
   *     responses:
   *       '200':
   *         description: Return removed member's username
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: string
   */
  restrictedR.delete('/group/removeMember', groupEndpoint.removeMember);

  /**
   * @swagger
   * /restricted/group/addMember:
   *   post:
   *     tags:
   *     - Restricted
   *     summary: TODO
   */
  restrictedR.post('/group/addMember', groupEndpoint.addMember);

  /**
   * @swagger
   * /restricted/group/transactions:
   *   get:
   *     tags:
   *     - Restricted
   *     summary: TODO
   */
  restrictedR.get('/group/transactions', transactionEndpoint.getGroupTransactions);

  /**
   * @swagger
   * /restricted/group/transactions/{username}:
   *   get:
   *     tags:
   *     - Restricted
   *     summary: TODO
   */
  restrictedR.get('/group/transactions/:username', transactionEndpoint.getUserTransactionsFromGroup);

  /**
   * @swagger
   * /restricted/group/saldo:
   *   get:
   *     tags:
   *     - Restricted
   *     summary: TODO
   */
  restrictedR.get('/group/saldo', transactionEndpoint.getGroupSaldo);

  /**
   * @swagger
   * /restricted/group/daily:
   *   get:
   *     tags:
   *     - Restricted
   *     summary: TODO
   */
  restrictedR.get('/group/saldo/daily', transactionEndpoint.getDailyGroupSaldos);

  return restrictedR;
}

// These routes which can be accessed by global token
function _globalTokenRoutes() {
  const globalR = Router();

  // Authorize global token
  globalR.use((req, res, next) => {
    if (req.piikki.groupAccess.all) {
      next();
    } else {
      throw badRequest('You tried to access global routes without a proper token');
    }
  });

  // If client targets some group, insert the group name to request
  // so endpoint functions can look the group name from the same place
  globalR.param('groupName', (req, res, next, name) => {
    req.piikki.groupAccess.group.name = name;
    next();
  });

  // Apply common routes
  globalR.use(_commonRoutes());

  /**
   * @swagger
   * /global/users:
   *   get:
   *     tags:
   *     - Global
   *     summary: Get all users
   *     description: ''
   *     responses:
   *       '200':
   *         description: Return all users and their saldos in each group
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: array
   *               items:
   *                 properties:
   *                   username:
   *                     type: string
   *                   saldos:
   *                     properties:
   *                       "[groupName1]":
   *                         type: number
   *                       "[groupName2]":
   *                         type: number
   *
   *   delete:
   *     tags:
   *     - Global
   *     summary: Delete user
   *     description: ''
   *     operationId: for the URL
   *     produces:
   *     - application/json
   *     parameters:
   *     - name: body
   *       in: body
   *       description: ''
   *       required: true
   *       schema:
   *         properties:
   *           username:
   *             "$ref": "#/definitions/username"
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties: {}
   */
  globalR.get('/users', userEndpoint.getUsers);

  /**
   * @swagger
   * /global/users/{username}:
   *   get:
   *     tags:
   *     - Global
   *     summary: Get user
   *     description: ''
   *     parameters:
   *     - name: username
   *       in: path
   *       description: User's username
   *       required: true
   *       type: string
   *     responses:
   *       '200':
   *         description: Returns user and his/her saldos in each group
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties:
   *                 username:
   *                   type: string
   *                 saldos:
   *                   properties:
   *                     "[groupName1]":
   *                       type: number
   *                     "[groupName2]":
   *                       type: number
   */
  globalR.get('/users/:username', userEndpoint.getUser);

  /**
   * @swagger
   * /global/users/{username}/defaultgroup:
   *   post:
   *     tags:
   *     - Global
   *     summary: TODO
   */
  globalR.post('/users/:username/defaultGroup', userEndpoint.setDefaultGroup);

  /**
   * @swagger
   * /global/users/{username}/defaultgroup:
   *   delete:
   *     tags:
   *     - Global
   *     summary: TODO
   */
  globalR.delete('/users/:username/defaultGroup', userEndpoint.resetDefaultGroup);

  /**
   * @swagger
   * /global/users/{username}/defaultgroup:
   *   delete:
   *     tags:
   *     - Global
   *     summary: TODO
   */
  globalR.delete('/users', userEndpoint.deleteUser);

  /**
   * @swagger
   * /global/groups:
   *   get:
   *     tags:
   *     - Global
   *     summary: Get all groups
   *     description: ''
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: array
   *               items:
   *                 properties:
   *                   id:
   *                     type: integer
   *                   groupName:
   *                     type: string
   */
  globalR.get('/groups', groupEndpoint.getGroups);

  /**
   * @swagger
   * /global/groups/{identifier}:
   *   post:
   *     tags:
   *     - Global
   *     summary: Get group
   *     description: Get group by name or ID
   *     parameters:
   *     - name: identifier
   *       in: path
   *       description: Group name or ID
   *       required: true
   *       type: string
   *     responses:
   *        '200':
   *          schema:
   *            properties:
   *              ok:
   *                type: boolean
   *              result:
   *                properties:
   *                  id:
   *                    type: integer
   *                  name:
   *                    type: string
   *                  private:
   *                    type: boolean
   */
  globalR.get('/groups/:identifier', groupEndpoint.getGroup);

  /**
   * @swagger
   * /global/groups/create:
   *   post:
   *     tags:
   *     - Global
   *     summary: Create a group
   *     description: ''
   *     parameters: []
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties: {}
   */
  globalR.post('/groups/create', groupEndpoint.createGroup);

  /**
   * @swagger
   * /global/groups/{groupName}/members:
   *   get:
   *     tags:
   *     - Global
   *     produces:
   *     - application/json
   *     summary: Get all members of the group
   *     description: ''
   *     parameters:
   *     - name: groupName
   *       in: path
   *       description: Group name
   *       required: true
   *       type: string
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: array
   *               items:
   *                 "$ref": "#/definitions/userWithSaldo"
   */
  globalR.get('/groups/:groupName/members', groupEndpoint.getGroupMembers);

  /**
   * @swagger
   * /global/groups/{groupName}/members/{username}:
   *   get:
   *     tags:
   *     - Global
   *     summary: Get user from the group
   *     description: ''
   *     parameters:
   *     - name: groupName
   *       in: path
   *       description: Group name
   *       required: true
   *       type: string
   *     - name: username
   *       in: path
   *       description: User's username
   *       required: true
   *       type: string
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               "$ref": "#/definitions/userWithSaldo"
   */
  globalR.get('/groups/:groupName/members/:username', groupEndpoint.getGroupMember);

  /**
   * @swagger
   * /global/groups/{groupName}/addMember:
   *   post:
   *     tags:
   *     - Global
   *     summary: Add user to the group
   *     description: ''
   *     parameters:
   *     - name: groupName
   *       in: path
   *       description: Group name
   *       required: true
   *       type: string
   *     responses:
   *       '200':
   *         description: Return added member's username
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: string
   */
  globalR.post('/groups/:groupName/addMember', groupEndpoint.addMember);

  /**
   * @swagger
   * /global/groups/{groupName}/removeMember:
   *   delete:
   *     tags:
   *     - Global
   *     summary: Remove member from the group
   *     description: ''
   *     parameters:
   *     - name: groupName
   *       in: path
   *       description: Group name
   *       required: true
   *       type: string
   *     responses:
   *       '200':
   *         description: Return removed member's username
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: string
   */
  globalR.delete('/groups/:groupName/removeMember', groupEndpoint.removeMember);

  /**
   * @swagger
   * /global/groups/{groupName}/saldo:
   *   get:
   *     tags:
   *     - Global
   *     summary: TODO
   */
  globalR.get('/groups/:groupName/saldo', transactionEndpoint.getGroupSaldo);

  /**
   * @swagger
   * /global/groups/{groupName}/saldo/daily:
   *   get:
   *     tags:
   *     - Global
   *     summary: TODO
   */
  globalR.get('/groups/:groupName/saldo/daily', transactionEndpoint.getDailyGroupSaldos);

  /**
   * @swagger
   * /global/transactions/user/{username}:
   *   get:
   *     tags:
   *     - Global
   *     summary: TODO
   */
  globalR.get('/transactions/user/:username', transactionEndpoint.getUserTransactions);

  /**
   * @swagger
   * /global/transactions/group/{groupName}:
   *   get:
   *     tags:
   *     - Global
   *     summary: TODO
   */
  globalR.get('/transactions/group/:groupName', transactionEndpoint.getGroupTransactions);

  return globalR;
}

// These routes which can be accessed by admin token
function _adminTokenRoutes() {
  const adminR = Router();

  // Authorize admin token
  adminR.use((req, res, next) => {
    if (req.piikki.admin.isAdmin) {
      next();
    } else {
      throw badRequest('You tried to access admin routes without a proper token');
    }
  });

  adminR.get('/tokens', adminEndpoint.getTokens);

  /**
   * @swagger
   * /admin/tokens/global:
   *   post:
   *     tags:
   *     - Admin
   *     summary: Create global token
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       description: Comment for the token
   *       schema:
   *         "$ref": "#/definitions/comment"
   *     responses:
   *       '200':
   *         description: Returns the created token
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: string
   */
  adminR.post('/tokens/global', adminEndpoint.createGlobalToken);

  /**
   * @swagger
   * /admin/tokens/restricted:
   *   post:
   *     tags:
   *     - Admin
   *     summary: Create restricted token
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       description: Comment for the token
   *       schema:
   *         properties:
   *           groupName:
   *             type: string
   *           comment:
   *             type: string
   *     responses:
   *       '200':
   *         description: Returns the created token
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: string
   */
  adminR.post('/tokens/restricted', adminEndpoint.createRestrictedToken);

  /**
   * @swagger
   * /admin/tokens/admin:
   *   post:
   *     tags:
   *     - Admin
   *     summary: Create admin token
   *     description: ''
   *     parameters:
   *     - name: body
   *       in: body
   *       description: Comment for the token
   *       schema:
   *         "$ref": "#/definitions/comment"
   *     responses:
   *       '200':
   *         description: Returns the created token
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               type: string
   */
  adminR.post('/tokens/admin', adminEndpoint.createAdminToken);

  /**
   * @swagger
   * /admin/tokens:
   *   delete:
   *     tags:
   *     - Admin
   *     summary: Delete token
   *     description: ''
   *     parameters: []
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties: {}
   */
  adminR.delete('/tokens', adminEndpoint.deleteToken);

  /**
   * @swagger
   * /admin/users/force-reset/password:
   *   post:
   *     tags:
   *     - Admin
   *     summary: Force-reset user password
   *     description: Reset user password without needing the old one
   *     parameters: []
   *     responses:
   *       '200':
   *         description: ''
   *         schema:
   *           properties:
   *             ok:
   *               type: boolean
   *             result:
   *               properties: {}
   */
  adminR.put('/users/force-reset/password', userEndpoint.forceResetPassword);

  return adminR;
}

/**
 * @swagger
 * definitions:
 *   username:
 *     required: true
 *     type: string
 *     example: mr_awesome
 *   groupName:
 *     required: true
 *     type: string
 *     example: group1
 *   password:
 *     required: true
 *     type: string
 *     example: p4ssw0rd
 *   amount:
 *     required: true
 *     type: number
 *     example: 4
 *   comment:
 *     properties:
 *       comment:
 *         required: false
 *         type: string
 *         example: This token is reserved for the special one
 *   user:
 *     properties:
 *       username:
 *         "$ref": "#/definitions/username"
 *       password:
 *         "$ref": "#/definitions/password"
 *   userWithSaldo:
 *     properties:
 *       username:
 *         "$ref": "#/definitions/username"
 *       saldo:
 *         type: number
 */
