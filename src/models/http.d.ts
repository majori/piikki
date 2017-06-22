import { IDatabaseToken } from './database';
import { Request, Response } from 'express';

// Extend Express own request object with additional info
export interface IExtendedRequest extends Request {
  insights: {
    startTime: number;
  };

  piikki: {
    token: IDatabaseToken;
    groupAccess: {
      all: boolean;
      group: {
        name: string | null;
      },
    },
    admin: {
      isAdmin: boolean;
    },
  };
}

export type EndpointFunction = (req: IExtendedRequest, res: Response) => Promise<any>;
