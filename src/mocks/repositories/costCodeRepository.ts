import { CostCodeFieldsFragment } from '../../types/sdk';
import costCodeFactory from '../../lib/factories/costCodeFactory';
import { createSessionStorageRepository } from './index';

const seeds: Array<CostCodeFieldsFragment> = costCodeFactory.buildList(5);
seeds.push(costCodeFactory.build({ enabled: false }));
seeds.push(costCodeFactory.build({ code: 'S999' }));

const costCodeRepository = createSessionStorageRepository('COSTCODES', 'code', seeds);

export default costCodeRepository;
