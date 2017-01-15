import { Router } from 'express';

import { IExtendedRequest } from './app';
import groupEndpoint from './endpoints/group-endpoint';
import transactionEndpoint from './endpoints/transaction-endpoint';
import userEndpoint from './endpoints/user-endpoint';

export function initializeRoutes() {
    const mainRouter = Router();

    mainRouter.use('/restricted', _restrictedTokenRoutes());
    mainRouter.use('/global', _globalTokenRoutes());

    return mainRouter;
};

function _commonRoutes() {
    const commonR = Router();
    commonR.post('/users/create', userEndpoint.createUser);
    commonR.post('/users/authenticate', userEndpoint.authenticateUser);
    commonR.post('/transaction', transactionEndpoint.makeTransaction);

    return commonR;
}

// Group token allowed
function _restrictedTokenRoutes() {
    const restrictedR = Router();

    // Authorize restricted token
    restrictedR.use((req: IExtendedRequest, res, next) => {
        if (!req.groupAccess.all) {
            next();
        } else {
            res.status(401).json({ ok: false, message: 'Unauthorized' });
        }
    });

    restrictedR.use(_commonRoutes());

    // -- /group/removeMember   delete user saldo from group'
    // -- /users/:username // vain oman ryhmän saldo
    // -- /group/members
    // -- /group/addMember

    return restrictedR;
}

// Global token allowed
function _globalTokenRoutes() {
    const globalR = Router();

    // Authorize global token
    globalR.use((req: IExtendedRequest, res, next) => {
        if (req.groupAccess.all) {
            next();
        } else {
            res.status(401).json({ ok: false, message: 'Unauthorized' });
        }
    });

    // If client targets some group, insert the group name to request
    // so endpoint functions can look the group name from the same place
    globalR.param('groupName', (req: IExtendedRequest, res, next, name) => {
        req.groupAccess.group.name = name;
        next();
    });

    globalR.use(_commonRoutes());

    // -- /groups/:groupName/removeMember      delete user saldo from group'
    globalR.get('/users/:username', userEndpoint.getUser);
    globalR.delete('/users', userEndpoint.deleteUser);
    globalR.get('/groups', groupEndpoint.getGroups);
    globalR.post('/groups', groupEndpoint.createGroup);
    globalR.get('/groups/:groupName/members', groupEndpoint.getGroupMembers);
    globalR.post('/groups/:groupName/addMember', groupEndpoint.addMember);

    return globalR;
}
