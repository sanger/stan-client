import { Factory } from "fishery";
import { GridDirection, Labware } from "../../types/graphql";
import { labwareTypes } from "./labwareTypeFactory";
import { LabwareTypeName, NewLabwareLayout } from "../../types/stan";
import { slotFactory } from "./slotFactory";
import { uniqueId } from "lodash";
import { genAddresses } from "../helpers";

export const unregisteredLabwareFactory = Factory.define<NewLabwareLayout>(
  ({ params, associations, afterBuild }) => {
    afterBuild((labware) => {
      if (!labware.labwareType) {
        return;
      }
      const addresses = Array.from(
        genAddresses(labware.labwareType, GridDirection.RightDown)
      );
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

const labwareFactory = Factory.define<Labware>(
  ({ sequence, params, associations }) => {
    params.id = params.id ?? sequence;
    params.barcode = params.barcode ?? `STAN-${sequence + 1000}`;
    params.__typename = "Labware";
    return unregisteredLabwareFactory.build(params, {
      associations,
    }) as Labware;
  }
);
export default labwareFactory;

export const proviasetteFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.PROVIASETTE].build(),
});

export const tubeFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.TUBE].build(),
});

export const slideFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.SLIDE].build(),
});

export const visiumTOFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_TO].build(),
});

export const visiumLPFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_LP].build(),
});

export const labwareFactories: Record<
  LabwareTypeName,
  Factory<NewLabwareLayout>
> = {
  [LabwareTypeName.TUBE]: tubeFactory,
  [LabwareTypeName.PROVIASETTE]: proviasetteFactory,
  [LabwareTypeName.SLIDE]: slideFactory,
  [LabwareTypeName.VISIUM_TO]: visiumTOFactory,
  [LabwareTypeName.VISIUM_LP]: visiumLPFactory,
};
