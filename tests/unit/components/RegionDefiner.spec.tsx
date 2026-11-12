import { XeniumAnalyserFormValues } from '../../../src/pages/XeniumAnalyser';
import { AnalyserLabwareForm, Region, xeniumSlideLayout } from '../../../src/components/xeniumAnalyser/analyser.types';
import { Formik } from 'formik';
import RegionDefiner, {
  reIndexAndRenameAteraRegions,
  reIndexAndRenameRegions
} from '../../../src/components/xeniumAnalyser/RegionDefiner';
import { act, cleanup, fireEvent, render, RenderResult } from '@testing-library/react';

import { createFlaggedLabware } from '../../../src/mocks/handlers/flagLabwareHandlers';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';
import WarningToast from '../../../src/components/notifications/WarningToast';
import { isSlotFilled } from '../../../src/lib/helpers/slotHelper';
import resetAllMocks = jest.resetAllMocks;

// Mock the toast module
jest.spyOn(toast, 'warning');
jest.mock('../../../src/components/notifications/WarningToast', () => ({
  __esModule: true,
  default: jest.fn()
}));

type renderingOptions = {
  selectedAddresses?: Set<string>;
  selectedRegionColorIndex?: number;
  regions?: Array<Region>;
};

const labware = createFlaggedLabware('STAN-6116');

const labwareAnalyser = ({
  selectedAddresses,
  selectedRegionColorIndex,
  regions
}: renderingOptions): AnalyserLabwareForm => ({
  labware: labware,
  hybridisation: true,
  workNumber: 'SGP1001',
  regions:
    regions ??
    labware.slots
      .filter((slot) => isSlotFilled(slot))
      .map((slot, index) => ({
        roi: `Region${index + 1}`,
        sectionGroups: [
          {
            source: {
              sampleId: slot.samples[0].id,
              labware: labware,
              newSection: '1',
              tissue: slot.samples[0].tissue
            },
            addresses: new Set([slot.address])
          }
        ]
      })),
  selectedAddresses,
  selectedRegionColorIndex
});
const formValues = ({
  selectedAddresses,
  selectedRegionColorIndex,
  regions
}: renderingOptions): XeniumAnalyserFormValues => ({
  runName: '',
  repeat: false,
  lotNumberB: '',
  lotNumberA: '',
  cellSegmentationLot: '',
  equipmentId: undefined,
  activeRegionDefinerLabwareIndex: -1,
  labware: [labwareAnalyser({ selectedAddresses, selectedRegionColorIndex, regions })],
  performed: '',
  workNumberAll: ''
});

let labwareRegions: Array<Region> = [];

const labwareIndex = 0;

const renderRegionDefiner = ({ selectedAddresses, selectedRegionColorIndex, regions }: renderingOptions) => {
  return render(
    <Formik initialValues={formValues({ selectedAddresses, selectedRegionColorIndex, regions })} onSubmit={jest.fn()}>
      {({ values }) => {
        labwareRegions = values['labware'][labwareIndex].regions;
        return (
          <RegionDefiner
            labwareIndex={labwareIndex}
            slideLayout={xeniumSlideLayout}
            renameRegions={reIndexAndRenameRegions}
          />
        );
      }}
    </Formik>
  );
};

let utils: RenderResult;

