export class Res {
  static ok(data: any = {}, message: string = 'Success.') {
    return {
      success: true,
      message,
      statusCode: 200,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static created(data: any = {}, message: string = 'Created.') {
    return {
      success: true,
      message,
      statusCode: 201,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string = 'Error', statusCode: number = 500) {
    return {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static badRequest(message: string = 'Bad request.') {
    return this.error(message, 400);
  }

  static unauthorized(message: string = 'Unauthorized.') {
    return this.error(message, 401);
  }

  static forbidden(message: string = 'Forbidden.') {
    return this.error(message, 403);
  }

  static notFound(message: string = 'Not found.') {
    return this.error(message, 404);
  }
}

export default Res;
