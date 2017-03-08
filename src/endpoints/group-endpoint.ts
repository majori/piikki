import * as Promise from 'bluebird';
import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';

import { IExtendedRequest } from '../app';
import * as groupCore from '../core/group-core';
import * as userCore from '../core/user-core';
import { IDatabaseGroup, IDatabaseUser } from '../database';
import { badRequestError, createJsonRoute, validateGroupName, validateUsername} from './endpoint-utils';

const _endpoint = {
    createGroup: (req: IExtendedRequest) => {
        let group: any = req.body;
        return validateGroupName(group.groupName)
            .then((vGroupName) => groupCore.createGroup(vGroupName));
    },

    addMember: (req: IExtendedRequest) => {
        let groupName = req.piikki.groupAccess.group.name;

        return Promise.all([
            validateUsername(req.body.username),
            validateGroupName(groupName)
        ])
        .spread((vUsername: string, vGroupName: string) => groupCore.addUserToGroup(vUsername, vGroupName));
    },

    removeMember: (req: IExtendedRequest) => {
        let groupName = req.piikki.groupAccess.group.name;

        return Promise.all([
            validateUsername(req.body.username),
            validateGroupName(groupName)
        ])
        .spread((vUsername: string, vGroupName: string) => groupCore.removeUserFromGroup(vUsername, vGroupName));
    },

    getGroups: (req: IExtendedRequest) => {
        return groupCore.getGroups();
    },

    getGroupMembers: (req: IExtendedRequest) => {
        let groupName = req.piikki.groupAccess.group.name;

        return validateGroupName(groupName)
            .then((vGroupName) => {
                return groupCore.groupExists(vGroupName)
                    .then(() => groupCore.getUsersFromGroup(vGroupName));
            });
    },

    getGroupMember: (req: IExtendedRequest) => {
        let groupName = req.piikki.groupAccess.group.name;

        return Promise.all([
                validateUsername(req.params.username),
                validateGroupName(groupName)
            ])
            .spread((vUsername: string, vGroupName: string) => groupCore.userIsInGroup(vUsername, groupName))
            .then((res: { user: IDatabaseUser, group: IDatabaseGroup }) =>
                groupCore.getUserFromGroup(res.group.name, res.user.username)
            );
    },
};

// Wrap endpoint to produce JSON route
export default _.mapValues(_endpoint, (func) => createJsonRoute(func));
