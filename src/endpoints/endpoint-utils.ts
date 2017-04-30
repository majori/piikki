import * as _ from 'lodash';
import * as moment from 'moment';
import appInsights = require('applicationinsights');
import { NextFunction, Request, RequestHandler, Response } from 'express';

import { IExtendedRequest } from '../app';
import { IUserDto } from '../core/user-core';
import { ValidationError } from '../errors';

const cfg: any = require('../../config'); // tslint:disable-line

// Wraps the result to json response if succesful
// else pass error to express error handler
export function createJsonRoute(func: Function): RequestHandler {
    return async (req: IExtendedRequest, res: Response, next: NextFunction) => {
        try {
            const result = await func(req, res);
            const response = { ok: true, result: result || {} };

            // Set status to OK
            res.status(200);

            // Track a succesful request
            if (cfg.appInsightsKey) {
                appInsights.client.trackRequestSync(req, res, (Date.now() - req.insights.startTime));
            }

            // Send the response
            res.json(response);

        } catch (err) {
            if (cfg.appInsightsKey) {
                appInsights.client.trackException(err);
            }
            next(err);
        }
    };
}

// Check if username and password is valid
export function validateUser(user: IUserDto) {
    if (!_.isObject(user)) {
        throw new ValidationError('Invalid user object');
    }

    try {
        validatePassword(user.password);
        validateUsername(user.username);
    } catch (err) {
        throw err;
    }

    return user;
};

// Check if username is valid
export function validateUsername(username: any): string {
    // Allow a-z, A-Z, 0-9, underscore and hyphen
    const regEx = /^[a-zA-Z0-9-_]+$/;

    if (_.isUndefined(username)) { throw new ValidationError('No username defined'); };
    if (!_.isString(username))   { throw new ValidationError(`Username ${username} was not a string`); };
    if (_.isEmpty(username))     { throw new ValidationError('Username was empty'); };
    if (username.length > 20)    { throw new ValidationError('Username was longer than 20 characters'); };
    if (!regEx.test(username))   {
        throw new ValidationError(
            `Username ${username} had invalid characters.` +
            'Allowed characters are a-z, A-Z, 0-9, "-" and "_".'
        );
    }

    return username;
};

// Check if password is valid
export function validatePassword(password: any): string {

    if (_.isUndefined(password)) { throw new ValidationError('No password defined'); };
    if (!_.isString(password))   { throw new ValidationError(`Password ${password} was not a string`); };
    if (_.isEmpty(password))     { throw new ValidationError('Password was empty'); };

    return password;
};

// Check if transaction amount is valid
export function validateTransactionAmount(amount: any): number {
    if (_.isUndefined(amount)) { throw new ValidationError('Amount was undefined'); }
    if (!_.isNumber(amount))   { throw new ValidationError(`Amount "${amount}" was not a number`); }

    return amount;
};

// Check if group name is valid
export function validateGroupName(name: any): string {
    if (_.isUndefined(name)) { throw new ValidationError('Group name was undefined'); }
    if (!_.isString(name))   { throw new ValidationError(`Group name "${name}" was not a string`); }
    if (name.length > 255)   { throw new ValidationError('Group name was longer than 255'); }

    return name;
};

export function validateTimestamp(timestamp: any) {
    const parsed = moment(timestamp);

    return (parsed.isValid()) ? parsed : undefined;
};
