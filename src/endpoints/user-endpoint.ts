import { Request, Response } from 'express';

import * as userCore from '../core/user-core';
import { badRequestError, createJsonRoute, validateUser, validateUsername} from './endpoint-utils';

export const getUsers = createJsonRoute((req, res, next) => {
    return userCore.getUsers();
});

export const getUser = createJsonRoute((req, res, next) => {
    let username: any = req.params.username;

    return validateUsername(username)
    .then((vUsername) => userCore.getUser(vUsername))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const createUser = createJsonRoute((req, res, next) => {
    let user: any = req.body;

    return validateUser(user)
    .then((vUser) => userCore.createUser(vUser))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const authenticateUser = createJsonRoute((req, res, next) => {
    let user: any = req.body;

    return validateUser(user)
    .then((vUser) => userCore.authenticateUser(vUser))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const deleteUser = createJsonRoute((req, res, next) => {
    let user: any = req.body;

    return validateUsername(user.username)
    .then((vUsername) => userCore.deleteUser(vUsername))
});