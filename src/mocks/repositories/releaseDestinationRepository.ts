import { ReleaseDestinationFieldsFragment } from "../../types/graphql";
import { createSessionStorageRepository } from "./index";
import releaseDestinationFactory from "../../lib/factories/releaseDestinationFactory";

const seeds: Array<ReleaseDestinationFieldsFragment> = [
  releaseDestinationFactory.build({ name: "Cell Gen wet lab team" }),
  releaseDestinationFactory.build({ name: "Teichnann lab" }),
  releaseDestinationFactory.build({ name: "Vento lab" }),
  releaseDestinationFactory.build({ name: "Bayrakter lab" }),
  releaseDestinationFactory.build({ name: "Dexter's lab", enabled: false }),
];

const releaseDestinationRepository = createSessionStorageRepository(
  "RELEASE_DESTINATION",
  "name",
  seeds
);

export default releaseDestinationRepository;
