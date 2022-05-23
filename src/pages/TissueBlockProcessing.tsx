import { GetTissueBlockProcessingInfoQuery } from "../types/sdk";
import React from "react";
import { LabwareTypeName } from "../types/stan";
import BlockProcess from "../components/blockProcessing/BlockProcess";

type TissueBlockProcessingParams = {
  readonly blockProcessingInfo: GetTissueBlockProcessingInfoQuery;
};

const allowedLabwareTypeNames: Array<LabwareTypeName> = [
  LabwareTypeName.TUBE,
  LabwareTypeName.PROVIASETTE,
  LabwareTypeName.CASSETTE,
];

export default function TissueBlockProcessing({
  blockProcessingInfo,
}: TissueBlockProcessingParams) {
  /**
   * Limit the labware types the user can Section on to.
   */
  const allowedLabwareTypes = blockProcessingInfo.labwareTypes.filter((lw) =>
    allowedLabwareTypeNames.includes(lw.name as LabwareTypeName)
  );

  return (
    <BlockProcess
      blockProcessingInfo={blockProcessingInfo}
      allowedLabwareTypes={allowedLabwareTypes}
    />
  );
}
