import { HttpException } from '@nestjs/common';

export function getErrorData(err: unknown): {
  message: string;
  status: number;
} {
  if (err instanceof HttpException) {
    return {
      message: err.message,
      status: err.getStatus(),
    };
  }

  if (err instanceof Error) {
    return { message: err.message, status: 500 };
  }

  return { message: String(err), status: 500 };
}
