import { type Request, type Response, type NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'PROD';

class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public isOperational: boolean;
  public extra?: any;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational = true,
    extra?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.extra = extra;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(
    message: string,
    public errors: any = {},
  ) {
    super(message, 422, 'VALIDATION_ERROR', true, { errors });
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR', false);
  }
}

class ErrorFactory {
  static create(type: string, ...args: any[]): AppError {
    const errorMap: Record<string, any> = {
      validation: ValidationError,
      notFound: NotFoundError,
      unauthorized: UnauthorizedError,
      internal: InternalServerError,
    };

    const ErrorClass = errorMap[type];
    return ErrorClass ? new ErrorClass(...args) : new InternalServerError('Unknown error type');
  }
}

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`${req.originalUrl}`);
  next(error);
};

export const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let appError = err;

  if (err && (err.name === 'ZodError' || err.constructor?.name === 'ZodError')) {
    const issues = err.issues || err.errors || [];
    const formattedErrors = issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    appError = new ValidationError('Validation failed', formattedErrors);
  } else if (!(err instanceof AppError)) {
    appError = new AppError(
      err.message || 'Something went wrong',
      err.statusCode || 500,
      err.errorCode || 'INTERNAL_ERROR',
    );
  }

  const statusCode = appError.statusCode || 500;

  res.build
    .fail()
    .withStatus(statusCode)
    .withMessage(appError.message)
    .withError(appError.errorCode || 'INTERNAL_ERROR', {
      ...(appError.extra || {}),
      ...(isProduction ? {} : { stack: err.stack }),
    })
    .send();
};

export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  ErrorFactory,
};
