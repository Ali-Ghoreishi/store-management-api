// import * as mongoose from 'mongoose';

import { AdminDocument } from 'src/modules/admins/schemas/admin.schema';
import { CustomerDocument } from 'src/modules/customers/schemas/customer.schema';

// export type ObjectId = mongoose.Schema.Types.ObjectId;

export type UserDocument = AdminDocument | CustomerDocument;
