import { Factory } from "fishery";
import { LabwareType } from "../../types/graphql";
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
};

export const labwareTypeInstances = Object.keys(labwareTypes).map((lt) =>
  labwareTypes[lt as LabwareTypeName].build()
);
