import { CellClass } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import cellClassFactory from '../../lib/factories/cellClassFactory';

const seeds: Array<CellClass> = [
  cellClassFactory.build({ name: 'tissue' }),
  cellClassFactory.build({ name: 'Organoid' }),
  cellClassFactory.build({ name: 'Organoid Pellet' }),
  cellClassFactory.build({ name: 'Cell Culture', enabled: false }),
  cellClassFactory.build({ name: 'Cell Pellet' }),
  cellClassFactory.build({ name: 'TMA' })
];

const cellClassRepository = createSessionStorageRepository('CELL_CLASS', 'name', seeds);

export default cellClassRepository;
