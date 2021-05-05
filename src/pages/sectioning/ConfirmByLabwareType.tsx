import React from "react";
import Heading from "../../components/Heading";
import { LabwareTypeName } from "../../types/stan";
import ConfirmLabware from "./ConfirmLabware";
import { SectioningConfirmActorRef } from "../../lib/machines/sectioning/sectioningConfirm/sectioningConfirmTypes";
import ConfirmTubes from "./ConfirmTubes";

interface ConfirmByLabwareTypeParams {
  labwareTypeName: string;
  actors: Array<SectioningConfirmActorRef> | undefined;
}

const ConfirmByLabwareType: React.FC<ConfirmByLabwareTypeParams> = ({
  labwareTypeName,
  actors,
}) => {
  if (!actors || actors.length === 0) {
    return null;
  }
  return (
    <div className="p-4 space-y-4">
      <Heading level={3}>{labwareTypeName}</Heading>

      {labwareTypeName === LabwareTypeName.TUBE && (
        <ConfirmTubes actors={actors} />
      )}

      {labwareTypeName !== LabwareTypeName.TUBE &&
        actors.map((actor, i) => <ConfirmLabware key={i} actor={actor} />)}
    </div>
  );
};

export default ConfirmByLabwareType;
