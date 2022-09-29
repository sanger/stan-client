import { Factory } from 'fishery';
import { GridDirection, Labware, LabwareState } from '../../types/sdk';
import { labwareTypes } from './labwareTypeFactory';
import { LabwareTypeName, NewLabwareLayout } from '../../types/stan';
import { uniqueId } from 'lodash';
import { buildAddresses } from '../helpers';
import { slotFactory } from './slotFactory';

export const unregisteredLabwareFactory = Factory.define<NewLabwareLayout>(
  ({ params, associations, afterBuild, transientParams }) => {
    afterBuild((labware) => {
      if (!labware.labwareType || labware.slots.length > 0) {
        return;
      }

      const addresses = buildAddresses(labware.labwareType, GridDirection.RightDown);

      labware.slots = addresses.map((address) =>
        slotFactory.build(
          {
            address,
            block: [LabwareTypeName.PROVIASETTE, LabwareTypeName.CASSETTE].includes(
              labware.labwareType.name as LabwareTypeName
            ),
            labwareId: labware.id
          },
          {
            transient: {
              numberOfSamples: transientParams.samplesPerSlot ?? 0
            }
          }
        )
      );

      /***
       * To fill in some slots in 96 well plate
       */
      if (labware.labwareType.name === LabwareTypeName.PLATE) {
        // Include some empty, some filled
        labware.slots = labware.slots.map((slot, i) => {
          if (i % 2 === 1 || i > 16) {
            return {
              ...slot,
              samples: []
            };
          } else return slot;
        });
      }
    });

    return {
      __typename: 'Labware',
      labwareType: associations.labwareType ?? labwareTypes[LabwareTypeName.TUBE].build(),
      id: params.id ?? -1,
      barcode: params.barcode ?? null,
      externalBarcode: params.externalBarcode ?? 'EXTERN-BARCODE',
      slots: associations.slots ?? [],
      destroyed: params.destroyed ?? false,
      discarded: params.discarded ?? false,
      released: params.released ?? false,
      created: params.created ?? new Date().toISOString(),
      state: params.state ?? LabwareState.Active
    };
  }
);

const labwareFactory = Factory.define<Labware>(({ sequence, params, associations, transientParams }) => {
  params.id = params.id ?? -Number(uniqueId());
  params.barcode = params.barcode ?? `STAN-${sequence + 1000}`;
  return unregisteredLabwareFactory.build(params, {
    associations,
    transient: {
      samplesPerSlot: transientParams.samplesPerSlot ?? 2
    }
  }) as Labware;
});
export default labwareFactory;

export const proviasetteFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.PROVIASETTE].build()
});

export const tubeFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.TUBE].build()
});

export const slideFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.SLIDE].build()
});

export const visiumTOFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_TO].build()
});

export const visiumLPFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_LP].build()
});

export const plateFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.PLATE].build()
});

export const cassetteFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.CASSETTE].build()
});

export const visiumADHFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_ADH].build()
});

export const fourSlotSlideFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.FOUR_SLOT_SLIDE].build()
});

export const fetalWasteFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.FETAL_WASTE_CONTAINER].build()
});
export const dualIndexPlateFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.DUAL_INDEX_PLATE].build()
});

export const potFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.POT].build()
});
export const preBarcodedFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.PRE_BARCODED_TUBE].build()
});
export const visiumLPCytAssistFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_LP_CYTASSIST].build()
});
export const visiumLPCytAssistXLFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_LP_CYTASSIST_XL].build()
});

export const labwareFactories: Record<LabwareTypeName, Factory<NewLabwareLayout>> = {
  [LabwareTypeName.TUBE]: tubeFactory,
  [LabwareTypeName.PROVIASETTE]: proviasetteFactory,
  [LabwareTypeName.SLIDE]: slideFactory,
  [LabwareTypeName.VISIUM_TO]: visiumTOFactory,
  [LabwareTypeName.VISIUM_LP]: visiumLPFactory,
  [LabwareTypeName.PLATE]: plateFactory,
  [LabwareTypeName.CASSETTE]: cassetteFactory,
  [LabwareTypeName.VISIUM_ADH]: visiumADHFactory,
  [LabwareTypeName.FOUR_SLOT_SLIDE]: fourSlotSlideFactory,
  [LabwareTypeName.FETAL_WASTE_CONTAINER]: fetalWasteFactory,
  [LabwareTypeName.DUAL_INDEX_PLATE]: dualIndexPlateFactory,
  [LabwareTypeName.PRE_BARCODED_TUBE]: preBarcodedFactory,
  [LabwareTypeName.POT]: potFactory,
  [LabwareTypeName.VISIUM_LP_CYTASSIST]: visiumLPCytAssistFactory,
  [LabwareTypeName.VISIUM_LP_CYTASSIST_XL]: visiumLPCytAssistXLFactory
};
