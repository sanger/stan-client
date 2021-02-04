import React from "react";
import DataFetcher from "./DataFetcher";
import { usePresentationModel } from "../lib/hooks";
import { Interpreter } from "xstate";
import { MachinePresentationModel } from "../lib/presentationModels/machinePresentationModel";
import { EventObject, StateMachine, Typestate } from "xstate/lib/types";
import { State } from "xstate/lib/State";

/**
 * Component that will use {@link DataFetcher} to fetch some remote data, build a state machine possibly using
 * that data, then pass it on to {@link PresenterMachine}.
 *
 * (Looks scary and confusing because of the all the necessary XState generics, but they'll generally be inferred
 * correctly automatically)
 *
 * @param machine a promise that resolves with a new state machine
 * @param model function that returns a {@link MachinePresentationModel}
 * @param children a render function
 */
const Presenter: <
  T extends MachinePresentationModel<
    TContext,
    TStateSchema,
    TEvent,
    TTypestate
  >,
  TContext,
  TStateSchema,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = { value: any; context: TContext }
>(
  props: React.PropsWithChildren<{
    machine: () => Promise<
      StateMachine<TContext, TStateSchema, TEvent, TTypestate>
    >;
    model: (
      current: State<TContext, TEvent, TStateSchema, TTypestate>,
      service: Interpreter<TContext, TStateSchema, TEvent, TTypestate>
    ) => T;
    children: (presenter: T) => React.ReactElement;
  }>
) => React.ReactElement = ({ machine, model, children }) => {
  return (
    // Setting the key to a value that's different every time forces React to
    // unmount the previous instance, and mount a new one
    <DataFetcher key={Date.now()} dataFetcher={machine}>
      {(data) => (
        <PresenterMachine machine={data} model={model}>
          {(presenter) => children(presenter)}
        </PresenterMachine>
      )}
    </DataFetcher>
  );
};

export default Presenter;

/**
 * Renderless component that will use the {@link usePresentationModel} hook, which returns a presentation model, then passes it
 * to children.
 *
 * @param machine an instance of a state machine
 * @param model a function that returns a {@link MachinePresentationModel}
 * @param children the render function that receives the presentation model
 */
const PresenterMachine: <
  T extends MachinePresentationModel<
    TContext,
    TStateSchema,
    TEvent,
    TTypestate
  >,
  TContext,
  TStateSchema,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = { value: any; context: TContext }
>(
  props: React.PropsWithChildren<{
    machine: StateMachine<TContext, TStateSchema, TEvent, TTypestate>;
    model: (
      current: State<TContext, TEvent, TStateSchema, TTypestate>,
      service: Interpreter<TContext, TStateSchema, TEvent, TTypestate>
    ) => T;
    children: (presenter: T) => React.ReactElement;
  }>
) => React.ReactElement = ({ machine, model, children }) => {
  const presentationModel = usePresentationModel(machine, (current, service) =>
    model(current, service)
  );

  return children(presentationModel);
};
