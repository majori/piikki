import * as Promise from 'bluebird';
import * as _ from 'lodash';

import { IExtendedRequest } from '../app';
import * as tokenCore from '../core/token-core';
import { createJsonRoute, validateGroupName, badRequestError} from './endpoint-utils';

const _endpoint = {
    createGlobalToken: (req: IExtendedRequest) => {
        const comment = req.body.comment;

        return tokenCore.createGlobalToken(comment)
        .catch((err) => Promise.reject(badRequestError(err)));
    },

    createRestrictedToken: (req: IExtendedRequest) => {
        const groupName = req.body.groupName;
        const comment = req.body.comment;

        return validateGroupName(groupName)
        .then(() => tokenCore.createRestrictedToken(groupName, comment))
        .catch((err) => Promise.reject(badRequestError(err)));
    },

    createAdminToken: (req: IExtendedRequest) => {
        const comment = req.body.comment;

        return tokenCore.createAdminToken(comment)
        .catch((err) => Promise.reject(badRequestError(err)));
    },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
