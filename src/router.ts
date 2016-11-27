import { Router } from 'express';
import * as _ from 'lodash';

import * as transactionEndpoint from './endpoints/transaction-endpoint';
import * as usersEndpoint from './endpoints/user-endpoint';

export function createRouter() {
    const router = Router();

    // User related
    router.get('/users', usersEndpoint.getUsers);
    router.get('/users/:username', usersEndpoint.getUser);
    router.post('/users/create', usersEndpoint.createUser);
    router.post('/users/authenticate', usersEndpoint.authenticateUser);
    router.delete('/users', usersEndpoint.deleteUser);

    // Transaction related
    router.post('/transaction', transactionEndpoint.makeTransaction);

    return router;
};
