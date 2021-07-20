import React from "react";
import Heading from "../../components/Heading";
import { LabwareTypeName } from "../../types/stan";
import ConfirmLabware from "./ConfirmLabware";
import ConfirmTubes from "./ConfirmTubes";
import { LayoutPlan } from "../../lib/machines/layout/layoutContext";

interface ConfirmByLabwareTypeParams {
  labwareTypeName: string;
  layoutPlans: Array<LayoutPlan>;
}

const ConfirmByLabwareType: React.FC<ConfirmByLabwareTypeParams> = ({
  labwareTypeName,
  layoutPlans,
}) => {
  if (layoutPlans.length === 0) {
    return null;
  }
  return (
    <div className="p-4 space-y-4">
      <Heading level={3}>{labwareTypeName}</Heading>

      {labwareTypeName === LabwareTypeName.TUBE && (
        <ConfirmTubes layoutPlans={layoutPlans} />
      )}

      {labwareTypeName !== LabwareTypeName.TUBE &&
        layoutPlans.map((layoutPlan) => (
          <ConfirmLabware
            key={layoutPlan.destinationLabware.id}
            originalLayoutPlan={layoutPlan}
          />
        ))}
    </div>
  );
};

export default ConfirmByLabwareType;
