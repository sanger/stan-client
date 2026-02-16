import { AnalyserLabwareForm, Region, XeniumAnalyserFormValues } from '../../../src/pages/XeniumAnalyser';
import { Formik } from 'formik';
import RegionDefiner from '../../../src/components/xeniumAnalyser/RegionDefiner';
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

const labware = createFlaggedLabware('STAN-6426');

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
              newSection: 1,
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
  showRegionDefiner: false,
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
        return <RegionDefiner labwareIndex={labwareIndex} />;
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
                    newSection: 1,
                    tissue: labware.slots[0].samples[0].tissue
                  },
                  addresses: new Set(['A1', 'A2'])
                },
                {
                  source: {
                    sampleId: labware.slots[1].samples[0].id,
                    labware: labware,
                    newSection: 2,
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
