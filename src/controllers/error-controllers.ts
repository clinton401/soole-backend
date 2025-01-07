import {Response, Request, NextFunction} from "express";
import { HttpError } from "../lib/error";
import createError from "http-errors";
import { errorHandler } from "../lib/utils";
import { server_error } from "../lib/variables";
export const foundError = (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error(err);
    const msg = err.message || server_error;
    const status = err.status || 500

    res
      .status(err.status || 500)
      .json(
        errorHandler(msg, status)
      );
  };

  export const notFound = (req: Request, res: Response, next: NextFunction) => {
  return  next(createError(404,"No route matches your request"))
}