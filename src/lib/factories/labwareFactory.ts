import { Factory } from "fishery";
import { GridDirection, Labware } from "../../types/graphql";
import { labwareTypes } from "./labwareTypeFactory";
import { LabwareTypeName, NewLabwareLayout } from "../../types/stan";
import { uniqueId } from "lodash";
import { buildAddresses } from "../helpers";
import { slotFactory } from "./slotFactory";

export const unregisteredLabwareFactory = Factory.define<NewLabwareLayout>(
  ({ params, associations, afterBuild, transientParams }) => {
    afterBuild((labware) => {
      if (!labware.labwareType || labware.slots.length > 0) {
        return;
      }

      const addresses = buildAddresses(
        labware.labwareType,
        GridDirection.RightDown
      );

      labware.slots = addresses.map((address) =>
        slotFactory.build(
          {
            address,
            labwareId: labware.id,
          },
          {
            transient: {
              numberOfSamples: transientParams.samplesPerSlot ?? 0,
            },
          }
        )
      );
    });

    return {
      __typename: "Labware",
      labwareType:
        associations.labwareType ?? labwareTypes[LabwareTypeName.TUBE].build(),
      id: params.id ?? -1,
      barcode: params.barcode ?? null,
      slots: associations.slots ?? [],
      destroyed: params.destroyed ?? false,
      discarded: params.discarded ?? false,
      released: params.released ?? false,
    };
  }
);

const labwareFactory = Factory.define<Labware>(
  ({ sequence, params, associations, transientParams }) => {
    params.id = params.id ?? -Number(uniqueId());
    params.barcode = params.barcode ?? `STAN-${sequence + 1000}`;
    return unregisteredLabwareFactory.build(params, {
      associations,
      transient: {
        samplesPerSlot: transientParams.samplesPerSlot ?? 2,
      },
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

export const plateFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.PLATE].build(),
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
  [LabwareTypeName.PLATE]: plateFactory,
};
