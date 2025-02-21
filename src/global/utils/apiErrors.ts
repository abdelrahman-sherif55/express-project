class ApiErrors extends Error {
  private status: string;
  private isOperational: boolean;

  constructor(message: string, private statusCode: number) {
    super(message);
    this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error';
    this.isOperational = true;
  };
}

export default ApiErrors;