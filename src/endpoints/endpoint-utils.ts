import * as _ from 'lodash';

import { NextFunction, Request, Response } from 'express';
import { IUser } from '../core/core-utils';

// Wraps the result to json response if succesful
// else pass error to express error handler
export function createJsonRoute(func: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            func(req, res)
                .then((result) => res.json({ ok: true, result }))
                .catch(next);
        } catch (err) {
            next(err);
        }
    };
}

export function validateUser(user: IUser): Promise<[string | void]> {
    if (_.isObject(user) && user.username && user.password) {
        return Promise.all([
            validateUsername(user.username),
            validatePassword(user.password),
        ]);
    } else {
        return Promise.reject(badRequestError('Invalid user object'));
    }
};

// Check if username is valid
export function validateUsername(username: any): Promise<string | void> {

    if (!username)               { return Promise.reject(badRequestError('No username')); };
    if (!_.isString(username))   { return Promise.reject(badRequestError('Username was not a string')); };
    if (_.isEmpty(username))     { return Promise.reject(badRequestError('Username was empty')); };
    if (username.length > 20)    { return Promise.reject(badRequestError('Username was longer than 20 characters')); };

    return Promise.resolve(username);
};

export function validatePassword(password: any): Promise<string | void> {

    if (!_.isString(password)) { return Promise.reject(badRequestError('Password was not a string')); };
    if (_.isEmpty(password)) { return Promise.reject(badRequestError('Password was empty')); };

    return Promise.resolve();
};

export function validateUserId(id: any): Promise<string | void> {
    return _.isString(id) ? Promise.resolve() : Promise.reject(badRequestError('User ID was not a string'));
};

export function validateTransactionAmount(amount: any) {
    if (_.isUndefined(amount)) { return Promise.reject(badRequestError('Amount was undefined')); }
    if (!_.isNumber(amount)) { return Promise.reject(badRequestError('Amount was not a number')); }

    return Promise.resolve();
}

export function badRequestError(msg: string) {
    return { status: 400, message: msg };
}