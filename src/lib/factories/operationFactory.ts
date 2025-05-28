import { Factory } from 'fishery';
import { Operation } from '../../types/sdk';
import OperationTypeFactory from './operationTypeFactory';
import UserFactory from './userFactory';

export default Factory.define<Operation>(({ params, sequence }) => ({
  __typename: 'Operation',
  id: params.id ?? sequence,
  operationType: OperationTypeFactory.build(),
  user: UserFactory.build({}),
  performed: params.performed ?? new Date().toISOString(),
  actions: params.actions ?? []
}));
