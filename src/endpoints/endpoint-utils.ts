import * as _ from 'lodash';
import * as moment from 'moment';
import * as Promise from 'bluebird';
import appInsights = require('applicationinsights');
import { NextFunction, Request, RequestHandler, Response } from 'express';

import { IExtendedRequest } from '../app';
import { IUserDto } from '../core/user-core';
import { ValidationError } from '../errors';

const reject = Promise.reject;

// Wraps the result to json response if succesful
// else pass error to express error handler
export function createJsonRoute(func: Function): RequestHandler {
    return (req: IExtendedRequest, res: Response, next: NextFunction) => {
        try {
            func(req, res)
                .then((result) => {
                    const response = { ok: true, result: result || {} };

                    // Track a succesful request
                    const responseTime =  Date.now() - req.insights.startTime;
                    appInsights.client.trackRequestSync(req, res, responseTime, { response: JSON.stringify(response) });

                    // Send the response
                    res.json(response);
                })
                .catch(next);
        } catch (err) {
            appInsights.client.trackException(err);
            next(err);
        }
    };
}

// Check if username and password is valid
export function validateUser(user: IUserDto): Promise<any> {
    if (!_.isObject(user)) {
        return reject(new ValidationError('Invalid user object'));
    }

    return Promise.all([
        validateUsername(user.username),
        validatePassword(user.password),
    ])
    .then(() => Promise.resolve(user));
};

// Check if username is valid
export function validateUsername(username: any): Promise<string> {

    if (_.isUndefined(username)) { return reject(new ValidationError('No username defined')); };
    if (!_.isString(username))   { return reject(new ValidationError(`Username ${username} was not a string`)); };
    if (_.isEmpty(username))     { return reject(new ValidationError('Username was empty')); };
    if (username.length > 20)    { return reject(new ValidationError('Username was longer than 20 characters')); };

    return Promise.resolve(username);
};

// Check if password is valid
export function validatePassword(password: any): Promise<string> {

    if (_.isUndefined(password)) { return reject(new ValidationError('No password defined')); };
    if (!_.isString(password)) { return reject(new ValidationError(`Password ${password} was not a string`)); };
    if (_.isEmpty(password))   { return reject(new ValidationError('Password was empty')); };

    return Promise.resolve(password);
};

// Check if transaction amount is valid
export function validateTransactionAmount(amount: any): Promise<string | number> {
    if (_.isUndefined(amount)) { return reject(new ValidationError('Amount was undefined')); }
    if (!_.isNumber(amount))   { return reject(new ValidationError(`Amount "${amount}" was not a number`)); }

    return Promise.resolve(amount);
};

// Check if group name is valid
export function validateGroupName(name: any): Promise<string> {
    if (_.isUndefined(name)) { return reject(new ValidationError('Group name was undefined')); }
    if (!_.isString(name))   { return reject(new ValidationError(`Group name "${name}" was not a string`)); }
    if (name.length > 255)   { return reject(new ValidationError('Group name was longer than 255')); }

    return Promise.resolve(name);
};

export function validateTimestamp(timestamp: any) {
    const parsed = moment(timestamp);

    return (parsed.isValid()) ? parsed : undefined;
};
