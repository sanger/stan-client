import { Factory } from "fishery";
import { Labware } from "../../types/graphql";
import { labwareTypes } from "./labwareTypeFactory";
import { LabwareTypeName, UnregisteredLabware } from "../../types/stan";

export const unregisteredLabwareFactory = Factory.define<UnregisteredLabware>(
  ({ params, associations, sequence }) => ({
    labwareType:
      associations.labwareType ?? labwareTypes[LabwareTypeName.TUBE].build(),
    id: params.id ?? null,
    barcode: params.barcode ?? null,
    slots: associations.slots ?? [],
  })
);

const labwareFactory = Factory.define<Labware>(({ sequence, params }) => {
  params.id = params.id ?? sequence;
  params.barcode = params.barcode ?? `STAN-${sequence + 1000}`;
  params.__typename = "Labware";
  return unregisteredLabwareFactory.build(params) as Labware;
});
export default labwareFactory;

export const proviasetteFactory = labwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.PROVIASETTE].build(),
});

export const tubeFactory = labwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.TUBE].build(),
});

export const slideFactory = labwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.SLIDE].build(),
});

export const visiumTOFactory = labwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_TO].build(),
});

export const visiumLPFactory = labwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_LP].build(),
});
