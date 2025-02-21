export interface EmailOptions {
  readonly email: string;
  readonly subject: string;
  readonly message: string;
}

export interface SendEmailOptions {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
  readonly attachments?: any;
}