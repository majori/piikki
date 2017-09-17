import * as path from 'path';
import * as _ from 'lodash';
import { Logger as Winston, transports, LoggerInstance, CLILoggingLevel } from 'winston';
import { Response } from 'express';

import { getTokenInfo } from './tokenHandler';
import { IExtendedRequest as Request } from './models/http';

export class Logger extends Winston {

  constructor(filePath: string) {
    const fileName = path.basename(filePath);
    super({
      transports: [
        new transports.Console({
          label: `piikki${fileName ? `-${fileName}` : ''}`,
          timestamp: true,
        }),
      ],
    });

    this.setLevelForTransports(process.env.LOG_LEVEL || 'info');
  }

  public request(req: Request, res: Response) {
    this.debug('Request', {
      request: this.getRequestMetadata(req),
      response: this.getResponseMetadata(res),
    });
  }

  public errorRequest(req: Request, res: Response, err: Error) {
    this.error('Error request', {
      request: this.getRequestMetadata(req),
      response: this.getResponseMetadata(res),
      error: this.getErrorMetadata(err),
    });
  }

  private getRequestMetadata(req: Request) {
    return {
      response_time: _.get(req, 'insights.startTime') ? (Date.now() - req.insights.startTime) : 0,
      token: getTokenInfo(req),
    };
  }

  private getResponseMetadata(res: Response) {
    return {
      status_code: res.statusCode,
    };
  }

  private getErrorMetadata(err: Error) {
    return {
      name: err.name,
      message: err.message,
    };
  }

  private setLevelForTransports(level: CLILoggingLevel) {
    _.forEach(this.transports, (transport) => {
      transport.level = level;
    });
  }
}
