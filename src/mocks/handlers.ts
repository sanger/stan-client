/**
 * Default handlers for the mock API
 */
import labwareHandlers from "./handlers/labwareHandlers";
import planHandlers from "./handlers/planHandlers";
import printHandlers from "./handlers/printHandlers";
import registrationHandlers from "./handlers/registrationHandlers";
import sectioningHandlers from "./handlers/sectioningHandlers";
import userHandlers from "./handlers/userHandlers";
import locationHandlers from "./handlers/locationHandlers";
import releaseHandlers from "./handlers/releaseHandlers";

export const handlers = [
  ...labwareHandlers,
  ...planHandlers,
  ...printHandlers,
  ...registrationHandlers,
  ...sectioningHandlers,
  ...userHandlers,
  ...locationHandlers,
  ...releaseHandlers,
];
