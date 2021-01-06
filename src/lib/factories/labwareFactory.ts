import { Factory } from "fishery";
import { Labware } from "../../types/graphql";
import { labwareTypes } from "./labwareTypeFactory";
import { LabwareTypeName, NewLabwareLayout } from "../../types/stan";
import { labwareAddresses } from "../helpers/labwareHelper";
import { slotFactory } from "./slotFactory";
import { uniqueId } from "lodash";

export const unregisteredLabwareFactory = Factory.define<NewLabwareLayout>(
  ({ params, associations, afterBuild }) => {
    afterBuild((labware) => {
      const addresses = Array.from(labwareAddresses(labware.labwareType));
      labware.slots = addresses.map((address) =>
        slotFactory.build({
          address,
          labwareId: labware.id ?? -1,
        })
      );
    });

    return {
      labwareType:
        associations.labwareType ?? labwareTypes[LabwareTypeName.TUBE].build(),
      id: params.id ?? Number(uniqueId()),
      barcode: params.barcode ?? null,
      slots: associations.slots ?? [],
    };
  }
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
