import {HttpStatusCode} from "../enums/status-code.enum";

export const statusNames: Record<HttpStatusCode, string> = {
  [HttpStatusCode.OK]: 'OK',
  [HttpStatusCode.CREATED]: 'Created',
  [HttpStatusCode.ACCEPTED]: 'Accepted',
  [HttpStatusCode.NO_CONTENT]: 'No Content',

  [HttpStatusCode.MULTIPLE_CHOICES]: 'Multiple Choices',
  [HttpStatusCode.MOVED_PERMANENTLY]: 'Moved Permanently',
  [HttpStatusCode.FOUND]: 'Found',
  [HttpStatusCode.SEE_OTHER]: 'See Other',
  [HttpStatusCode.NOT_MODIFIED]: 'Not Modified',
  [HttpStatusCode.TEMPORARY_REDIRECT]: 'Temporary Redirect',
  [HttpStatusCode.PERMANENT_REDIRECT]: 'Permanent Redirect',

  [HttpStatusCode.BAD_REQUEST]: 'Bad Request',
  [HttpStatusCode.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatusCode.FORBIDDEN]: 'Forbidden',
  [HttpStatusCode.NOT_FOUND]: 'Not Found',
  [HttpStatusCode.PROXY_AUTHENTICATION_REQUIRED]: 'Proxy Authentication Required',
  [HttpStatusCode.REQUEST_TIMEOUT]: 'Request Timeout',
  [HttpStatusCode.CONFLICT]: 'Conflict',
  [HttpStatusCode.GONE]: 'Gone',
  [HttpStatusCode.IM_A_TEAPOT]: "I'm a Teapot",
  [HttpStatusCode.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatusCode.TOO_MANY_REQUESTS]: 'Too Many Requests',

  [HttpStatusCode.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HttpStatusCode.NOT_IMPLEMENTED]: 'Not Implemented',
  [HttpStatusCode.BAD_GATEWAY]: 'Bad Gateway',
  [HttpStatusCode.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [HttpStatusCode.GATEWAY_TIMEOUT]: 'Gateway Timeout',
};
