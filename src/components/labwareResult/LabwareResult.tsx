import React, { useEffect } from "react";
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
import {
  PassFail,
  LabwareResult as CoreLabwareResult,
  SampleResult,
} from "../../types/sdk";
import { isSlotFilled } from "../../lib/helpers/slotHelper";
import RemoveButton from "../buttons/RemoveButton";

type LabwareResultComponentProps = LabwareResultProps & {
  /**
   * Callback to be called when the remove button is clicked
   * @param barcode the barcode of the labware
   */
  onRemoveClick: (barcode: string) => void;

  /**
   * Callback that is called whenever the labware results change e.g. pass/fail
   * Slots will default to pass.
   * @param labwareResult a {@code LabwareResult}
   */
  onChange: (labwareResult: CoreLabwareResult) => void;
};

/**
 * Component to manage recording pass/fail results on each sample
 */
export default function LabwareResult({
  labware,
  availableComments,
  onRemoveClick,
  onChange,
}: LabwareResultComponentProps) {
  const [current, send] = useMachine(
    createLabwareResultMachine({ labware, availableComments })
  );

  const { sampleResults } = current.context;

  useEffect(() => {
    // Need to transform LabwareResult internal structure to Core structure
    const labwareSampleResults: Array<SampleResult> = Array.from(
      sampleResults.keys()
    ).map((address) => {
      const sampleResult = sampleResults.get(address)!;
      return {
        address,
        ...sampleResult,
      };
    });

    onChange({ barcode: labware.barcode, sampleResults: labwareSampleResults });
  }, [labware, sampleResults, onChange]);

  const gridClassNames = classNames(
    {
      "sm:grid-cols-1": labware.labwareType.numColumns === 1,
      "sm:grid-cols-2": labware.labwareType.numColumns === 2,
    },
    "grid grid-cols-1 gap-x-8 gap-y-2"
  );

  return (
    <div>
      <div className="flex flex-row items-center justify-end">
        <RemoveButton onClick={() => onRemoveClick(labware.barcode)} />
      </div>
      <div className="flex flex-row items-center justify-around">
        {/* Display the layout of the labware */}
        <div className="bg-blue-100">
          <Labware labware={labware} />
        </div>

        {/* Display the list of pass/fail comments */}
        <div>
          <div data-testid={"passFailComments"} className={gridClassNames}>
            {sortRightDown(labware.slots).map((slot) => (
              <div
                key={slot.address}
                className="flex flex-row items-center justify-between gap-x-2"
              >
                <div className="font-medium text-gray-800 tracking-wide">
                  {slot.address}
                </div>

                <div>
                  {isSlotFilled(slot) && (
                    <div className="flex flex-row items-center justify-between">
                      {/* Tick button */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        data-testid={"passIcon"}
                        className={`h-6 w-6 cursor-pointer ${
                          sampleResults.get(slot.address)!.result ===
                          PassFail.Pass
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        onClick={() => {
                          send({ type: "PASS", address: slot.address });
                        }}
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
                        data-testid={"failIcon"}
                        className={`h-6 w-6 cursor-pointer ${
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
                      disabled={
                        sampleResults.get(slot.address)!.result ===
                        PassFail.Pass
                      }
                      value={sampleResults.get(slot.address)!.commentId ?? ""}
                      emptyOption={true}
                      onChange={(e) =>
                        send({
                          type: "SET_COMMENT",
                          address: slot.address,
                          commentId:
                            e.currentTarget.value !== ""
                              ? Number(e.currentTarget.value)
                              : undefined,
                        })
                      }
                    >
                      {optionValues(availableComments, "text", "id")}
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-row items-center justify-between gap-x-2">
            <BlueButton
              className="flex-shrink-0"
              onClick={() => send({ type: "PASS_ALL" })}
            >
              Pass All
            </BlueButton>
            <PinkButton
              className="flex-shrink-0"
              onClick={() => send({ type: "FAIL_ALL" })}
            >
              Fail All
            </PinkButton>
            <Select
              onChange={(e) =>
                send({
                  type: "SET_ALL_COMMENTS",
                  commentId:
                    e.currentTarget.value !== ""
                      ? Number(e.currentTarget.value)
                      : undefined,
                })
              }
            >
              {optionValues(availableComments, "text", "id")}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
