import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisLabware from '../../../../src/components/analysisLabware/analysisLabware';
import { selectOption } from '../../../generic/utilities';
import React from 'react';
import * as xState from '@xstate/react';
import CommentRepository from '../../../../src/mocks/repositories/commentRepository';
import EquipmentRepository from '../../../../src/mocks/repositories/equipmentRepository';

const renderAnalysisLabware = () => {
  const comments = CommentRepository.findAll().filter((comment) => comment.category === 'RNA analysis');
  const equipments = EquipmentRepository.findAll().filter((equipment) => equipment.category === 'RNA analysis');
  const props = {
    barcodes: ['STAN-123'],
    comments,
    equipments,
    analysisLabwares: [],
    onChangeLabwareData: jest.fn(),
    onChangeEquipment: jest.fn()
  };
  return render(
    <div>
      <AnalysisLabware {...props} />
    </div>
  );
};

afterEach(() => {
  cleanup();
});

jest.mock('../../../../src/components/WorkNumberSelect', () => {
  return {
    __esModule: true,
    default: jest.fn(() => {
      return (
        <select data-testid="workNumber">
          <option value="SGP1008">SGP1008</option>
          <option value="SGP1009">SGP1009</option>
        </select>
      );
    })
  };
});
describe('AnalysisLabware', () => {
  describe('validate page loading without craching.', () => {
    beforeEach(() => {
      renderAnalysisLabware();
    });
    it('renders Analysis options without the analysis table', () => {
      expect(screen.getByTestId('equipmentId')).toBeVisible();
      expect(screen.getByTestId('analysisType')).toBeVisible();
      expect(screen.getByTestId('comment')).toBeVisible();
      expect(screen.getByTestId('workNumber')).toBeVisible();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('renders with equipment select option empty ', () => {
      expect(screen.getByTestId('equipmentId')).not.toHaveValue();
    });
    it('renders with analysis type select option empty ', () => {
      expect(screen.getByTestId('analysisType')).not.toHaveValue();
    });
  });
  describe('when analysis type "RIN" is selected', () => {
    it('renders analysis table when analysis type "RIN" is selected ', async () => {
      jest.spyOn(xState, 'useMachine').mockReturnValue([
        {
          value: 'ready',
          context: {
            operationType: 'RIN analysis',
            analysisLabwares: [
              {
                barcode: 'STAN-123',
                measurements: [{ name: 'RIN', value: '' }],
                workNumber: 'SGP1008',
                comment: ''
              }
            ]
          }
        },
        jest.fn()
      ] as any);
      renderAnalysisLabware();

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeVisible();
        expect(screen.getByText('RIN Value')).toBeVisible();
        expect(screen.getByTestId('measurementType')).not.toHaveValue();
      });
    });
    describe("when 'Range' is selected in measurement type", () => {
      it('should display two text fields for measurement value', async () => {
        jest.spyOn(xState, 'useMachine').mockReturnValue([
          {
            value: 'ready',
            context: {
              operationType: 'DV200 analysis',
              analysisLabwares: [
                {
                  barcode: 'STAN-123',
                  measurements: [
                    { name: 'DV200 upper', value: '' },
                    { name: 'DV200 lower', value: '' }
                  ],
                  workNumber: 'SGP1008',
                  comment: ''
                }
              ]
            }
          },
          jest.fn()
        ] as any);
        renderAnalysisLabware();
        await waitFor(async () => {
          expect(screen.getByText('Upper bound:')).toBeVisible();
          expect(screen.getByText('Lower bound:')).toBeVisible();
        });
      });
    });
  });
  describe('when analysis type "DV200" is selected', () => {
    it('renders analysis table when analysis type "DV200" is selected ', async () => {
      jest.spyOn(xState, 'useMachine').mockReturnValue([
        {
          value: 'ready',
          context: {
            operationType: 'DV200 analysis',
            analysisLabwares: [
              {
                barcode: 'STAN-123',
                measurements: [{ name: 'DV200', value: '' }],
                workNumber: 'SGP1008',
                comment: ''
              }
            ]
          }
        },
        jest.fn()
      ] as any);
      renderAnalysisLabware();
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeVisible();
        expect(screen.getByText('DV200 Value')).toBeVisible();
        expect(screen.getByTestId('measurementType')).not.toHaveValue();
      });
    });

    describe("when 'N/A' is selected in measurement type", () => {
      it('should disable the text field in table', async () => {
        jest.spyOn(xState, 'useMachine').mockReturnValue([
          {
            value: 'ready',
            context: {
              operationType: 'DV200 analysis',
              analysisLabwares: [
                {
                  barcode: 'STAN-123',
                  measurements: [],
                  workNumber: 'SGP1008',
                  commentId: ''
                }
              ]
            }
          },
          jest.fn()
        ] as any);
        renderAnalysisLabware();
        await waitFor(async () => {
          expect(screen.getByTestId('measurementValue')).toBeDisabled();
        });
      });
    });
  });
  describe('when a comment is selected for all labware', () => {
    it('should display the selected comment in comment column of table', async () => {
      jest.spyOn(xState, 'useMachine').mockReturnValue([
        {
          value: 'ready',
          context: {
            operationType: 'DV200 analysis',
            analysisLabwares: [
              {
                barcode: 'STAN-123',
                measurements: [],
                workNumber: 'SGP1008',
                commentId: 6
              }
            ]
          }
        },
        jest.fn()
      ] as any);
      renderAnalysisLabware();
      act(() => {
        selectOption('analysisType', 'DV200').then(async () => {
          await selectOption('comment', 'Optimal');
        });
      });
      await waitFor(async () => {
        expect(screen.getByRole('table').querySelectorAll('tbody td')[4]).toHaveTextContent('Optimal');
      });
    });
  });
});
