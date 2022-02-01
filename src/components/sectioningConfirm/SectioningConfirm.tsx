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
import WorkNumberSelect from "../WorkNumberSelect";
import { Dictionary } from "lodash";
import { LayoutPlan } from "../../lib/machines/layout/layoutContext";

type SectioningConfirmProps = {
  /**
   * The list of comments that will be available for the user to choose for each section
   */
  comments: Array<CommentFieldsFragment>;

  /**
   * The initial list of plans
   */
  initialPlans: Array<FindPlanDataQuery>;

  /**
   * Callback for when sections have been successfully confirmed
   */
  onConfirmed: (plans?: Array<LayoutPlan>) => void;
};

/**
 * Component for managing the confirmation of a list of Sectioning Plans.
 * Responsible for calling core with the {@code confirmSection} request.
 */
export default function SectioningConfirm({
  comments,
  initialPlans,
  onConfirmed,
}: SectioningConfirmProps) {
  const [current, send, service] = useMachine(createSectioningConfirmMachine());

  /**Get plans in the same order as displayed*/
  const getPlansInDisplayedOrder = React.useCallback(
    (plans: Dictionary<Array<LayoutPlan>>) => {
      let layoutPlansOrdered: LayoutPlan[] = [];
      if (plans[LabwareTypeName.TUBE]) {
        layoutPlansOrdered = [...plans[LabwareTypeName.TUBE]];
      }
      Object.entries(plans)
        .filter(
          ([labwareTypeName, _]) => labwareTypeName !== LabwareTypeName.TUBE
        )
        .forEach(([_, lps]) => {
          layoutPlansOrdered = [...layoutPlansOrdered, ...lps];
        });
      return layoutPlansOrdered;
    },
    []
  );

  const {
    sourceLabware,
    layoutPlansByLabwareType,
    requestError,
  } = current.context;

  /**
   * Call the {@code onConfirmed} callback when machine reaches the {@code confirmed} state
   */
  useEffect(() => {
    const subscription = service.subscribe((state) => {
      if (state.matches("confirmed")) {
        const orderedPlans = getPlansInDisplayedOrder(layoutPlansByLabwareType);
        onConfirmed(orderedPlans);
      }
    });
    return subscription.unsubscribe;
  }, [
    service,
    onConfirmed,
    layoutPlansByLabwareType,
    getPlansInDisplayedOrder,
  ]);

  /**
   * Callback for when the work number select changes
   */
  const handleWorkNumberChange = useCallback(
    (workNumber?: string) => {
      send({ type: "UPDATE_WORK_NUMBER", workNumber });
    },
    [send]
  );

  /**
   * Callback for when the {@link PlanFinder} updates its list of plans
   */
  const handlePlanChange = useCallback(
    (plans: Array<FindPlanDataQuery>) => {
      send({ type: "UPDATE_PLANS", plans });
    },
    [send]
  );

  /**
   * Callback for when a {@link ConfirmLabware} or {@link ConfirmTubes} updates
   * e.g. sections are added, comments are made against sections
   */
  const handleConfirmChange = useCallback(
    (confirmSectionLabware) => {
      send({ type: "UPDATE_CONFIRM_SECTION_LABWARE", confirmSectionLabware });
    },
    [send]
  );

  return (
    <div className="my-4 mx-auto max-w-screen-xl space-y-12">
      <div>
        <Heading level={3}>SGP Number</Heading>
        <p className="mt-2">
          You may optionally select an SGP number to associate with this
          confirmation.
        </p>
        <div className="mt-4 md:w-1/2">
          <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
        </div>
      </div>

      <div>
        <Heading level={3}>Find Plans</Heading>

        <p className="mt-2">
          Find sectioning plans for labware by scanning the labware barcode into
          the input below:
        </p>

        <div className="mt-4">
          <PlanFinder initialPlans={initialPlans} onChange={handlePlanChange}>
            {({ removePlanByBarcode }) => (
              <div className="mt-8 space-y-12">
                {Object.keys(layoutPlansByLabwareType).length > 0 && (
                  <div className="space-y-4">
                    <Heading level={3}>Source Labware</Heading>
                    <DataTable
                      data={sourceLabware}
                      columns={[
                        columns.barcode(),
                        columns.highestSectionForSlot("A1"),
                      ]}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {/* Always show tubes first (if there are any) */}
                  {layoutPlansByLabwareType?.[LabwareTypeName.TUBE] && (
                    <ConfirmTubes
                      onChange={handleConfirmChange}
                      layoutPlans={
                        layoutPlansByLabwareType[LabwareTypeName.TUBE]
                      }
                      comments={comments}
                    />
                  )}

                  {/* Filter out tubes as they've been shown above */}
                  {Object.entries(layoutPlansByLabwareType)
                    .filter(
                      ([labwareTypeName, _]) =>
                        labwareTypeName !== LabwareTypeName.TUBE
                    )
                    .map(([labwareTypeName, lps]) => (
                      <div key={labwareTypeName} className="space-y-4">
                        <Heading level={3}>{labwareTypeName}</Heading>

                        {lps.map((layoutPlan) => (
                          <ConfirmLabware
                            onChange={handleConfirmChange}
                            onRemoveClick={removePlanByBarcode}
                            key={layoutPlan.destinationLabware.barcode}
                            originalLayoutPlan={layoutPlan}
                            comments={comments}
                          />
                        ))}
                      </div>
                    ))}
                  {requestError && (
                    <div>
                      <Warning
                        error={requestError}
                        message={
                          "There was an error confirming the Sectioning operation"
                        }
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
            )}
          </PlanFinder>
        </div>
      </div>
    </div>
  );
}
