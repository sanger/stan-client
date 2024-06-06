import { Factory } from 'fishery';
import { LabwareType } from '../../types/sdk';
import labelTypeFactory from './labelTypeFactory';
import { LabwareTypeName } from '../../types/stan';

const labwareTypeFactory = Factory.define<LabwareType>(({ sequence, params }) => ({
  __typename: 'LabwareType',
  name: `Labware Type ${sequence}`,
  numRows: 1,
  numColumns: 1,
  labelType: labelTypeFactory.build(params.labelType ?? {})
}));

export const labwareTypes: Record<LabwareTypeName, Factory<LabwareType>> = {
  [LabwareTypeName.TUBE]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.TUBE,
    numRows: 1,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.TUBE} Label` })
  }),
  [LabwareTypeName.PROVIASETTE]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.PROVIASETTE,
    numRows: 1,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.PROVIASETTE} Label` })
  }),
  [LabwareTypeName.SLIDE]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.SLIDE,
    numRows: 3,
    numColumns: 2,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.SLIDE} Label` })
  }),
  [LabwareTypeName.VISIUM_TO]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.VISIUM_TO,
    numRows: 4,
    numColumns: 2,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.VISIUM_TO} Label` })
  }),
  [LabwareTypeName.VISIUM_LP]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.VISIUM_LP,
    numRows: 4,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.VISIUM_LP} Label` })
  }),
  [LabwareTypeName.PLATE]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.PLATE,
    numRows: 8,
    numColumns: 12,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.PLATE} Label` })
  }),
  [LabwareTypeName.CASSETTE]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.CASSETTE,
    numRows: 1,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.CASSETTE} Label` })
  }),
  [LabwareTypeName.XENIUM]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.XENIUM,
    numRows: 10,
    numColumns: 4
  }),
  [LabwareTypeName.VISIUM_ADH]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.VISIUM_ADH,
    numRows: 4,
    numColumns: 2,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.VISIUM_ADH} Label` })
  }),
  [LabwareTypeName.FOUR_SLOT_SLIDE]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.FOUR_SLOT_SLIDE,
    numRows: 4,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.FOUR_SLOT_SLIDE} Label` })
  }),
  [LabwareTypeName.FETAL_WASTE_CONTAINER]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.FETAL_WASTE_CONTAINER,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.FETAL_WASTE_CONTAINER} Label` })
  }),
  [LabwareTypeName.DUAL_INDEX_PLATE]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.DUAL_INDEX_PLATE,
    numRows: 8,
    numColumns: 12,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.DUAL_INDEX_PLATE} Label` })
  }),
  [LabwareTypeName.POT]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.POT,
    numRows: 1,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.POT} Label` })
  }),
  [LabwareTypeName.PRE_BARCODED_TUBE]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.PRE_BARCODED_TUBE,
    numRows: 1,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.PRE_BARCODED_TUBE} Label` })
  }),
  [LabwareTypeName.VISIUM_LP_CYTASSIST]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.VISIUM_LP_CYTASSIST,
    numRows: 4,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.VISIUM_LP_CYTASSIST} Label` })
  }),
  [LabwareTypeName.VISIUM_LP_CYTASSIST_XL]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.VISIUM_LP_CYTASSIST_XL,
    numRows: 2,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.VISIUM_LP_CYTASSIST_XL} Label` })
  }),
  [LabwareTypeName.VISIUM_LP_CYTASSIST_HD]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.VISIUM_LP_CYTASSIST_HD,
    numRows: 2,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.VISIUM_LP_CYTASSIST_HD} Label` })
  }),
  [LabwareTypeName.STRIPE_TUBE]: labwareTypeFactory.params({
    __typename: 'LabwareType',
    name: LabwareTypeName.STRIPE_TUBE,
    numRows: 8,
    numColumns: 1,
    labelType: labelTypeFactory.build({ name: `${LabwareTypeName.STRIPE_TUBE} Label` })
  })
};

export const labwareTypeInstances = Object.keys(labwareTypes).map((lt) => labwareTypes[lt as LabwareTypeName].build());
