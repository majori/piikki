/* tslint:disable max-classes-per-file */
import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from 'http';
import { IExtendedRequest } from './models/http';
import * as appInsights from 'applicationinsights';
import * as _ from 'lodash';

export const errorResponder = (err: any, req: IExtendedRequest, res: Response, next: NextFunction) => {
  const status = err.status ? err.status : 500;

  const response = {
    ok: false,
    error: {
      type: (status < 500) ? err.name : STATUS_CODES[status],
      message: (status < 500) ? err.message : '',
    },
  };

  // Set response status
  res.status(status);

  // Track error response
  // Ignore if request is to root (most likely Azure ping service)
  if (req.path !== '/' ) {
    appInsights.client.trackRequestSync(
      req,
      res,
      _.get(req, 'insights.startTime') ? (Date.now() - req.insights.startTime) : 0,
      {
        type: err.name,
        status: err.status || 'Unknown',
        message: err.message,
        stack: JSON.stringify(err.stack),
      },
    );
  }

  res.send(response);
};

export class AuthorizationError extends Error {
  public status: 401;
  public name: 'AuthorizationError';

  constructor(message?: string) {
    super();
    Object.setPrototypeOf(this, AuthorizationError.prototype);

    this.name = 'AuthorizationError';
    this.status = 401;
    this.message = (message || 'Unauthorized');
  }
}

abstract class BadRequestError extends Error {
  public status: 400;

  constructor(message?: string) {
    super();
    this.name = 'BadRequestError';
    this.status = 400;
    this.message = (message || '');
  }
}

export class ValidationError extends BadRequestError {
  public name: 'ValidationError';

  constructor(message?: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ConflictError extends BadRequestError {
  public name: 'ConflictError';

  constructor(message?: string) {
    super(message);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class NotFoundError extends BadRequestError {
  public name: 'NotFoundError';

  constructor(message?: string) {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
