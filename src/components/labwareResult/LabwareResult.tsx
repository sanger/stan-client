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
import { PassFail } from "../../types/sdk";
import { isSlotFilled } from "../../lib/helpers/slotHelper";

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

  const { sampleResults } = current.context;

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
              <div className="flex flex-row items-center justify-between gap-x-2">
                <div className="font-medium text-gray-800 tracking-wide">
                  {slot.address}
                </div>

                <div>
                  {isSlotFilled(slot) && (
                    <div className="flex flex-row items-center justify-between">
                      {/* Tick button */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${
                          sampleResults.get(slot.address)!.result ===
                          PassFail.Pass
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>

                      {/* Cross button */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 cursor-pointer ${
                          sampleResults.get(slot.address)!.result ===
                          PassFail.Fail
                            ? "text-red-700"
                            : "text-gray-500"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        onClick={() =>
                          send({ type: "FAIL", address: slot.address })
                        }
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div>
                  {isSlotFilled(slot) && (
                    <Select
                      defaultValue={sampleResults.get(slot.address)!.commentId}
                      emptyOption={true}
                    >
                      {optionValues(availableComments, "text", "id")}
                    </Select>
                  )}
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
