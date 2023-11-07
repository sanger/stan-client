import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  getById,
  optionsShouldHaveLength,
  selectOption,
  shouldDisplayValue,
  shouldHaveOption
} from '../../../generic/utilities';
import React from 'react';
import { plateFactory } from '../../../../src/lib/factories/labwareFactory';
import { CommentFieldsFragment, LabwareFieldsFragment } from '../../../../src/types/sdk';
import LabwareResult from '../../../../src/components/labwareResult/LabwareResult';
import { LabwareResult as CoreLabwareResult } from '../../../../src/types/sdk';
import '@testing-library/jest-dom';
import { enableMapSet } from 'immer';
import { isSlotFilled } from '../../../../src/lib/helpers/slotHelper';
import { emptySlotFactory, filledSlotFactory } from '../../../../src/lib/factories/slotFactory';
import SlotColumnInfo from '../../../../src/components/labware/SlotColumnInfo';
import { TISSUE_COVERAGE_MEASUREMENT_NAME } from '../../../../src/pages/StainingQC';

afterEach(() => {
  cleanup();
});
jest.mock('../../../../src/components/labware/Labware', () => {
  return {
    __esModule: true,
    default: jest.fn(({ labware, slotBuilder }) => {
      return <SlotColumnInfo slotColumn={labware.slots} slotBuilder={slotBuilder} numRows={8} />;
    })
  };
});
const comments: CommentFieldsFragment[] = [
  {
    id: 1,
    text: 'Comment1',
    category: 'stain QC',
    enabled: true
  },
  {
    id: 2,
    text: 'Comment2',
    category: 'stain QC',
    enabled: true
  }
];
describe('LabwareResult', () => {
  const inputLabware = plateFactory.build({ barcode: 'STAN-3111' });
  const labware: LabwareFieldsFragment = { ...inputLabware, barcode: inputLabware.barcode ?? '' };

  beforeAll(() => {
    enableMapSet();
  });
  describe('On Mount', () => {
    describe('Mounting labware with no slots and no initialLabwareResult', () => {
      it('displays the corresponding fields', async () => {
        const initialLwResult: CoreLabwareResult = {
          barcode: labware.barcode
        };
        let { container } = render(
          <LabwareResult
            labware={labware}
            initialLabwareResult={initialLwResult}
            onRemoveClick={() => {}}
            onChange={() => {}}
            availableComments={[]}
          />
        );
        //Displays labware
        expect(screen.getByTestId('passFailComments')).toBeVisible();
        //displays commentAll drop down by default
        expect(screen.getByTestId('commentAll')).toBeVisible();
        //displays remove button
        expect(screen.getByTestId('remove')).toBeVisible();
        //It should not display measurements as initialLabwareResult is not provided with slot measurements
        expect(screen.queryByTestId('coverage')).not.toBeInTheDocument();

        //displays no passIcons,failIcons or comments for slots as there are no filled slots in labware
        expect(screen.queryAllByTestId('passIcon')).toHaveLength(0);
        expect(screen.queryAllByTestId('failIcon')).toHaveLength(0);
        expect(screen.queryAllByTestId('comment')).toHaveLength(0);

        //displays no passFailComments as commentsForSlotSections is not provided and default is false
        expect(screen.queryAllByTestId('commentsSlotSections')).toHaveLength(0);
      });
    });

    describe('Mounting labware with filled slots', () => {
      beforeEach(() => {
        labware.slots = labware.slots.map((slot, i) => {
          if (i === 0 || i == 1) {
            return filledSlotFactory.build({ address: slot.address });
          } else {
            return emptySlotFactory.build({ address: slot.address });
          }
        });
      });
      it('displays the labware with slots filled, but no measurements', async () => {
        const initialLwResult: CoreLabwareResult = {
          barcode: labware.barcode
        };
        let { container } = render(
          <LabwareResult
            labware={labware}
            initialLabwareResult={initialLwResult}
            onRemoveClick={() => {}}
            onChange={() => {}}
            availableComments={[]}
          />
        );
        //It should not display measurements as initialLabwareResult is not provided with slot measurements
        expect(screen.queryByTestId('coverage')).not.toBeInTheDocument();
        //displays  passIcons,failIcons when there are filled slots in labware
        expect(screen.queryAllByTestId('passIcon')).toHaveLength(2);
        expect(screen.queryAllByTestId('failIcon')).toHaveLength(2);
        expect(screen.queryAllByTestId('comment')).toHaveLength(2);
      });
      it('displays the labware with slots filled and measurements', async () => {
        const initialLwResult: CoreLabwareResult = {
          barcode: labware.barcode,
          slotMeasurements: [
            {
              address: 'A1',
              name: TISSUE_COVERAGE_MEASUREMENT_NAME,
              value: ''
            }
          ]
        };
        render(
          <LabwareResult
            labware={labware}
            initialLabwareResult={initialLwResult}
            onRemoveClick={() => {}}
            onChange={() => {}}
            availableComments={[]}
          />
        );
        //It should display measurements as initialLabwareResult is  provided with slot measurements
        expect(screen.queryAllByTestId('coverage')).toHaveLength(2);
        //displays  passIcons,failIcons when there are filled slots in labware
        expect(screen.queryAllByTestId('passIcon')).toHaveLength(2);
        expect(screen.queryAllByTestId('failIcon')).toHaveLength(2);
        expect(screen.queryAllByTestId('comment')).toHaveLength(2);
      });

      it('displays no measurements', async () => {
        const initialLwResult: CoreLabwareResult = {
          barcode: labware.barcode,
          slotMeasurements: [
            {
              address: 'A1',
              name: TISSUE_COVERAGE_MEASUREMENT_NAME,
              value: ''
            }
          ]
        };
        render(
          <LabwareResult
            labware={labware}
            initialLabwareResult={initialLwResult}
            onRemoveClick={() => {}}
            onChange={() => {}}
            availableComments={[]}
            displayMeasurement={false}
          />
        );
        //It should not display measurements  as displayMeasurement is false
        expect(screen.queryByTestId('coverage')).not.toBeInTheDocument();

        //displays  passIcons,failIcons when there are filled slots in labware
        expect(screen.queryAllByTestId('passIcon')).toHaveLength(2);
        expect(screen.queryAllByTestId('failIcon')).toHaveLength(2);
        expect(screen.queryAllByTestId('comment')).toHaveLength(2);
      });
      it('displays no comments', async () => {
        const initialLwResult: CoreLabwareResult = {
          barcode: labware.barcode,
          slotMeasurements: [
            {
              address: 'A1',
              name: TISSUE_COVERAGE_MEASUREMENT_NAME,
              value: ''
            }
          ]
        };
        render(
          <LabwareResult
            labware={labware}
            initialLabwareResult={initialLwResult}
            onRemoveClick={() => {}}
            onChange={() => {}}
            availableComments={[]}
            displayComments={false}
          />
        );
        //It should not display comments as displayComments is false
        expect(screen.queryAllByTestId('comment')).toHaveLength(0);

        //displays  passIcons,failIcons when there are filled slots in labware
        expect(screen.queryAllByTestId('passIcon')).toHaveLength(2);
        expect(screen.queryAllByTestId('failIcon')).toHaveLength(2);
        expect(screen.queryAllByTestId('coverage')).toHaveLength(2);
      });

      it('displays passFail icons', async () => {
        const initialLwResult: CoreLabwareResult = {
          barcode: labware.barcode,
          slotMeasurements: [
            {
              address: 'A1',
              name: TISSUE_COVERAGE_MEASUREMENT_NAME,
              value: ''
            }
          ]
        };
        render(
          <LabwareResult
            labware={labware}
            initialLabwareResult={initialLwResult}
            onRemoveClick={() => {}}
            onChange={() => {}}
            availableComments={[]}
            displayPassFail={false}
          />
        );
        //It should not display pass/Fail icons as displayPassFail is false
        expect(screen.queryAllByTestId('passIcon')).toHaveLength(0);
        expect(screen.queryAllByTestId('failIcon')).toHaveLength(0);

        expect(screen.queryAllByTestId('comment')).toHaveLength(2);
        expect(screen.queryAllByTestId('coverage')).toHaveLength(2);
      });
    });
  });
  describe('When comment for all is selected', () => {
    it('displays passFailComments', async () => {
      const initialLwResult: CoreLabwareResult = {
        barcode: labware.barcode,
        slotMeasurements: [
          {
            address: 'A1',
            name: TISSUE_COVERAGE_MEASUREMENT_NAME,
            value: ''
          }
        ]
      };
      render(
        <LabwareResult
          labware={labware}
          initialLabwareResult={initialLwResult}
          onRemoveClick={() => {}}
          onChange={() => {}}
          availableComments={comments}
          displayPassFail={false}
        />
      );
      //All comment drop downs should display options
      waitFor(async () => {
        await selectOption('commentAll', 'Comment2');
        shouldDisplayValue('comment', 'Comment2', 0);
        shouldDisplayValue('comment', 'Comment2', 1);
      });
    });
  });
});
