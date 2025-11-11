import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class FiltroExcepciones implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = isHttp ? exception.getResponse() : { message: 'Error interno del servidor' };
    const body = typeof payload === 'string' ? { message: payload } : payload;

    res.status(status).json({
      path: req.url,
      timestamp: new Date().toISOString(),
      statusCode: status,
      code: (body as any).code ?? `HTTP_${status}`,
      message: (body as any).message ?? 'Error',
      field: (body as any).field,
      details: (body as any).details,
    });
  }
}