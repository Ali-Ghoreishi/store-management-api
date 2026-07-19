// Define specific message data types
export interface WelcomeEmailData {
  email: string;
  name: string;
  customerId: string;
}

export interface VerifyAccountEmailData {
  email: string;
  name: string;
  code: string;
}

export interface ResetPasswordEmailData {
  email: string;
  name?: string;
  resetToken: string;
}
