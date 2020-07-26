import { RequestHandler } from 'express';
import { EndpointFunction } from 'types/endpoints';
import { Logger } from '../logger';

const logger = new Logger(__filename);

// Wraps the result to json response if succesful
// else pass error to express error handler
export function createJsonRoute(func: EndpointFunction): RequestHandler {
  return async (req, res, next) => {
    try {
      const result = await func(req);
      const response = { ok: true, result: result || {} };

      // Set status to OK
      res.status(200);

      // Track a succesful request
      logger.request(req, res);

      // Send the response
      res.json(response);

      // Pass error to error handler
    } catch (err) {
      next(err);
    }
  };
}
