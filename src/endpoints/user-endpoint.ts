import * as Promise from 'bluebird';
import * as _ from 'lodash';
import { NextFunction, Response } from 'express';
import { IExtendedRequest } from '../app';

import * as userCore from '../core/user-core';
import { badRequestError, createJsonRoute, validateUser, validateUsername, validateGroupName} from './endpoint-utils';

const _endpoint = {

    getUsers: (req: IExtendedRequest) => {
        return userCore.getUsers();
    },

    getUser: (req: IExtendedRequest) => {
        let username: any = req.params.username;

        return validateUsername(username)
        .then((vUsername) => userCore.getUser(vUsername))
        .catch((err) => Promise.reject(badRequestError(err)));
    },

    createUser: (req: IExtendedRequest) => {
        let user: any = req.body;

        return validateUser(user)
        .then((vUser: userCore.IUserDto) => userCore.createUser(vUser))
        .catch((err) => Promise.reject(badRequestError(err)));
    },

    authenticateUser: (req: IExtendedRequest) => {
        let user: any = req.body;

        return validateUser(user)
        .then((vUser: userCore.IUserDto) => userCore.authenticateUser(vUser))
        .then((authenticated) => Promise.resolve({ authenticated }))
        .catch((err) => Promise.reject(badRequestError(err)));
    },

    deleteUser: (req: IExtendedRequest) => {
        let user: any = req.body;

        return validateUsername(user.username)
        .then((vUsername) => userCore.deleteUser(vUsername))
        .catch((err) => Promise.reject(badRequestError(err)));
    },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
