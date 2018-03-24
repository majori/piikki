import { ErrorRequestHandler } from 'express';
import { STATUS_CODES } from 'http';
import { isBoom } from 'boom';
import { Logger } from './logger';

const logger = new Logger(__filename);

export const errorResponder: ErrorRequestHandler = (err, req, res, next) => {
  const status = isBoom(err) ? err.output.statusCode : 500;
  const payload = isBoom(err) ? err.output.payload : { error: 'Internal Server Error', message: '' };

  const response = {
    ok: false,
    error: {
      type: payload.error,
      message: payload.message,
    },
  };

  // Set response status
  res.status(status);

  // Log error request
  logger.errorRequest(req, res, err);

  res.send(response);
};