describe('RegionDefiner component', () => {
  afterEach(() => {
    resetAllMocks();
    cleanup();
  });
  describe('form is rendered correctly', () => {
    beforeEach(() => {
      utils = renderRegionDefiner({ selectedAddresses: new Set(), selectedRegionColorIndex: 0 });
    });
    it('inits labware regions correctly', () => {
      expect(labwareRegions).toHaveLength(40);
    });
  });
  describe('creating a new region', () => {
    describe('when no slots are selected', () => {
      beforeEach(() => {
        utils = renderRegionDefiner({ selectedAddresses: new Set(), selectedRegionColorIndex: 0 });
      });
      it('displays a user error message', () => {
        act(() => {
          utils.getByTestId('create-update-region-button').click();
        });
        expect(WarningToast).toHaveBeenCalled();
      });
    });
    describe('when one slots is selected', () => {
      beforeEach(() => {
        utils = renderRegionDefiner({ selectedAddresses: new Set(['A1']), selectedRegionColorIndex: 0 });
      });
      it('displays a user error message', () => {
        act(() => {
          utils.getByTestId('create-update-region-button').click();
        });
        expect(WarningToast).toHaveBeenCalled();
      });
    });
    describe('when no region color is selected', () => {
      beforeEach(() => {
        utils = renderRegionDefiner({ selectedAddresses: new Set(['A1', 'A2']) });
      });
      it('displays a user error message', () => {
        act(() => {
          fireEvent.click(utils.getByTestId('create-update-region-button'));
        });
        expect(WarningToast).toHaveBeenCalled();
      });
    });
    describe('when a couple or more of slots are selected and a region color is selected', () => {
      beforeEach(() => {
        utils = renderRegionDefiner({ selectedAddresses: new Set(['A1', 'A2']), selectedRegionColorIndex: 0 });
      });
      it('updates labware layout accordingly', () => {
        act(() => {
          fireEvent.click(utils.getByTestId('create-update-region-button'));
        });

        expect(WarningToast).not.toHaveBeenCalled();
        expect(utils.getByTestId('slot-wrapper-A1')).toHaveClass('border-black');
        expect(utils.getByTestId('slot-wrapper-A2')).toHaveClass('border-black');
        expect(labwareRegions).toHaveLength(39);
      });
    });
  });

  describe('removing a region', () => {
    afterEach(() => {
      resetAllMocks();
      cleanup();
    });
    describe('when no region color is selected', () => {
      beforeEach(() => {
        utils = renderRegionDefiner({});
      });
      it('displays a user error message', () => {
        act(() => {
          fireEvent.click(utils.getByTestId('remove-region-button'));
        });
        expect(WarningToast).toHaveBeenCalled();
      });
    });
    describe('when a region color is selected', () => {
      beforeEach(() => {
        utils = renderRegionDefiner({
          selectedRegionColorIndex: 0,
          regions: [
            {
              roi: 'Region1',
              colorIndexNumber: 0,
              sectionGroups: [
                {
                  source: {
                    sampleId: labware.slots[0].samples[0].id,
                    labware: labware,
                    newSection: '1',
                    tissue: labware.slots[0].samples[0].tissue
                  },
                  addresses: new Set(['A1', 'A2'])
                },
                {
                  source: {
                    sampleId: labware.slots[1].samples[0].id,
                    labware: labware,
                    newSection: '2',
                    tissue: labware.slots[1].samples[0].tissue
                  },
                  addresses: new Set(['B1', 'B2'])
                }
              ]
            }
          ]
        });
      });
      it('updates labware layout accordingly', () => {
        act(() => {
          fireEvent.click(utils.getByTestId('remove-region-button'));
        });
        expect(WarningToast).not.toHaveBeenCalled();
        expect(utils.getByTestId('slot-wrapper-A1')).not.toHaveClass('border-black');
        expect(utils.getByTestId('slot-wrapper-A2')).not.toHaveClass('border-black');
        expect(labwareRegions).toHaveLength(2);
      });
    });
  });
});

describe('reIndexAndRenameAteraRegions', () => {
  //A region of one section per given slot, each from tissue with the given external name
  const region = (addresses: Array<string>, externalName?: string): Region => ({
    roi: '',
    sectionGroups: addresses.map((address) => ({
      source: {
        sampleId: 1,
        labware: labware,
        newSection: '1',
        tissue: { ...labware.slots[0].samples[0].tissue, externalName }
      },
      addresses: new Set([address])
    }))
  });

  it('names a region of one section after its external name, and grouped sections Region1<barcode>, Region2<barcode>, ... in slot order, without the run name or the characters the Atera rejects', () => {
    const regions = [
      region(['A1'], 'EXT-1_A'),
      region(['B1', 'C1'], 'EXT-1_A'),
      //no external name, so named like grouped sections
      region(['D1']),
      region(['E1', 'F1'], 'EXT-1_A')
    ];
    const renamed = reIndexAndRenameAteraRegions([...regions].reverse(), 'Run 123', 'STAN-6116');
    expect(renamed.map((region) => region.roi)).toEqual([
      'EXT1A',
      'Region1STAN6116',
      'Region2STAN6116',
      'Region3STAN6116'
    ]);
  });
});
