---
to: src/lib/machines/<%= name %>/<%= name %>States.ts
---
export enum State {
  READY = "ready",
}

export interface <%= Name %>Schema {
  states: {
    [State.READY]: {};
  };
}
