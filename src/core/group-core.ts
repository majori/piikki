import { QueryBuilder } from 'knex';
import * as _ from 'lodash';

import { knex, IDatabaseGroup } from '../database';

export function createGroup(groupName: String): QueryBuilder {
    return knex('groups').insert({ name: groupName });
};

export function groupExists(groupName: String): Promise<any> {
    return knex('groups').where({ name: groupName }).first()
        .then((row: IDatabaseGroup) => _.isUndefined(row) ?
            Promise.reject(`Group ${groupName} not found`) :
            Promise.resolve(row)
        );
};
