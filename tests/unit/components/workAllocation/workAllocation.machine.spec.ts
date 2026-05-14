import { interpret, waitFor } from 'xstate';
import createWorkAllocationMachine from '../../../../src/components/workAllocation/workAllocation.machine';
import { WorkStatus } from '../../../../src/types/sdk';

// Test the success message after creating work in the machine.

// Mock stanCore used by the machine
jest.mock('../../../../src/lib/sdk', () => {
  return {
    stanCore: {
      GetWorkAllocationInfo: jest.fn().mockResolvedValue({
        comments: [],
        projects: [{ name: 'Project A' }],
        programs: [{ name: 'Program A' }],
        omeroProjects: [],
        worksWithComments: [],
        workTypes: [{ name: 'Type A' }],
        costCodes: [{ code: 'CC1' }],
        releaseRecipients: [{ username: 'user1' }],
        releaseDestinations: [{ name: 'Lead A' }],
        treatmentTypes: [{ name: 'Fresh frozen', enabled: true }]
      }),
      CurrentUser: jest.fn().mockResolvedValue({ user: null }),
      CreateWork: jest.fn().mockResolvedValue({
        createWork: {
          workNumber: 'SGP999',
          workType: { name: 'Type A' },
          project: { name: 'Project A' },
          program: { name: 'Program A' },
          costCode: { code: 'CC1' },
          workRequester: { username: 'user1' },
          numBlocks: 1,
          numSlides: 2,
          numOriginalSamples: 0,
          treatmentTypes: [
            { name: 'Fresh frozen', enabled: true },
            { name: 'FFPE', enabled: true }
          ]
        }
      })
    }
  };
});

describe('workAllocation machine - assignSuccessMessage', () => {
  it('composes a successMessage on CreateWork done', async () => {
    const machine = createWorkAllocationMachine({ urlParams: { status: [WorkStatus.Active] } });
    const service = interpret(machine).start();

    // wait for loading -> ready
    await waitFor(service, (s: any) => s.matches('ready'), { timeout: 3000 });

    // send allocate event with values
    service.send({
      type: 'ALLOCATE_WORK',
      values: {
        workType: 'Type A',
        workRequester: 'user1',
        project: 'Project A',
        program: 'Program A',
        costCode: 'CC1',
        isRnD: false,
        numBlocks: 1,
        numSlides: 2,
        numOriginalSamples: undefined,
        ssStudyId: '',
        facultyLead: 'Lead A',
        treatmentTypes: ['FFPE', 'Mixed']
      }
    });

    // wait for successMessage to appear in context
    const stateWithSuccess = await waitFor(service, (s: any) => Boolean(s.context && s.context.successMessage), {
      timeout: 3000
    });
    const success = stateWithSuccess.context.successMessage as string;

    // success message starts with assigned work number
    expect(success).toMatch(/Assigned SGP999/);

    // treatment types appear immediately after the work type
    expect(success).toMatch(/Type A, treatment types Fresh frozen, FFPE/);

    service.stop();
  });
});
