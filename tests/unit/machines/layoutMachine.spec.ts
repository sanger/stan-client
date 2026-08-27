import { createActor } from 'xstate';
import { enableMapSet } from 'immer';
import { createLayoutMachine } from '../../../src/lib/machines/layout/layoutMachine';
import { LayoutPlan, Source } from '../../../src/lib/machines/layout/layoutContext';

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
});
