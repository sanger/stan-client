import React, { useEffect } from "react";
import Labware from "../labware/Labware";
import { sortRightDown } from "../../lib/helpers/labwareHelper";
import { Select } from "../forms/Select";
import { optionValues } from "../forms";
import classNames from "classnames";
import BlueButton from "../buttons/BlueButton";
import PinkButton from "../buttons/PinkButton";
import createLabwareResultMachine from "./labwareResult.machine";
import { useMachine } from "@xstate/react";
import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
} from "../../types/sdk";
import { isSlotFilled } from "../../lib/helpers/slotHelper";
import RemoveButton from "../buttons/RemoveButton";
import { mapify } from "../../lib/helpers";
import PassIcon from "../icons/PassIcon";
import FailIcon from "../icons/FailIcon";

type LabwareResultComponentProps = {
  labware: LabwareFieldsFragment;
  initialLabwareResult: CoreLabwareResult;
  availableComments: Array<CommentFieldsFragment>;

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
  initialLabwareResult,
  availableComments,
  onRemoveClick,
  onChange,
}: LabwareResultComponentProps) {
  const [current, send] = useMachine(
    createLabwareResultMachine({
      labwareResult: initialLabwareResult,
      availableComments,
    })
  );

  const { labwareResult } = current.context;
  const sampleResults = mapify(labwareResult.sampleResults, "address");

  useEffect(() => {
    onChange(labwareResult);
  }, [labwareResult, onChange]);

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
                      <PassIcon
                        data-testid={"passIcon"}
                        className={`h-6 w-6 cursor-pointer ${
                          sampleResults.get(slot.address)!.result ===
                          PassFail.Pass
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                        onClick={() => {
                          send({ type: "PASS", address: slot.address });
                        }}
                      />

                      <FailIcon
                        data-testid={"failIcon"}
                        className={`h-6 w-6 cursor-pointer ${
                          sampleResults.get(slot.address)!.result ===
                          PassFail.Fail
                            ? "text-red-700"
                            : "text-gray-500"
                        }`}
                        onClick={() =>
                          send({ type: "FAIL", address: slot.address })
                        }
                      />
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
              data-testid={"commentAll"}
              emptyOption
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
