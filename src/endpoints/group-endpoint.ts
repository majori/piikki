import { NextFunction, Request, Response } from 'express';
import { IExtendedRequest } from '../app';
import * as Promise from 'bluebird';

import * as groupCore from '../core/group-core';
import * as userCore from '../core/user-core';
import { badRequestError, createJsonRoute, validateGroupName, validateUsername} from './endpoint-utils';

export const createGroup = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {
    let group: any = req.body;

    return validateGroupName(group.groupName)
    .then((vGroupName) => groupCore.createGroup(vGroupName))
    .catch((err) => badRequestError(err));
});

export const addMember = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {
    let groupName = (req.groupAccess.group.name) ? req.groupAccess.group.name : req.params.groupName;

    return Promise.all([
        validateUsername(req.body.username),
        validateGroupName(groupName)
    ])
    .spread((vUsername: string, vGroupName: string) => groupCore.addUserToGroup(vUsername, vGroupName))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const removeMember = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {
    let groupName = (req.groupAccess.group.name) ? req.groupAccess.group.name : req.params.groupName;

    return Promise.all([
        validateUsername(req.body.username),
        validateGroupName(groupName)
    ])
    .spread((vUsername: string, vGroupName: string) => groupCore.removeUserFromGroup(vUsername, vGroupName))
    .catch((err) => Promise.reject(badRequestError(err)));
});

export const getGroups = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {
    return groupCore.getGroups();
});

export const getGroupMembers = createJsonRoute((req: IExtendedRequest, res: Response, next: NextFunction) => {

    return validateGroupName(req.params.groupName)
        .then((vGroupName) => groupCore.getUsersFromGroup(vGroupName));
});