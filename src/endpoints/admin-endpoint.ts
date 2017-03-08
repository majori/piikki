import * as Promise from 'bluebird';
import * as _ from 'lodash';

import { IExtendedRequest } from '../app';
import * as tokenCore from '../core/token-core';
import { createJsonRoute, validateGroupName, badRequestError} from './endpoint-utils';

const _endpoint = {
    createGlobalToken: (req: IExtendedRequest) => {
        const comment = req.body.comment;

        return tokenCore.createGlobalToken(comment);
    },

    createRestrictedToken: (req: IExtendedRequest) => {
        const groupName = req.body.groupName;
        const comment = req.body.comment;

        return validateGroupName(groupName)
        .then(() => tokenCore.createRestrictedToken(groupName, comment));
    },

    createAdminToken: (req: IExtendedRequest) => {
        const comment = req.body.comment;

        return tokenCore.createAdminToken(comment);
    },

    deleteToken: (req: IExtendedRequest) => {
        const token = req.body.token;

        return tokenCore.deleteToken(token)
            .then((count) => Promise.resolve({ count }));
    },

};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
