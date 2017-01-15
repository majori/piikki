import { Router } from 'express';
import * as Debug from 'debug';

import { IExtendedRequest } from './app';
import groupEndpoint from './endpoints/group-endpoint';
import transactionEndpoint from './endpoints/transaction-endpoint';
import userEndpoint from './endpoints/user-endpoint';

const debug = Debug('piikki:router');

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

// These routes which can be accessed by restricted token
function _restrictedTokenRoutes() {
    const restrictedR = Router();

    // Authorize restricted token
    restrictedR.use((req: IExtendedRequest, res, next) => {
        if (!req.groupAccess.all) {
            next();
        } else {
            debug('Denied access to restricted routes');
            res.status(401).json({ ok: false, message: 'You tried to access restricted routes with global token' });
        }
    });

    // Apply common routes
    restrictedR.use(_commonRoutes());

    restrictedR.get('/group/members', groupEndpoint.getGroupMembers);
    restrictedR.get('/group/members/:username', groupEndpoint.getGroupMember);
    restrictedR.delete('/group/removeMember', groupEndpoint.removeMember);
    restrictedR.post('/group/addMember', groupEndpoint.addMember);

    return restrictedR;
}

// These routes which can be accessed by global token
function _globalTokenRoutes() {
    const globalR = Router();

    // Authorize global token
    globalR.use((req: IExtendedRequest, res, next) => {
        if (req.groupAccess.all) {
            next();
        } else {
            debug('Denied access to global routes');
            res.status(401).json({ ok: false, message: 'You tried to access global routes with restricted token' });
        }
    });

    // If client targets some group, insert the group name to request
    // so endpoint functions can look the group name from the same place
    globalR.param('groupName', (req: IExtendedRequest, res, next, name) => {
        if (name) { debug(`Found group name parameter in url: ${name}`)}
        req.groupAccess.group.name = name;
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
    globalR.delete('/groups/:groupName/removeMember', groupEndpoint.removeMember);

    return globalR;
}
