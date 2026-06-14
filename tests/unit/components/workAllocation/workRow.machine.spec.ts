import { interpret, waitFor } from 'xstate';
import createWorkRowMachine from '../../../../src/components/workAllocation/workRow.machine';
import workFactory from '../../../../src/lib/factories/workFactory';
import { WorkStatus } from '../../../../src/types/sdk';

const mockUpdateWorkTreatmentTypes = jest.fn();

jest.mock('../../../../src/lib/sdk', () => {
  return {
    stanCore: {
      UpdateWorkTreatmentTypes: (input: unknown) => mockUpdateWorkTreatmentTypes(input)
    }
  };
});

describe('workRow machine - treatment type update', () => {
  it('updates treatment types when UPDATE_TREATMENT_TYPES is sent', async () => {
    const initialWork = workFactory.build({
      workNumber: 'SGP123',
      status: WorkStatus.Active,
      treatmentTypes: [{ name: 'FFPE', enabled: true }]
    });

    const updatedWork = {
      ...initialWork,
      treatmentTypes: [
        { name: 'Fresh frozen', enabled: true },
        { name: 'Mixed', enabled: true }
      ]
    };

    mockUpdateWorkTreatmentTypes.mockResolvedValue({
      updateWorkTreatmentTypes: updatedWork
    });

    const machine = createWorkRowMachine({
      workWithComment: {
        work: initialWork,
        comment: null
      }
    });

    const service = interpret(machine).start();

    service.send({
      type: 'UPDATE_TREATMENT_TYPES',
      treatmentTypes: ['Fresh frozen', 'Mixed']
    });

    const updatedState = await waitFor(
      service,
      (state: any) => state.context.workWithComment.work.treatmentTypes.length === 2,
      { timeout: 3000 }
    );

    expect(mockUpdateWorkTreatmentTypes).toHaveBeenCalledWith({
      workNumber: 'SGP123',
      treatmentTypes: ['Fresh frozen', 'Mixed']
    });
    expect(updatedState.context.workWithComment.work.treatmentTypes.map((t: any) => t.name)).toEqual([
      'Fresh frozen',
      'Mixed'
    ]);

    service.stop();
  });
});
