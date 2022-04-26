import { Factory } from "fishery";
import { LabwareType } from "../../types/sdk";
import labelTypeFactory from "./labelTypeFactory";
import { LabwareTypeName } from "../../types/stan";

const labwareTypeFactory = Factory.define<LabwareType>(({ sequence }) => ({
  __typename: "LabwareType",
  name: `Labware Type ${sequence}`,
  numRows: 1,
  numColumns: 1,
  labelType: labelTypeFactory.build(),
}));

export default labwareTypeFactory;

export const labwareTypes: Record<LabwareTypeName, Factory<LabwareType>> = {
  [LabwareTypeName.TUBE]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.TUBE,
    numRows: 1,
    numColumns: 1,
  }),
  [LabwareTypeName.PROVIASETTE]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.PROVIASETTE,
    numRows: 1,
    numColumns: 1,
  }),
  [LabwareTypeName.SLIDE]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.SLIDE,
    numRows: 3,
    numColumns: 2,
  }),
  [LabwareTypeName.VISIUM_TO]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.VISIUM_TO,
    numRows: 4,
    numColumns: 2,
  }),
  [LabwareTypeName.VISIUM_LP]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.VISIUM_LP,
    numRows: 4,
    numColumns: 1,
  }),
  [LabwareTypeName.PLATE]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.PLATE,
    numRows: 8,
    numColumns: 12,
  }),
  [LabwareTypeName.CASSETTE]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.CASSETTE,
    numRows: 1,
    numColumns: 1,
  }),
  [LabwareTypeName.VISIUM_ADH]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.VISIUM_ADH,
    numRows: 4,
    numColumns: 2,
  }),
  [LabwareTypeName.FOUR_SLOT_SLIDE]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.FOUR_SLOT_SLIDE,
    numRows: 4,
    numColumns: 1,
  }),
  [LabwareTypeName.FETAL_WASTE_CONTAINER]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.FETAL_WASTE_CONTAINER,
  }),
  [LabwareTypeName.DUAL_INDEX_PLATE]: labwareTypeFactory.params({
    __typename: "LabwareType",
    name: LabwareTypeName.DUAL_INDEX_PLATE,
    numRows: 8,
    numColumns: 12,
  }),
};

export const labwareTypeInstances = Object.keys(labwareTypes).map((lt) =>
  labwareTypes[lt as LabwareTypeName].build()
);
