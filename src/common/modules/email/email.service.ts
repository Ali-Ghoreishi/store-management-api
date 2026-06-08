import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { getErrorData } from 'src/common/helpers/error.helper';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: this.configService.get<boolean>('email.secure'),
      auth: {
        user: this.configService.get<string>('email.auth.user'),
        pass: this.configService.get<string>('email.auth.pass'),
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">Welcome ${name}! 🎉</h1>
        <p>Thank you for joining our platform!</p>
        <p>We're excited to have you on board. Here's what you can do next:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Explore our products</li>
          <li>Connect with other users</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <hr />
        <p style="color: #888; font-size: 12px;">Best regards,<br/>Your App Team</p>
      </div>
    `;

    const text = `
      Welcome ${name}!
      Thank you for joining our platform!
      We're excited to have you on board.
      
      Best regards,
      Your App Team
    `;

    return await this.sendEmail({
      to,
      subject: 'Welcome to Our Platform! 🎉',
      html,
      text,
    });
  }

  async sendVerificationCodeEmail(
    to: string,
    name: string,
    verificationCode: string,
  ) {
    const verifyUrl = `${process.env.APP_URL}/auth/verify-account?email=${encodeURIComponent(to)}&verifyCode=${verificationCode}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4CAF50;">Verify Your Email Address 🔐</h1>
      <p>Hello ${name},</p>
      <p>Thank you for creating an account! Please verify your email address by entering the code below:</p>
      
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <h2 style="color: #333; margin: 0; letter-spacing: 5px; font-size: 32px;">${verificationCode}</h2>
      </div>

      <p>Or simply click the button below to verify your account automatically:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a
          href="${verifyUrl}"
          style="
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            font-weight: bold;
          "
        >
          Verify My Account
        </a>
      </div>
      
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      
      <p>If you didn't create an account with us, you can safely ignore this email.</p>
      
      <hr />
      <p style="color: #888; font-size: 12px;">Best regards,<br/>Your App Team</p>
    </div>
  `;

    const text = `
    Verify Your Email Address
    
    Hello ${name},
    
    Thank you for creating an account! Please verify your email address by entering this code:
    
    ${verificationCode}

    Or click the link below:

    ${verifyUrl}
    
    This code will expire in 10 minutes.
    
    If you didn't create an account with us, you can safely ignore this email.
    
    Best regards,
    Your App Team
  `;

    return await this.sendEmail({
      to,
      subject: 'Verify Your Email Address 🔐',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetLink = `${this.configService.get('APP_URL')}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f44336;">Reset Your Password</h1>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr />
        <p style="color: #888; font-size: 12px;">Best regards,<br/>Your App Team</p>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      html,
      text: `Reset your password using this link: ${resetLink}`,
    });
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    try {
      const from = this.configService.get<string>('email.from');

      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      return {
        error: false,
        message: 'success',
        status: 200,
        data: {},
      };
    } catch (err) {
      const { message, status } = getErrorData(err);
      this.logger.error(`Failed to send email: ${message}`);
      return {
        error: true,
        message,
        status,
      };
    }
  }
}
