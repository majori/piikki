import * as Promise from 'bluebird';
import * as _ from 'lodash';
import { NextFunction, Response } from 'express';
import { IExtendedRequest } from '../app';

import * as userCore from '../core/user-core';
import { ConflictError } from '../errors';
import { createJsonRoute, validateUser, validateUsername, validateGroupName, validatePassword} from './endpoint-utils';

const _endpoint = {

    getUsers: (req: IExtendedRequest) => {
        return userCore.getUsers();
    },

    getUser: (req: IExtendedRequest) => {
        let username: any = req.params.username;

        return validateUsername(username)
        .then((vUsername) => userCore.getUser(vUsername));
    },

    createUser: (req: IExtendedRequest) => {
        let user: any = req.body;

        return validateUser(user)
        .then((vUser: userCore.IUserDto) => userCore.createUser(vUser));
    },

    authenticateUser: (req: IExtendedRequest) => {
        let user: any = req.body;

        return validateUser(user)
        .then((vUser: userCore.IUserDto) => userCore.authenticateUser(vUser))
        .then((authenticated) => Promise.resolve({ authenticated }));
    },

    deleteUser: (req: IExtendedRequest) => {
        const user: any = req.body;

        return validateUsername(user.username)
        .then((vUsername) => userCore.deleteUser(vUsername));
    },

    resetPassword: (req: IExtendedRequest) => {
        const user: userCore.IUserDto = {
            username: req.body.username,
            password: req.body.oldPassword,
        };
        const newPassword = req.body.newPassword;

        return Promise.all([
            validateUser(user),
            validatePassword(newPassword),
        ]).spread((vUser: userCore.IUserDto, vPassword: string) => userCore
            .resetPassword(vUser, vPassword)
        );
    },

    forceResetPassword: (req: IExtendedRequest) => {
        const username = req.body.username;
        const newPassword = req.body.newPassword;

        return Promise.all([
            validateUsername(username),
            validatePassword(newPassword),
        ]).then(() => userCore.forceResetPassword(username, newPassword));
    },

    resetUsername: (req: IExtendedRequest) => {
        const oldUsername = req.body.oldUsername;
        const newUsername = req.body.newUsername;
        const password = req.body.password;

        return Promise.all([
            validateUsername(oldUsername),
            validateUsername(newUsername),
        ])
        .then(() => userCore.authenticateUser({ username: oldUsername, password }))
        .then((auth) => auth ?
            userCore.resetUsername(oldUsername, newUsername) :
            Promise.reject(new ConflictError('Invalid password'))
        ); 
    },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
