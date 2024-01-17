import createDataFetcherMachine from '../../../src/lib/machines/dataFetcher/dataFetcherMachine';
import { createActor } from 'xstate';

describe('initData.machine', () => {
  describe('creation', () => {
    it('can be created with default config and context', () => {
      const machine = createDataFetcherMachine();
      expect(machine.id).toEqual('dataFetcher');
    });

    it('can be created with extended options', () => {
      const machine = createDataFetcherMachine().provide({
        actions: {
          log: (ctx) => console.log('Logged:', ctx)
        }
      });

      expect(machine.implementations.actions).toHaveProperty('log');
    });

    it('can be created with extended context', () => {
      const machine = createDataFetcherMachine({
        data: null,
        dataFetcher: jest.fn().mockResolvedValue({ some: 'data' })
      });
      const feedbackActor = createActor(machine).start();
      expect(typeof feedbackActor.getSnapshot().context.dataFetcher).toBe('function');
      feedbackActor.stop();
    });
  });

  describe('fetching data', () => {
    describe('when successful', () => {
      it('transitions to done', (done) => {
        const machine = createDataFetcherMachine({
          dataFetcher: () => Promise.resolve({ some: 'data' }),
          data: null
        });
        const actor = createActor(machine);
        actor.subscribe((state) => {
          if (state.matches('done')) {
            expect(state.context.data).toEqual({ some: 'data' });
            done();
            actor.stop();
          }
        });
        actor.start();
      });
    });

    describe('when unsucessful', () => {
      it('transitions to failed', (done) => {
        const machine = createDataFetcherMachine({
          dataFetcher: () => Promise.reject('Failed to fetch data'),
          data: undefined
        });

        const actor = createActor(machine);
        actor.subscribe((state) => {
          if (state.matches('failed')) {
            expect(state.context.data).toEqual(undefined);
            done();
          }
        });

        actor.start();
      });
    });
  });
});
