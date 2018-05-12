import * as path from 'path';
import * as _ from 'lodash';
import { Logger as Winston, transports, CLILoggingLevel } from 'winston';
import { Request, Response } from 'express';
import { isBoom } from 'boom';

import { getTokenInfo } from './tokenHandler';
import config from '../config';

export class Logger extends Winston {

  constructor(filePath: string) {
    super();

    const fileName = path.basename(filePath);

    this.configure({
      transports: [
        new transports.Console({
          label: `piikki${fileName ? `-${fileName}` : ''}`,
          timestamp: true,
          colorize: true,
        }),
      ],
    });

    // Suppress console messages when testing
    if (config.isTest && process.env.LOG_LEVEL !== 'debug') {
      this.remove(transports.Console);
    }

    this.setLevelForTransports(config.logLevel);
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
      url: req.originalUrl,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
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
    return isBoom(err) ?
      {
        error: err.output.payload.error,
        message: err.output.payload.message,
        ...err.data,
      } :
      {
        error: 'Internal Server Error',
        message: err.message,
      };
  }

  private setLevelForTransports(level: CLILoggingLevel) {
    _.forEach(this.transports, (transport) => {
      transport.level = level;
    });
  }
}
