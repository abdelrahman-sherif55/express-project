import {statusNames} from "./status-names.util";
import {HttpStatusCode} from "../enums/status-code.enum";

class ApiErrors extends Error {
  private status: string;
  private isOperational: boolean;


  constructor(message: string, private statusCode: HttpStatusCode) {
    super(message);
    this.status = statusNames[statusCode] || `Error ${statusCode}`;
    this.isOperational = true;
  };
}

export default ApiErrors;