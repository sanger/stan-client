import { EventObject, Interpreter, State } from "xstate";
import produce, { castDraft, Draft, immerable } from "immer";
import { Typestate } from "xstate/lib/types";

/**
 * A presentation model that connects to a running state machine (known as a service).
 * Uses immer for immutability.
 *
 * @see {@link https://martinfowler.com/eaaDev/PresentationModel.html}
 * @see {@link https://immerjs.github.io/immer/docs/complex-objects}
 */
export abstract class MachinePresentationModel<
  TContext,
  TStateSchema,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = {
    value: any;
    context: TContext;
  }
> {
  [immerable] = true;

  public current: State<TContext, TEvent, TStateSchema, TTypestate>;
  public service: Interpreter<TContext, TStateSchema, TEvent, TTypestate>;
  public send: Interpreter<TContext, TStateSchema, TEvent, TTypestate>["send"];

  constructor(
    current: State<TContext, TEvent, TStateSchema, TTypestate>,
    service: Interpreter<TContext, TStateSchema, TEvent, TTypestate>
  ) {
    this.current = current;
    this.service = service;
    this.send = this.service.send;
    this.init();
  }

  init() {}

  /**
   * Creates a new presentation model with the new state
   * @param newState the new state
   */
  setState(newState: State<TContext, TEvent, TStateSchema, TTypestate>): this {
    return produce<this>(this, (draft: Draft<this>) => {
      /**
       * `castDraft` will hint to TypeScript that we want to upcast the new State to be mutable for drafting purposes
       * @see {@link https://immerjs.github.io/immer/docs/typescript#cast-utilities}
       */
      draft.current = castDraft(newState);
    });
  }
}
