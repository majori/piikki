import * as bcrypt from 'bcrypt';
import { QueryBuilder } from 'knex';
import * as _ from 'lodash';

import { ConflictError, NotFoundError } from '../errors';
import { knex, IDatabaseUser, IDatabaseGroup } from '../database';
import { groupExists } from './group-core';

export interface IUserDto {
    username: string;
    password?: string;
};

export const SALT_ROUNDS = 6;

// Get all users in group
export async function getUsers() {
    const results = await _getUsersWithSaldos();

    return _.chain(results)
        .groupBy((x) => x.username)
        .map((x, key) => _.reduce(x, (user: any, value: any) => {
                if (value.groupName) {
                    user.saldos[value.groupName] = value.saldo;
                }
                return user;
            },
            {
                username: key,
                saldos: {},
            })
        )
        .value();
};

// Get user info and saldo in each group
export async function getUser(username: string) {
    const user = { username, saldos: {} };

    await userExists(username);

    // Fetch possible saldos in groups
    const results = await _getUsersWithSaldos().andWhere({ 'users.username': username });
    // There was no saldos, return only user info
    if (_.isEmpty(results)) { return user; };

    // Parse database rows to saldos object
    return _.reduce(results, (result: any, value: any) => {
        if (value.groupName) {
            result.saldos[value.groupName] =  value.saldo;
        }
        return result;
    }, user);
};

// Create new user
export async function createUser(user: IUserDto) {
    const results = await knex.from('users').where({username: user.username});

    if (!_.isEmpty(results)) {
        throw new ConflictError(`Username ${user.username} already exists`);
    }

    const hash = await _hashPassword(user.password);
    await knex.from('users').insert({
        username: user.username,
        password: hash,
    });

    return user.username;
};

// Puts user's "active" -status to false
export async function deleteUser(username: string) {
    await knex.from('users').where({ username }).update({ active: false });
    return;
}

// Compare raw password with the hashed one
export async function authenticateUser(user: IUserDto) {
    const row = await userExists(user.username);

    return await bcrypt.compare(user.password, row.password);
};

// Checks if user is in database
export async function userExists(username: string) {
    const row: IDatabaseUser = await knex.from('users').where({ username }).first();

    if (row) {
        return row;
    } else {
        throw new NotFoundError(`User ${username} not found`);
    }
};

export async function userNotExists(username: string) {
    try {
        await userExists(username);
    } catch (err) {
        if (err instanceof NotFoundError) {
            return true;
        }
    }

    throw new ConflictError(`User ${username} already exists`);
}

export async function resetPassword(user: IUserDto, newPassword: string) {
    const isSame = await authenticateUser(user);

    if (!isSame) {
        throw new ConflictError('Old password did not match');
    }

    const hash = await _hashPassword(newPassword);

    await knex
        .from('users')
        .where({ username: user.username })
        .update({ password: hash })

    return;
};

// This function doesn't require old password.
// Currently only admin can use
export async function forceResetPassword(username: string, password: string) {
    await userExists(username);
    const hash = await _hashPassword(password);
    await knex
        .from('users')
        .where({ username })
        .update({ password: hash })

    return;
}

export async function resetUsername(oldUsername: string, newUsername: string) {
    await userExists(oldUsername);
    await userNotExists(newUsername); // Check if new username doesn't exists
    await knex
        .from('users')
        .where({ username: oldUsername })
        .update({ username: newUsername });

    return { username: newUsername };
};

// Get all users in group
export function _getUsersWithSaldos(): QueryBuilder {
    return knex
        .from('users')
        .leftJoin('user_saldos', { 'user_saldos.user_id': 'users.id' })
        .leftJoin('groups', { 'groups.id': 'user_saldos.group_id' })
        .select('users.username', 'groups.name AS groupName', 'user_saldos.saldo')
        .where({ 'users.active': true });
};

async function _hashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
}
