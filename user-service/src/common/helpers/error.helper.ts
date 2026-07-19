import { HttpException, HttpStatus } from '@nestjs/common';

export function getErrorData(err: unknown): {
  message: string;
  status: number;
} {
  if (err instanceof HttpException) {
    const response = err.getResponse();

    let message = err.message;

    if (typeof response === 'string') {
      message = response;
    } else if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const msg = (response as any).message;

      message = Array.isArray(msg) ? msg.join(', ') : msg;
    }

    return {
      message,
      status: err.getStatus(),
    };
  }

  if (err instanceof Error) {
    return {
      message: err.message,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  return {
    message: 'Internal server error',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  };
}