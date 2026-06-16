import { HttpStatus } from '@nestjs/common';

export class Res {
  static ok(data: any = {}, message = 'Success.') {
    return {
      success: true,
      message,
      statusCode: HttpStatus.OK,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static created(data: any = {}, message = 'Created.') {
    return {
      success: true,
      message,
      statusCode: HttpStatus.CREATED,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  // optional generic error
  // static error(message = 'Error', statusCode = 500) {
  //   throw new HttpException(message, statusCode);
  // }
}

export default Res;
