import React from "react";
import Labware from "../labware/Labware";
import { sortRightDown } from "../../lib/helpers/labwareHelper";
import { Select } from "../forms/Select";
import { optionValues } from "../forms";
import classNames from "classnames";
import BlueButton from "../buttons/BlueButton";
import PinkButton from "../buttons/PinkButton";
import createLabwareResultMachine, {
  LabwareResultProps,
} from "./labwareResult.machine";
import { useMachine } from "@xstate/react";

/**
 * Component to manage recording pass/fail results on each sample
 */
export default function LabwareResult({
  labware,
  availableComments,
}: LabwareResultProps) {
  const [current, send] = useMachine(
    createLabwareResultMachine({ labware, availableComments })
  );

  console.log(current.context);

  const gridClassNames = classNames(
    {
      "sm:grid-cols-1": labware.labwareType.numColumns === 1,
      "sm:grid-cols-2": labware.labwareType.numColumns === 2,
    },
    "grid grid-cols-1 gap-x-8 gap-y-2"
  );

  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        {/* Display the layout of the labware */}
        <div className="bg-blue-100">
          <Labware labware={labware} />
        </div>

        {/* Display the list of pass/fail comments */}
        <div>
          <div className={gridClassNames}>
            {sortRightDown(labware.slots).map((slot) => (
              <div>
                <div>{slot.address}</div>
                <div>Pass/Fail</div>
                <div>
                  <Select>
                    {optionValues(availableComments, "text", "id")}
                  </Select>
                </div>
              </div>
            ))}
          </div>
          <div>
            <BlueButton onClick={() => send({ type: "PASS_ALL" })}>
              Pass All
            </BlueButton>
            <PinkButton>Fail All</PinkButton>
            <Select>{optionValues(availableComments, "text", "id")}</Select>
          </div>
        </div>
      </div>
    </div>
  );
}
