import { createActor } from 'xstate';
import createLabwareMachine from '../../../../src/components/labware/labware.machine';
import { createSlots } from './slotColumnInfo.spec';
import { enableMapSet } from 'immer';

describe('labwareMachine', () => {
  describe('Initial states', () => {
    it('has an initial state of non_selectable for machine params  none and single', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'none',
          selectionMode: 'single',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((state) => {
        if (state.matches('non_selectable')) {
          done();
        }
      });
      actor.start();
    });
    it('has an initial state of selectable.any.single for machine params  any and single', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'any',
          selectionMode: 'single',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((state) => {
        if (state.matches('selectable.any.single')) {
          done();
        }
      });
      actor.start();
    });
    it('has an initial state of selectable.any.multi for machine params  any and multi', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'any',
          selectionMode: 'multi',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((state) => {
        if (state.matches('selectable.any.multi')) {
          done();
        }
      });
      actor.start();
    });
    it('has an initial state of selectable.any.single for machine params  any and single', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'non_empty',
          selectionMode: 'single',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((state) => {
        if (state.matches('selectable.non_empty.single')) {
          done();
        }
      });
      actor.start();
    });
    it('has an initial state of selectable.non_empty.multi for machine params non_empty and multi', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'non_empty',
          selectionMode: 'multi',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((state) => {
        if (state.matches('selectable.non_empty.multi')) {
          done();
        }
      });
      actor.start();
    });
    it('has an initial state of selectable.empty.single for machine params empty and single', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'empty',
          selectionMode: 'single',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((state) => {
        if (state.matches('selectable.empty.single')) {
          done();
        }
      });
      actor.start();
    });

    it('has an initial state of selectable.empty.multi for machine params empty and multi', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'empty',
          selectionMode: 'multi',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((state) => {
        if (state.matches('selectable.empty.multi')) {
          done();
        }
      });
      actor.start();
    });
  });
  describe('CHANGE_SELECTION_MODE', () => {
    it('updates the slots', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'empty',
          selectionMode: 'multi',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((state) => {
        if (state.matches('selectable.any.single')) {
          done();
        }
      });
      actor.start();
      actor.send({ type: 'CHANGE_SELECTION_MODE', selectionMode: 'single', selectable: 'any' });
    });
  });
  describe('UPDATE_SLOTS', () => {
    it('updates the slots', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'empty',
          selectionMode: 'multi',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((state) => {
        if (state.matches('selectable.empty.multi') && state.context.slots.length === 10) {
          done();
        }
      });
      actor.start();
      actor.send({ type: 'UPDATE_SLOTS', slots: createSlots(10) });
    });
  });
  describe('SELECT_SLOT', () => {
    it('select slot', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'any',
          selectionMode: 'single',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((state) => {
        if (state.matches('selectable.any.single') && state.context.selectedAddresses.has('A1')) {
          done();
        }
      });
      actor.start();
      actor.send({ type: 'SELECT_SLOT', address: 'A1' });
    });
  });
  describe('RESET_SELECTED', () => {
    it('reset selected', (done) => {
      const actor = createActor(createLabwareMachine(), {
        input: {
          slots: createSlots(4),
          selectable: 'any',
          selectionMode: 'single',
          selectedAddresses: new Set<string>(),
          lastSelectedAddress: null
        }
      });
      actor.subscribe((snapshot) => {
        enableMapSet();
        if (snapshot.matches('selectable.any.single') && snapshot.context.selectedAddresses.has('A1')) {
          actor.send({ type: 'RESET_SELECTED' });
        }
        if (snapshot.context.selectedAddresses.has('A1')) {
          done();
        }
      });
      actor.start();
      actor.send({ type: 'SELECT_SLOT', address: 'A1' });
    });
  });
});
