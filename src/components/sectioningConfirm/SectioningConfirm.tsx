import React, { useCallback, useEffect } from "react";
import { PlanFinder } from "../planFinder/PlanFinder";
import Heading from "../Heading";
import DataTable from "../DataTable";
import columns from "../dataTable/labwareColumns";
import { LabwareTypeName } from "../../types/stan";
import ConfirmTubes from "./ConfirmTubes";
import ConfirmLabware from "./ConfirmLabware";
import PinkButton from "../buttons/PinkButton";
import { CommentFieldsFragment, FindPlanDataQuery } from "../../types/sdk";
import { useMachine } from "@xstate/react";
import { createSectioningConfirmMachine } from "./sectioningConfirm.machine";
import Warning from "../notifications/Warning";

type SectioningConfirmProps = {
  comments: Array<CommentFieldsFragment>;
  initialPlans: Array<FindPlanDataQuery>;
  onConfirmed: () => void;
};

export default function SectioningConfirm({
  comments,
  initialPlans,
  onConfirmed,
}: SectioningConfirmProps) {
  const [current, send, service] = useMachine(createSectioningConfirmMachine());

  useEffect(() => {
    const subscription = service.subscribe((state) => {
      if (state.matches("confirmed")) {
        onConfirmed();
      }
    });
    return subscription.unsubscribe;
  }, [service, onConfirmed]);

  const {
    sourceLabware,
    layoutPlansByLabwareType,
    serverErrors,
  } = current.context;

  const handlePlanChange = useCallback(
    (plans: Array<FindPlanDataQuery>) => {
      send({ type: "UPDATE_PLANS", plans });
    },
    [send]
  );

  const handleConfirmChange = useCallback(
    (confirmSectionLabware) => {
      send({ type: "UPDATE_CONFIRM_SECTION_LABWARE", confirmSectionLabware });
    },
    [send]
  );

  const handleRemoveClick = useCallback(
    (labwareId) => send({ type: "REMOVE_CONFIRM_SECTION_LABWARE", labwareId }),
    [send]
  );

  return (
    <div className="my-4 mx-auto max-w-screen-xl space-y-12">
      <div>
        <Heading level={3}>Find Plans</Heading>

        <p className="mt-2">
          Find sectioning plans for labware by scanning the labware barcode into
          the input below:
        </p>

        <div className="mt-4">
          <PlanFinder initialPlans={initialPlans} onChange={handlePlanChange} />
        </div>
      </div>

      {Object.keys(layoutPlansByLabwareType).length > 0 && (
        <div className="space-y-4">
          <Heading level={3}>Source Labware</Heading>
          <DataTable
            data={sourceLabware}
            columns={[columns.barcode(), columns.highestSectionForSlot("A1")]}
          />
        </div>
      )}

      <div className="space-y-4">
        {/* Always show tubes first (if there are any) */}
        {layoutPlansByLabwareType?.[LabwareTypeName.TUBE] && (
          <ConfirmTubes
            onChange={handleConfirmChange}
            layoutPlans={layoutPlansByLabwareType[LabwareTypeName.TUBE]}
            comments={comments}
          />
        )}

        {/* Filter out tubes as they've been shown above */}
        {Object.entries(layoutPlansByLabwareType)
          .filter(
            ([labwareTypeName, _]) => labwareTypeName !== LabwareTypeName.TUBE
          )
          .map(([labwareTypeName, lps]) => (
            <div key={labwareTypeName} className="space-y-4">
              <Heading level={3}>{labwareTypeName}</Heading>

              {lps.map((layoutPlan) => (
                <ConfirmLabware
                  onChange={handleConfirmChange}
                  onRemoveClick={handleRemoveClick}
                  key={layoutPlan.destinationLabware.barcode}
                  originalLayoutPlan={layoutPlan}
                  comments={comments}
                />
              ))}
            </div>
          ))}
        {serverErrors && (
          <div>
            <Warning
              error={serverErrors}
              message={"There was an error confirming the Sectioning operation"}
            />
          </div>
        )}

        {Object.keys(layoutPlansByLabwareType).length > 0 && (
          <div className="flex flex-row items-center justify-end">
            <PinkButton
              disabled={!current.matches({ ready: "valid" })}
              onClick={() => send("CONFIRM")}
              action="primary"
            >
              Save
            </PinkButton>
          </div>
        )}
      </div>
    </div>
  );
}
