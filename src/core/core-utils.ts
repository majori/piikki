import * as Promise from 'bluebird';
import * as _ from 'lodash';

export const saltRounds = 10;

export interface IUserDto {
    username: string;
    password?: string;
};