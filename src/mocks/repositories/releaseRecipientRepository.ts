import { ReleaseRecipientFieldsFragment } from "../../types/graphql";
import { createSessionStorageRepository } from "./index";
import releaseRecipientFactory from "../../lib/factories/releaseRecipientFactory";

const seeds: Array<ReleaseRecipientFieldsFragment> = [
  releaseRecipientFactory.build({ username: "et2" }),
  releaseRecipientFactory.build({ username: "cm18" }),
  releaseRecipientFactory.build({ username: "cs41" }),
  releaseRecipientFactory.build({ username: "kr19" }),
  releaseRecipientFactory.build({ username: "lb28" }),
  releaseRecipientFactory.build({ username: "re5" }),
  releaseRecipientFactory.build({ username: "lh7" }),
  releaseRecipientFactory.build({ username: "vk8" }),
  releaseRecipientFactory.build({ username: "cc36" }),
  releaseRecipientFactory.build({ username: "aw24" }),
  releaseRecipientFactory.build({ username: "cs24", enabled: false }),
];

const releaseRecipientRepository = createSessionStorageRepository(
  "RELEASE_RECIPIENT",
  "username",
  seeds
);

export default releaseRecipientRepository;
