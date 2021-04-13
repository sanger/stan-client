import { DestructionReasonFieldsFragment } from "../../types/graphql";
import { createSessionStorageRepository } from "./index";
import destructionReasonFactory from "../../lib/factories/destructionReasonFactory";

const destructionReasonSeeds: Array<DestructionReasonFieldsFragment> = [
  destructionReasonFactory.build({ text: "No tissue remaining in block." }),
  destructionReasonFactory.build({ text: "Operator error." }),
  destructionReasonFactory.build({ text: "Experiment complete." }),
  destructionReasonFactory.build({
    text: "Samples were haunted.",
    enabled: false,
  }),
];

const destructionReasonRepository = createSessionStorageRepository(
  "DESTRUCTION_REASONS",
  "id",
  destructionReasonSeeds
);

export default destructionReasonRepository;
