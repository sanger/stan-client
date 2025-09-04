import { Factory } from 'fishery';
import { Labware, LabwareState } from '../../types/sdk';
import { labwareTypes } from './labwareTypeFactory';
import { LabwareTypeName, NewFlaggedLabwareLayout, NewLabwareLayout } from '../../types/stan';
import { uniqueId } from 'lodash';
import { buildAddresses, GridDirection } from '../helpers';
import { slotFactory } from './slotFactory';

export const unregisteredLabwareFactory = Factory.define<NewLabwareLayout>(
  ({ params, associations, afterBuild, transientParams }) => {
    afterBuild((labware) => {
      if (!labware.labwareType || labware.slots.length > 0) {
        return;
      }

      labware.id = Date.parse(labware.created);
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
      destroyed: params.destroyed ?? params.barcode?.length === 12,
      discarded: params.discarded ?? params.barcode?.length === 11,
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
export const visiumLPCytAssistHDFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_LP_CYTASSIST_HD].build()
});
export const xeniumFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.XENIUM].build()
});

export const stripTubeFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.STRIP_TUBE].build()
});

export const visiumLPCytAssistHD11Factory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_LP_CYTASSIST_HD_11].build()
});

export const visiumLPCytAssistHD365Factory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_LP_CYTASSIST_HD_3_6_5].build()
});

export const visiumLPCytAssistHD311Factory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.VISIUM_LP_CYTASSIST_HD_3_11].build()
});

export const superFrostPlusSlideFactory = unregisteredLabwareFactory.associations({
  labwareType: labwareTypes[LabwareTypeName.SUPER_FROST_PLUS_SLIDE].build()
});
export const labwareFactories: Record<LabwareTypeName, Factory<NewLabwareLayout>> = {
  [LabwareTypeName.TUBE]: tubeFactory,
  [LabwareTypeName.PROVIASETTE]: proviasetteFactory,
  [LabwareTypeName.VISIUM_TO]: visiumTOFactory,
  [LabwareTypeName.VISIUM_LP]: visiumLPFactory,
  [LabwareTypeName.PLATE]: plateFactory,
  [LabwareTypeName.CASSETTE]: cassetteFactory,
  [LabwareTypeName.VISIUM_ADH]: visiumADHFactory,
  [LabwareTypeName.FETAL_WASTE_CONTAINER]: fetalWasteFactory,
  [LabwareTypeName.DUAL_INDEX_PLATE]: dualIndexPlateFactory,
  [LabwareTypeName.PRE_BARCODED_TUBE]: preBarcodedFactory,
  [LabwareTypeName.POT]: potFactory,
  [LabwareTypeName.VISIUM_LP_CYTASSIST]: visiumLPCytAssistFactory,
  [LabwareTypeName.VISIUM_LP_CYTASSIST_XL]: visiumLPCytAssistXLFactory,
  [LabwareTypeName.VISIUM_LP_CYTASSIST_HD]: visiumLPCytAssistHDFactory,
  [LabwareTypeName.XENIUM]: xeniumFactory,
  [LabwareTypeName.STRIP_TUBE]: stripTubeFactory,
  [LabwareTypeName.VISIUM_LP_CYTASSIST_HD_11]: visiumLPCytAssistHD11Factory,
  [LabwareTypeName.VISIUM_LP_CYTASSIST_HD_3_6_5]: visiumLPCytAssistHD365Factory,
  [LabwareTypeName.VISIUM_LP_CYTASSIST_HD_3_11]: visiumLPCytAssistHD311Factory,
  [LabwareTypeName.SUPER_FROST_PLUS_SLIDE]: superFrostPlusSlideFactory
};

export const flaggedLabwareLayout = (labwareType: string) => {
  if (Object.values(LabwareTypeName).includes(labwareType as LabwareTypeName)) {
    return labwareFactories[labwareType as LabwareTypeName].build() as NewFlaggedLabwareLayout;
  }
  return undefined;
};
