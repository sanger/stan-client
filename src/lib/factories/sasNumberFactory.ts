import { Factory } from "fishery";
import { SasNumberFieldsFragment, SasStatus } from "../../types/sdk";
import costCodeFactory from "./costCodeFactory";
import projectFactory from "./projectFactory";

export default Factory.define<SasNumberFieldsFragment, { isRnD: boolean }>(
  ({ params, sequence, associations, transientParams }) => {
    let sasNumber: string;
    if (params.sasNumber) {
      sasNumber = params.sasNumber;
    } else {
      sasNumber = transientParams.isRnD
        ? `R&D${sequence + 1000}`
        : `SAS${sequence + 1000}`;
    }

    return {
      __typename: "SasNumber",
      costCode: associations.costCode ?? costCodeFactory.build(),
      project: associations.project ?? projectFactory.build(),
      status: params.status ?? SasStatus.Active,
      sasNumber,
    };
  }
);
