import * as Promise from 'bluebird';
import { NextFunction, Response } from 'express';
import { IExtendedRequest } from '../app';

import * as userCore from '../core/user-core';
import { badRequestError, createJsonRoute, validateUser, validateUsername, validateGroupName} from './endpoint-utils';

export const getUsers = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {
    return userCore.getUsers();
});

export const getUser = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {
    let username: any = req.params.username;

    return validateUsername(username)
    .then((vUsername) => userCore.getUser(vUsername))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const createUser = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {
    let user: any = req.body;

    return validateUser(user)
    .then((vUser) => userCore.createUser(vUser))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const authenticateUser = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {
    let user: any = req.body;

    return validateUser(user)
    .then((vUser) => userCore.authenticateUser(vUser))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const deleteUser = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {
    let user: any = req.body;

    return validateUsername(user.username)
    .then((vUsername) => userCore.deleteUser(vUsername))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const putUserToGroup = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {
    let params: any = req.body;
    params.groupName = (req.groupAccess.group.name) ? req.groupAccess.group.name : params.groupName;

    return Promise.all([
        validateUsername(params.username),
        validateGroupName(params.groupName)
    ])
    .spread((vUsername: string, vGroupName: string) => userCore.createSaldoForUser(vUsername, vGroupName))
    .catch((err) => Promise.reject(badRequestError(err)));
});