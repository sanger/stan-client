---
to: src/lib/machines/<%= name %>/<%= name %>MachineTypes.ts
---
import { Interpreter, State, StateNode } from "xstate";

/**
* Context for <%= Name %> Machine
*/
export interface <%= Name %>Context {
  message: string
}

/**
* State Schema for <%= Name %> Machine
*/
export interface <%= Name %>Schema {
  states: {
    init: {};
  };
}

/**
* An example event type
*/
type InitEvent = { type: "INIT", message: string };

export type <%= Name %>Event =
  | InitEvent;

/**
* The type of an interpreted <%= Name %> Machine
*/
export type <%= Name %>MachineService = Interpreter<
  <%= Name %>Context,
  <%= Name %>Schema,
  <%= Name %>Event
>;

/**
* <%= Name %> Machine type
*/
export type <%= Name %>Machine = StateNode<
  <%= Name %>Context,
  <%= Name %>Schema,
  <%= Name %>Event
>;

/**
* The type of an individual state (i.e. current returned from useMachine())
*/
export type <%= Name %>State = State<
  <%= Name %>Context,
  <%= Name %>Event,
  <%= Name %>Schema
>;
