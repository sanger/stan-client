import createDataFetcherMachine from '../../../src/lib/machines/dataFetcher/dataFetcherMachine';
import { interpret } from 'xstate';

describe('initData.machine', () => {
  describe('creation', () => {
    it('can be created with default config and context', () => {
      const machine = createDataFetcherMachine();
      expect(machine.id).toEqual('dataFetcher');
    });

    it('can be created with extended options', () => {
      const machine = createDataFetcherMachine({
        options: {
          actions: {
            log: (ctx) => console.log('Logged:', ctx)
          }
        }
      });

      expect(machine.options.actions).toHaveProperty('log');
    });

    it('can be created with extended context', () => {
      const machine = createDataFetcherMachine({
        context: {
          dataFetcher: () => Promise.resolve()
        }
      });

      expect(machine.context?.dataFetcher).toBeInstanceOf(Function);
    });
  });

  describe('fetching data', () => {
    describe('when successful', () => {
      it('transitions to done', (done) => {
        const machine = createDataFetcherMachine({
          context: {
            dataFetcher: () => Promise.resolve({ some: 'data' })
          }
        });

        const service = interpret(machine).onTransition((state) => {
          if (state.matches('done')) {
            expect(state.context.data).toEqual({ some: 'data' });
            done();
          }
        });

        service.start();
      });
    });

    describe('when unsucessful', () => {
      it('transitions to failed', (done) => {
        const machine = createDataFetcherMachine({
          context: {
            dataFetcher: () => Promise.reject('Failed to fetch data')
          }
        });

        const service = interpret(machine).onTransition((state) => {
          if (state.matches('failed')) {
            expect(state.context.data).toEqual(undefined);
            done();
          }
        });

        service.start();
      });
    });
  });
});
