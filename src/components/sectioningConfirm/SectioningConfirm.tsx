import React, { useCallback, useEffect } from "react";
import { PlanFinder } from "../planFinder/PlanFinder";
import Heading from "../Heading";
import DataTable from "../DataTable";
import columns from "../dataTable/labwareColumns";
import { LabwareTypeName } from "../../types/stan";
import ConfirmTubes from "./ConfirmTubes";
import ConfirmLabware from "./ConfirmLabware";
import PinkButton from "../buttons/PinkButton";
import {
  CommentFieldsFragment,
  FindPlanDataQuery,
  LabwareFieldsFragment,
} from "../../types/sdk";
import { useMachine } from "@xstate/react";
import { createSectioningConfirmMachine } from "./sectioningConfirm.machine";
import Warning from "../notifications/Warning";
import WorkNumberSelect from "../WorkNumberSelect";
import RadioGroup, { RadioButtonInput } from "../forms/RadioGroup";
import { objectKeys } from "../../lib/helpers";
import { ConfirmationModal } from "../modal/ConfirmationModal";
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
   * Callback when sections have been successfully confirmed,with created labwares as parameter
   */
  onConfirmed: (labwares?: Array<LabwareFieldsFragment>) => void;
};

export enum SectionNumberMode {
  Auto = "Auto",
  Manual = "Manual",
}

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

  const {
    sourceLabware,
    layoutPlansByLabwareType,
    requestError,
    confirmSectionResultLabwares,
    sectionNumberMode,
  } = current.context;

  const [labwarePlanToDelete, setLabwarePlanToDelete] = React.useState<
    LayoutPlan | undefined
  >(undefined);

  /**
   * Call the {@code onConfirmed} callback when machine reaches the {@code confirmed} state
   */
  useEffect(() => {
    const subscription = service.subscribe((state) => {
      if (state.matches("confirmed")) {
        onConfirmed(confirmSectionResultLabwares);
      }
    });
    return subscription.unsubscribe;
  }, [service, onConfirmed, confirmSectionResultLabwares]);

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
    (confirmSectionLabware, sourceLabwares: LabwareFieldsFragment[]) => {
      send({
        type: "UPDATE_CONFIRM_SECTION_LABWARE",
        confirmSectionLabware,
        sourceLabwares,
      });
    },
    [send]
  );

  /**
   * Callback to handle change in section numbering mode
   */
  const handleSectionNumberingModeChange = useCallback(
    (mode: SectionNumberMode) => {
      send({ type: "UPDATE_SECTION_NUMBERING_MODE", mode });
    },
    [send]
  );

  /**
   * Callback to handle deleting labware plan
   */
  const handleDeleteLabwarePlan = useCallback(
    (layoutPlan: LayoutPlan, deleteLabwarePlan: (barcode: string) => void) => {
      if (sectionNumberMode === SectionNumberMode.Auto) {
        setLabwarePlanToDelete(layoutPlan);
      } else {
        deleteLabwarePlan(layoutPlan.destinationLabware.barcode!);
      }
    },
    [setLabwarePlanToDelete, sectionNumberMode]
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
                  <>
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

                    <div className={"sm:justify-between px-3"}>
                      <Heading level={3}>Section Numbering</Heading>
                      <RadioGroup
                        label="Select mode"
                        name={"sectionNumber"}
                        withFormik={false}
                      >
                        {objectKeys(SectionNumberMode).map((key) => {
                          return (
                            <RadioButtonInput
                              key={key}
                              name={"sectionNumber"}
                              value={SectionNumberMode[key]}
                              checked={
                                sectionNumberMode === SectionNumberMode[key]
                              }
                              onChange={() =>
                                handleSectionNumberingModeChange(
                                  SectionNumberMode[key]
                                )
                              }
                              label={SectionNumberMode[key]}
                            />
                          );
                        })}
                      </RadioGroup>
                    </div>
                  </>
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
                      disableSectionNumbers={
                        sectionNumberMode === SectionNumberMode.Auto
                      }
                    />
                  )}

                  {/* Filter out tubes as they've been shown above */}
                  {Object.entries(layoutPlansByLabwareType)
                    .filter(
                      ([labwareTypeName, _]) =>
                        labwareTypeName !== LabwareTypeName.TUBE
                    )
                    .map(([labwareTypeName, lps]) => {
                      return (
                        <div key={labwareTypeName} className="space-y-4">
                          <Heading level={3}>{labwareTypeName}</Heading>

                          {lps.map((layoutPlan) => (
                            <ConfirmLabware
                              onChange={handleConfirmChange}
                              onRemoveClick={(labwareBarcode) => {
                                handleDeleteLabwarePlan(
                                  labwareBarcode,
                                  removePlanByBarcode
                                );
                              }}
                              key={layoutPlan.destinationLabware.barcode}
                              originalLayoutPlan={layoutPlan}
                              comments={comments}
                              disableSectionNumbers={
                                sectionNumberMode === SectionNumberMode.Auto
                              }
                            />
                          ))}
                        </div>
                      );
                    })}
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
                <ConfirmationModal
                  show={labwarePlanToDelete !== undefined}
                  header={"Removing labware"}
                  message={{ type: "Warning", text: "Section number update" }}
                  confirmOptions={[
                    {
                      label: "Cancel",
                      action: () => {
                        setLabwarePlanToDelete(undefined);
                      },
                    },
                    {
                      label: "Continue",
                      action: () => {
                        labwarePlanToDelete &&
                          labwarePlanToDelete.destinationLabware.barcode &&
                          removePlanByBarcode(
                            labwarePlanToDelete.destinationLabware.barcode
                          );
                        setLabwarePlanToDelete(undefined);
                      },
                    },
                  ]}
                >
                  <p className={"font-bold mt-8"}>
                    Section numbers of remaining plans with same source labware
                    will be renumbered with deletion.
                  </p>
                </ConfirmationModal>
              </div>
            )}
          </PlanFinder>
        </div>
      </div>
    </div>
  );
}
