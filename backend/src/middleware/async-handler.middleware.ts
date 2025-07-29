import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async functions to catch errors and pass them to Express error handler
 * @param fn The async function to wrap
 * @returns A middleware function that handles async/await errors
 */
export const asyncHandler = <
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<any> | any
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch((err: any) => next(err));
    }
  };
};

export default asyncHandler;
