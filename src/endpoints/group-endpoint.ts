import { NextFunction, Request, Response } from 'express';

import * as groupCore from '../core/group-core';
import { badRequestError, createJsonRoute, validateGroupName} from './endpoint-utils';

export const createGroup = createJsonRoute((req: Request, res: Response, next: NextFunction): Promise<any> => {
    let group: any = req.body;

    return validateGroupName(group.groupName)
    .then((vGroupName) => groupCore.createGroup(vGroupName))
    .catch((err) => badRequestError(err));
});
