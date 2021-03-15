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
    name: LabwareTypeName.TUBE,
    numRows: 1,
    numColumns: 1,
  }),
  [LabwareTypeName.PROVIASETTE]: labwareTypeFactory.params({
    name: LabwareTypeName.PROVIASETTE,
    numRows: 1,
    numColumns: 1,
  }),
  [LabwareTypeName.SLIDE]: labwareTypeFactory.params({
    name: LabwareTypeName.SLIDE,
    numRows: 3,
    numColumns: 1,
  }),
  [LabwareTypeName.VISIUM_TO]: labwareTypeFactory.params({
    name: LabwareTypeName.VISIUM_TO,
    numRows: 4,
    numColumns: 2,
  }),
  [LabwareTypeName.VISIUM_LP]: labwareTypeFactory.params({
    name: LabwareTypeName.VISIUM_LP,
    numRows: 4,
    numColumns: 1,
  }),
  [LabwareTypeName.PLATE]: labwareTypeFactory.params({
    name: LabwareTypeName.PLATE,
    numRows: 8,
    numColumns: 12,
  }),
};

export const labwareTypeInstances = Object.keys(labwareTypes).map((lt) =>
  labwareTypes[lt as LabwareTypeName].build()
);
