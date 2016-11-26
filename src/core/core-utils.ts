import * as Promise from 'bluebird';
import * as _ from 'lodash';

export const saltRounds = 10;

export interface IUser {
    username: string;
    password?: string;
};