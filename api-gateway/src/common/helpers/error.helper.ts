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

  // Handle serialized RPC exceptions
  if (typeof err === 'object' && err !== null) {
    const e = err as any;

    const payload = e.error ?? e;

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'statusCode' in payload
    ) {
      return {
        message: Array.isArray(payload.message)
          ? payload.message.join(', ')
          : (payload.message ?? 'Internal server error'),
        status: payload.statusCode,
      };
    }
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
