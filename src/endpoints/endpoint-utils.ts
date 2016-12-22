import * as _ from 'lodash';

import { NextFunction, Request, RequestHandler, Response } from 'express';
import { IUserDto } from '../core/core-utils';

// Wraps the result to json response if succesful
// else pass error to express error handler
export function createJsonRoute(func: Function): RequestHandler {
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

// Check if username and password is valid
export function validateUser(user: IUserDto): Promise<any> {
    if (_.isObject(user) && user.username && user.password) {
        return Promise.all([
            validateUsername(user.username),
            validatePassword(user.password),
        ])
        .then(() => Promise.resolve(user));
    } else {
        return Promise.reject(badRequestError('Invalid user object'));
    }
};

// Check if username is valid
export function validateUsername(username: any): Promise<string> {

    if (!username)               { return Promise.reject(badRequestError('No username')); };
    if (!_.isString(username))   { return Promise.reject(badRequestError('Username was not a string')); };
    if (_.isEmpty(username))     { return Promise.reject(badRequestError('Username was empty')); };
    if (username.length > 20)    { return Promise.reject(badRequestError('Username was longer than 20 characters')); };

    return Promise.resolve(username);
};

// Check if password is valid
export function validatePassword(password: any): Promise<string> {

    if (!_.isString(password)) { return Promise.reject(badRequestError('Password was not a string')); };
    if (_.isEmpty(password))   { return Promise.reject(badRequestError('Password was empty')); };

    return Promise.resolve(password);
};

// Check if transaction amount is valid
export function validateTransactionAmount(amount: any): Promise<string | number> {
    if (_.isUndefined(amount)) { return Promise.reject(badRequestError('Amount was undefined')); }
    if (!_.isNumber(amount))   { return Promise.reject(badRequestError('Amount was not a number')); }

    return Promise.resolve(amount);
};

// Check if group name is valid
export function validateGroupName(name: any): Promise<string> {
    if (_.isUndefined(name)) { return Promise.reject('Group name was undefined') }
    if (!_.isString(name)) { return Promise.reject('Group name was not a string') }
    if (name.length > 255) { return Promise.reject('Group name was longer than 255') }

    return Promise.resolve(name);
};

export function badRequestError(msg: string): IBadRequest {
    return { status: 400, message: msg };
};

interface IHttpError {
    status: number;
    message: string;
};

interface IBadRequest extends IHttpError {
    status: 400;
};
