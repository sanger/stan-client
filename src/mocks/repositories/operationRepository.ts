import { Operation } from '../../types/sdk';
import operationFactory from '../../lib/factories/operationFactory';
import { createSessionStorageRepository } from './index';

const seeds: Array<Operation> = [operationFactory.build(), operationFactory.build(), operationFactory.build()];

const operationRepo = createSessionStorageRepository('OPERATION', 'id', seeds);

export default operationRepo;
