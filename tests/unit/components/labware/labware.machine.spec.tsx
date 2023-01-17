import { interpret } from 'xstate';
import createLabwareMachine from '../../../../src/components/labware/labware.machine';
import { createSlots } from './slotColumnInfo.spec';
import { enableMapSet } from 'immer';

describe('labwareMachine', () => {
  describe('Initial states', () => {
    it('has an initial state of non_selectable for machine params  none and single', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'none', selectionMode: 'single' })
      ).onTransition((state) => {
        if (state.matches('non_selectable')) {
          done();
        }
      });
      machine.start();
    });
    it('has an initial state of selectable.any.single for machine params  any and single', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'any', selectionMode: 'single' })
      ).onTransition((state) => {
        if (state.matches('selectable.any.single')) {
          done();
        }
      });
      machine.start();
    });
    it('has an initial state of selectable.any.multi for machine params  any and multi', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'any', selectionMode: 'multi' })
      ).onTransition((state) => {
        if (state.matches('selectable.any.multi')) {
          done();
        }
      });
      machine.start();
    });
    it('has an initial state of selectable.any.single for machine params  any and single', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'non_empty', selectionMode: 'single' })
      ).onTransition((state) => {
        if (state.matches('selectable.non_empty.single')) {
          done();
        }
      });
      machine.start();
    });
    it('has an initial state of selectable.non_empty.multi for machine params non_empty and multi', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'non_empty', selectionMode: 'multi' })
      ).onTransition((state) => {
        if (state.matches('selectable.non_empty.multi')) {
          done();
        }
      });
      machine.start();
    });
    it('has an initial state of selectable.empty.single for machine params empty and single', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'empty', selectionMode: 'single' })
      ).onTransition((state) => {
        if (state.matches('selectable.empty.single')) {
          done();
        }
      });
      machine.start();
    });

    it('has an initial state of selectable.empty.multi for machine params empty and multi', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'empty', selectionMode: 'multi' })
      ).onTransition((state) => {
        if (state.matches('selectable.empty.multi')) {
          done();
        }
      });
      machine.start();
    });
  });
  describe('CHANGE_SELECTION_MODE', () => {
    it('updates the slots', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'empty', selectionMode: 'multi' })
      ).onTransition((state) => {
        enableMapSet();
        if (state.matches('selectable.any.single')) {
          done();
        }
      });
      machine.start();
      machine.send({ type: 'CHANGE_SELECTION_MODE', selectionMode: 'single', selectable: 'any' });
    });
  });
  describe('UPDATE_SLOTS', () => {
    it('updates the slots', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'empty', selectionMode: 'multi' })
      ).onTransition((state) => {
        if (state.matches('selectable.empty.multi') && state.context.slots.length === 10) {
          done();
        }
      });
      machine.start();
      machine.send({ type: 'UPDATE_SLOTS', slots: createSlots(10) });
    });
  });
  describe('SELECT_SLOT', () => {
    it('select slot', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'any', selectionMode: 'single' })
      ).onTransition((state) => {
        enableMapSet();
        if (state.matches('selectable.any.single') && state.context.selectedAddresses.has('A1')) {
          done();
        }
      });
      machine.start();
      machine.send({ type: 'SELECT_SLOT', address: 'A1' });
    });
  });
  describe('RESET_SELECTED', () => {
    it('reset selected', (done) => {
      const machine = interpret(
        createLabwareMachine({ slots: createSlots(4), selectable: 'any', selectionMode: 'single' })
      ).onTransition((state, event) => {
        enableMapSet();
        if (
          state.matches('selectable.any.single') &&
          state.context.selectedAddresses.size === 0 &&
          event.type === 'RESET_SELECTED'
        ) {
          done();
        }
      });
      machine.start();
      machine.send({ type: 'SELECT_SLOT', address: 'A1' });
      machine.send({ type: 'RESET_SELECTED' });
    });
  });
});
