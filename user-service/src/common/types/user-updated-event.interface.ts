import { UpdateCustomerDto } from 'src/modules/customers/dto/update-customer.dto';

export interface UserUpdatedEvent {
  doc: {
    _id?: string;
    email: string;
  };

  updateObj: UpdateCustomerDto;
}
