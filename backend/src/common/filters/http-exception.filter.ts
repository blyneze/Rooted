import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ApiExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let errorType = 'InternalServerError';
    let details: any = null;

    // 1. Handle explicit NestJS HttpExceptions (e.g. Unauthorized, BadRequest)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        errorType = (res as any).error || exception.name;
      } else {
        message = res || exception.message;
        errorType = exception.name;
      }
    } 
    // 2. Handle Prisma Database Engine Errors elegantly
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.warn(`Prisma error caught: ${exception.code} - ${exception.message}`);
      
      switch (exception.code) {
        case 'P2002': // Unique constraint violation
          status = HttpStatus.CONFLICT;
          const target = (exception.meta?.target as string[])?.join(', ') || 'field';
          message = `A record with this ${target} already exists.`;
          errorType = 'ConflictError';
          break;
        case 'P2025': // Record not found
          status = HttpStatus.NOT_FOUND;
          message = exception.meta?.cause as string || 'The requested record was not found.';
          errorType = 'NotFoundError';
          break;
        case 'P2003': // Foreign key constraint violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed. Relational reference is invalid.';
          errorType = 'ValidationError';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Database operation failed.';
          errorType = 'DatabaseError';
          break;
      }
    }
    // 3. Fallback for generic unhandled exceptions (Runtime errors, Network timeouts, etc.)
    else {
      const err = exception as Error;
      this.logger.error(
        `CRITICAL: Unhandled Exception on [${request.method}] ${request.url}`,
        err?.stack || err?.message || JSON.stringify(exception)
      );

      // Sanitize message in production to prevent leakage of internal system track
      if (process.env.NODE_ENV === 'production') {
        message = 'An internal server error occurred';
        errorType = 'InternalServerError';
      } else {
        message = err?.message || 'An unexpected error occurred';
        errorType = err?.name || 'RuntimeError';
        details = err?.stack || null;
      }
    }

    // Send formatted, structured API response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: errorType,
      message: Array.isArray(message) ? message : [message], // Enforce string array for consistent schema
      ...(details && { details }),
    });
  }
}
