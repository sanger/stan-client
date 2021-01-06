---
to: src/lib/machines/<%= name %>/<%= name %>Types.ts
---
import { ActorRef, Interpreter } from "xstate";

/**
* The type of an interpreted <%= Name %> Machine
*/
export type <%= Name %>MachineType = Interpreter<
  <%= Name %>Context,
  <%= Name %>Schema,
  <%= Name %>Event
>;

/**
* Type to be used for the `ref` when <%= Name %> Machine is spawned in another machine
* @see {@link https://xstate.js.org/docs/guides/actors.html#spawning-actors}
*/
export type <%= Name %>MachineActorRef = ActorRef<<%= Name %>Event, <%= Name %>MachineType["state"]>;

/**
* Available finite states for a <%= Name %> Machine
*/
export enum State {
  INIT = "init",
}

/**
* State Schema for a <%= Name %> Machine
*/
export interface <%= Name %>Schema {
  states: {
    [State.INIT]: {};
  };
}

/**
* Context for a <%= Name %> Machine
*/
export interface <%= Name %>Context {
  /**
  * A friendly greeting from <%= Name %> Machine
  */
  message: string
}

/**
* An example event type
*/
type InitEvent = { type: "INIT", message: string };

export type <%= Name %>Event =
  | InitEvent;