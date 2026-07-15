
import { getErrorData } from '../helpers/error.helper';

import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class AllRpcExceptionsFilter implements RpcExceptionFilter {
  catch(exception: unknown): Observable<never> {
    const { message, status } = getErrorData(exception);

    return throwError(() =>
      new RpcException({
        success: false,
        statusCode: status,
        message,
      }),
    );
  }
}
