import { createActor } from 'xstate';
import { enableMapSet } from 'immer';
import { createLayoutMachine } from '../../../src/lib/machines/layout/layoutMachine';
import { LayoutPlan, Source } from '../../../src/lib/machines/layout/layoutContext';
import { createSectioningConfirmMachine } from '../../../src/components/sectioningConfirm/sectioningConfirm.machine';
import { FindPlanDataQuery } from '../../../src/types/sdk';

describe('layoutMachine', () => {
  beforeEach(() => {
    enableMapSet();
  });

  it('preserves section group creation order regardless of palette selection', () => {
    const source = { sampleId: 1, labware: { id: 1 } } as Source;
    const layoutPlan = {
      sources: [],
      destinationLabware: {},
      sampleColors: new Map(),
      plannedActions: {
        B2: { addresses: new Set(['B2']), source },
        D2: { addresses: new Set(['D2']), source },
        F2: { addresses: new Set(['F2']), source }
      }
    } as unknown as LayoutPlan;
    const actor = createActor(createLayoutMachine(layoutPlan)).start();

    actor.send({ type: 'ASSIGN_SELECTED_SLOTS', selectedSlots: new Set(['B2']) });
    actor.send({ type: 'ADD_SECTION_GROUP', sectionId: '2' });
    actor.send({ type: 'ASSIGN_SELECTED_SLOTS', selectedSlots: new Set(['D2']) });
    actor.send({ type: 'ADD_SECTION_GROUP', sectionId: '8' });
    actor.send({ type: 'ASSIGN_SELECTED_SLOTS', selectedSlots: new Set(['F2']) });
    actor.send({ type: 'ADD_SECTION_GROUP', sectionId: '0' });

    const plannedActions = actor.getSnapshot().context.layoutPlan.plannedActions;

    expect(Object.keys(plannedActions)).toEqual(['section-group-2', 'section-group-8', 'section-group-0']);
    expect(Object.values(plannedActions).map((planned) => Array.from(planned.addresses))).toEqual([
      ['B2'],
      ['D2'],
      ['F2']
    ]);
  });

  it('uses the received group order for automatic section numbering', () => {
    const sourceLabware = {
      id: 1,
      barcode: 'STAN-1',
      slots: [{ samples: [{ blockHighestSection: 0 }] }]
    };
    const plan = {
      planData: {
        sources: [sourceLabware],
        destination: { barcode: 'STAN-2', labwareType: { name: 'SLIDE' } },
        groups: [['B2'], ['D2'], ['F2']],
        plan: {
          planActions: ['B2', 'D2', 'F2'].map((address) => ({
            source: { labwareId: 1, samples: [{ id: 1, tissue: {} }] },
            destination: { address },
            sampleThickness: 5
          }))
        }
      }
    } as unknown as FindPlanDataQuery;
    const actor = createActor(createSectioningConfirmMachine()).start();

    actor.send({ type: 'UPDATE_PLANS', plans: [plan] });

    expect(
      Object.values(actor.getSnapshot().context.layoutPlans[0].plannedActions).map((planned) => ({
        address: Array.from(planned.addresses)[0],
        section: planned.source.newSection
      }))
    ).toEqual([
      { address: 'B2', section: '1' },
      { address: 'D2', section: '2' },
      { address: 'F2', section: '3' }
    ]);
  });
});
