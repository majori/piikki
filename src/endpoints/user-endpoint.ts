import { NextFunction, Request, Response } from 'express';

import * as userCore from '../core/user-core';
import { badRequestError, createJsonRoute, validateUser, validateUsername} from './endpoint-utils';

export const getUsers = createJsonRoute((req: Request, res: Response, next: NextFunction): Promise<any> => {
    return userCore.getUsers();
});

export const getUser = createJsonRoute((req: Request, res: Response, next: NextFunction): Promise<any> => {
    let username: any = req.params.username;

    return validateUsername(username)
    .then((vUsername) => userCore.getUser(vUsername))
    .catch((err) => Promise.reject(badRequestError(err)));
}); 

export const createUser = createJsonRoute((req: Request, res: Response, next: NextFunction): Promise<any> => {
    let user: any = req.body;

    return validateUser(user)
    .then((vUser) => userCore.createUser(vUser))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const authenticateUser = createJsonRoute((req: Request, res: Response, next: NextFunction): Promise<any> => {
    let user: any = req.body;

    return validateUser(user)
    .then((vUser) => userCore.authenticateUser(vUser))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const deleteUser = createJsonRoute((req: Request, res: Response, next: NextFunction): Promise<any> => {
    let user: any = req.body;

    return validateUsername(user.username)
    .then((vUsername) => userCore.deleteUser(vUsername))
});
