---
to: src/lib/machines/<%= name %>/<%= name %>Events.ts
---
import { <%= Name %>Event } from "./<%= name %>Types";

/**
* Event creator for an {@link InitEvent}
*/
export function init(message: string): <%= Name %>Event {
  return {
    type: "INIT",
    message,
  }
}