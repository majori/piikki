import { Request, Response } from 'express';

import * as userCore from '../core/user-core';
import { badRequestError, createJsonRoute, validateUser, validateUsername} from './endpoint-utils';

export const getUsers = createJsonRoute((req, res, next) => {
    return userCore.getUsers();
});

export const getUser = createJsonRoute((req, res, next) => {
    let username: string = req.params.username;

    return validateUsername(username)
    .then(() => userCore.getUser(username))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const createUser = createJsonRoute((req, res, next) => {
    let user = req.body;

    return validateUser(user)
    .then(() => userCore.createUser(user))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const authenticateUser = createJsonRoute((req, res, next) => {
    let user = req.body;

    return validateUser(user)
    .then(() => userCore.authenticateUser(user))
    .catch((err) => Promise.reject(badRequestError(err)));
});
