import React from "react";
import AppShell from "../../components/AppShell";
import { reload } from "../../lib/sdk";
import {
  FindPlanDataQuery,
  GetSectioningConfirmInfoQuery,
  LabwareFieldsFragment,
} from "../../types/sdk";
import SectioningConfirm from "../../components/sectioningConfirm/SectioningConfirm";
import { Link, useLocation } from "react-router-dom";
import { useConfirmLeave } from "../../lib/hooks";
import { history } from "../../lib/sdk";
import Heading from "../../components/Heading";
import BlueButton from "../../components/buttons/BlueButton";
import { motion } from "framer-motion";
import { ModalBody } from "../../components/Modal";
import Success from "../../components/notifications/Success";
import variants from "../../lib/motionVariants";
import { ConfirmPrintLabware } from "../../components/sectioningConfirm/ConfirmPrintLabware";
import NavigationPrompt, { ChildData } from "react-router-navigation-prompt";
import { ConfirmationNavigationModal } from "../../components/modal/ConfirmationNavigationModal";

type SectioningConfirmProps = {
  readonly sectioningConfirmInfo: GetSectioningConfirmInfoQuery;
};

function Confirm({ sectioningConfirmInfo }: SectioningConfirmProps) {
  const location = useLocation();
  const state = location.state as { plans?: Array<FindPlanDataQuery> };
  const plans: Array<FindPlanDataQuery> = state?.plans ?? [];
  const [shouldConfirm, setShouldConfirm] = useConfirmLeave(true);
  const [confirmedLabwares, setConfirmedLabwares] = React.useState<
    LabwareFieldsFragment[]
  >([]);

  const labwaresGroupedByType = React.useMemo(() => {
    const confirmedLabwareTypes = confirmedLabwares.reduce(
      (prev: string[], labware) => {
        if (!prev.includes(labware.labwareType.name)) {
          prev.push(labware.labwareType.name);
        }
        return prev;
      },
      []
    );

    const labwareGroups: LabwareFieldsFragment[][] = [];
    confirmedLabwareTypes.forEach((labwareType) => {
      labwareGroups.push(
        confirmedLabwares.filter(
          (labware) => labware.labwareType.name === labwareType
        )
      );
    });
    return labwareGroups;
  }, [confirmedLabwares]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Confirmation</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl ">
          {confirmedLabwares.length <= 0 ? (
            <SectioningConfirm
              initialPlans={plans}
              comments={sectioningConfirmInfo.comments}
              onConfirmed={(labwares) => {
                if (labwares) {
                  setConfirmedLabwares(labwares ?? []);
                }
                setShouldConfirm(false);
                window.scrollTo(0, 0);
              }}
            />
          ) : (
            <>
              <motion.div
                variants={variants.fadeInWithLift}
                data-testid="print-div"
                className="w-full py-4 px-8 mb-6"
              >
                <div className="space-y-6">
                  <Heading level={2}>{"Operation Complete"}</Heading>
                  <ModalBody>
                    {<Success message={"Sections Confirmed"} />}
                  </ModalBody>
                  {labwaresGroupedByType.map((labwaresByType) => (
                    <ConfirmPrintLabware
                      key={labwaresByType[0].labwareType.name}
                      labwareType={`${labwaresByType[0].labwareType.name}`}
                      labwares={labwaresByType}
                    />
                  ))}
                </div>
                <div className="flex-shrink-0 max-w-screen-xl mx-auto mt-12">
                  <div className="my-4 mx-4 sm:mx-auto p-4 rounded-md bg-gray-100">
                    <p className="my-3 text-gray-800 text-center text-sm  leading-normal">
                      If you wish to store all sectioned slides click
                      <span className="font-bold text-gray-900"> Store </span>
                      button.
                    </p>{" "}
                    <p className="my-3 text-gray-800 text-center text-sm  leading-normal">
                      Otherwise click{" "}
                      <span className="font-bold text-gray-900">
                        Reset Form
                      </span>{" "}
                      to start the process again or return to the{" "}
                      <span className="font-bold text-gray-900">Home</span>{" "}
                      screen.
                    </p>
                    <div className="flex flex-row items-center justify-center gap-4 mt-8">
                      <BlueButton
                        type="button"
                        style={{ marginLeft: "auto" }}
                        className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text:sm"
                        onClick={() => {
                          if (confirmedLabwares.length > 0) {
                            sessionStorage.setItem(
                              "awaitingLabwares",
                              confirmedLabwares
                                .map(
                                  (labware) =>
                                    `${labware.barcode}, ${labware.labwareType.name}`
                                )
                                .join(",")
                            );
                          }
                          history.push("/store");
                        }}
                      >
                        Store
                      </BlueButton>
                      <BlueButton onClick={reload} action="tertiary">
                        Reset Form
                      </BlueButton>
                      <Link to={"/"}>
                        <BlueButton action="primary">Return Home</BlueButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </AppShell.Main>

      {/**This is the replacement of Prompt which is removed in react-router version 6**/}
      <NavigationPrompt when={shouldConfirm}>
        {({ onConfirm, onCancel }: ChildData) => (
          <ConfirmationNavigationModal
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        )}
      </NavigationPrompt>
    </AppShell>
  );
}

export default Confirm;
