import { Router } from 'express';

import groupEndpoint from './endpoints/group-endpoint';
import transactionEndpoint from './endpoints/transaction-endpoint';
import userEndpoint from './endpoints/user-endpoint';

export function createRouter() {
    const router = Router();

    // User related
    router.get('/users', userEndpoint.getUsers);
    router.get('/users/:username', userEndpoint.getUser);
    router.post('/users/create', userEndpoint.createUser);
    router.post('/users/authenticate', userEndpoint.authenticateUser);
    router.delete('/users', userEndpoint.deleteUser);

    // Transaction related
    router.post('/transaction', transactionEndpoint.makeTransaction);

    // Group related
    router.post('/groups', groupEndpoint.createGroup);

    return router;
};
