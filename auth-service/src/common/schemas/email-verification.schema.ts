// common/schemas/email-verification.schema.ts
import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmailVerification {
  @Prop({
    type: String,
    default: null,
    required: false,
  })
  code: string | null;

  @Prop({
    type: Date,
    default: null,
    required: false,
  })
  lastRequestTime: Date | null;

  @Prop({
    type: String,
    enum: ['pending', 'verified', 'unverified'],
    default: 'pending',
    required: false,
  })
  status: string;

  @Prop({
    type: Number,
    default: 0,
    required: true,
  })
  attempts: number;

  @Prop({
    type: Date,
    default: null,
    required: false,
  })
  verifiedAt: Date | null;
}

export const EmailVerificationDefault = {
  code: null,
  lastRequestTime: null,
  status: 'pending',
  attempts: 0,
  verifiedAt: null,
};
