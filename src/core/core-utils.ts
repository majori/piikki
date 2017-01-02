import * as Promise from 'bluebird';
import * as _ from 'lodash';

export const saltRounds = 6;

export interface IUserDto {
    username: string;
    password?: string;
};