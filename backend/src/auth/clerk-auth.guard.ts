import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    try {
      await new Promise<void>((resolve, reject) => {
        ClerkExpressRequireAuth({
          // Strict is false here so it just attaches req.auth instead of failing instantly, 
          // but actually we want it to require auth.
        })(request, response, (err: any) => {
          if (err) {
            reject(new UnauthorizedException(err.message || 'Unauthorized'));
          } else {
            resolve();
          }
        });
      });

      if (!request.auth || !request.auth.userId) {
        throw new UnauthorizedException('No user session found.');
      }

      // Attach the Clerk userId directly to a more convenient property if you want
      // request.userId = request.auth.userId;

      return true;
    } catch (err) {
      this.logger.error('Authentication failed', err);
      throw new UnauthorizedException('Invalid or missing authentication token');
    }
  }
}
