import { Factory } from 'fishery';
import { OperationType } from '../../types/sdk';

export default Factory.define<OperationType>(({ params, sequence }) => ({
  __typename: 'OperationType',
  name: params.name ?? `Operation Type ${sequence}`
}));
