import { NextFunction, Request, Response } from 'express';

import * as groupCore from '../core/group-core';
import { badRequestError, createJsonRoute, validateUser, validateUsername} from './endpoint-utils';

export const createGroup = createJsonRoute((req: Request, res: Response, next: NextFunction): Promise<any> => {
    let group: any = req.body;

    return groupCore.createGroup(group.groupName);
});
