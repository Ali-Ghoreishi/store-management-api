// // import * as mongoose from 'mongoose';
// import type { Request } from 'express';

// import { AdminDocument } from 'src/modules/admins/schemas/admin.schema';
// import { CustomerDocument } from 'src/modules/customers/schemas/customer.schema';
import { Role } from '../enums/roles.enum';

// // export type ObjectId = mongoose.Schema.Types.ObjectId;

// export type UserDocument = AdminDocument | CustomerDocument;

export type AuthUser = {
  _id: string;
  email: string;
  role: Role;
};
