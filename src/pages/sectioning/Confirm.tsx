import React from "react";
import AppShell from "../../components/AppShell";
import { reload } from "../../lib/sdk";
import {
  FindPlanDataQuery,
  GetSectioningConfirmInfoQuery,
  LabwareFieldsFragment,
} from "../../types/sdk";
import SectioningConfirm from "../../components/sectioningConfirm/SectioningConfirm";
import { Link, Prompt, useLocation } from "react-router-dom";
import { useConfirmLeave, usePrinters } from "../../lib/hooks";
import { history } from "../../lib/sdk";
import DataTable from "../../components/DataTable";
import LabelPrinter, { PrintResult } from "../../components/LabelPrinter";
import { CellProps } from "react-table";
import LabelPrinterButton from "../../components/LabelPrinterButton";
import labwareScanTableColumns from "../../components/dataTable/labwareColumns";
import Heading from "../../components/Heading";
import BlueButton from "../../components/buttons/BlueButton";
import OperationCompleteModal from "../../components/modal/OperationCompleteModal";
import { ModalBody, ModalHeader } from "../../components/Modal";
import Success from "../../components/notifications/Success";
import Warning from "../../components/notifications/Warning";

type SectioningConfirmProps = {
  readonly sectioningConfirmInfo: GetSectioningConfirmInfoQuery;
};

function Confirm({ sectioningConfirmInfo }: SectioningConfirmProps) {
  const location = useLocation<{ plans?: Array<FindPlanDataQuery> }>();
  const plans: Array<FindPlanDataQuery> = location?.state?.plans ?? [];
  const [shouldConfirm, setShouldConfirm] = useConfirmLeave(true);
  const [confirmedLabwares, setConfirmedLabwares] = React.useState<
    LabwareFieldsFragment[]
  >([]);

  const {
    handleOnPrint,
    handleOnPrintError,
    printResult,
    currentPrinter,
    handleOnPrinterChange,
  } = usePrinters();

  // Special case column that renders a label printer button for each row
  const printColumn = {
    id: "printer",
    Header: "",
    Cell: (props: CellProps<LabwareFieldsFragment>) => (
      <LabelPrinterButton
        labwares={[props.row.original]}
        selectedPrinter={currentPrinter}
        onPrint={handleOnPrint}
        onPrintError={handleOnPrintError}
      />
    ),
  };

  const labwaresGroupedByType = React.useMemo(() => {
    debugger;
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

  const columns = [labwareScanTableColumns.barcode(), printColumn];
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Confirmation</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          {confirmedLabwares.length <= 0 ? (
            <SectioningConfirm
              initialPlans={plans}
              comments={sectioningConfirmInfo.comments}
              onConfirmed={(labwares) => {
                if (labwares) {
                  setConfirmedLabwares(labwares ?? []);
                }
                setShouldConfirm(false);
              }}
            />
          ) : (
            <>
              <div
                data-testid="print-div"
                className="w-full space-y-4 py-4 px-8 mb-6"
              >
                <Heading level={2}>{"Operation Complete"}</Heading>
                <ModalBody>
                  {<Success message={"Sections Confirmed"} />}
                </ModalBody>
                <div className="mb-8" />
                {labwaresGroupedByType.map((labwaresByType) => (
                  <div className={"space-y-4 px-4"}>
                    <Heading
                      level={3}
                      showBorder={false}
                    >{`${labwaresByType[0].labwareType.name} Labels`}</Heading>
                    <DataTable columns={columns} data={labwaresByType} />

                    <LabelPrinter
                      labwares={labwaresByType}
                      showNotifications={false}
                      onPrinterChange={handleOnPrinterChange}
                      onPrint={handleOnPrint}
                      onPrintError={handleOnPrintError}
                    />
                    {printResult && <PrintResult result={printResult} />}
                  </div>
                ))}

                <div className="flex-shrink-0 max-w-screen-xl mx-auto">
                  <div className="my-4 mx-4 sm:mx-auto p-4 rounded-md bg-gray-100">
                    <p className="my-3 text-gray-800 text-sm leading-normal">
                      If you wish to store all sectioned slides click
                      <span className="font-bold text-gray-900"> “Store” </span>
                      button. Otherwise click
                      <span className="font-bold text-gray-900">
                        Reset Form
                      </span>
                      to start the process again or return to the
                      <span className="font-bold text-gray-900">Home</span>
                      screen.
                    </p>

                    <div className="flex flex-row items-center justify-center gap-4">
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
              </div>
            </>
          )}
        </div>
      </AppShell.Main>

      <Prompt
        when={shouldConfirm}
        message={"You have unsaved changes. Are you sure you want to leave?"}
      />
    </AppShell>
  );
}

export default Confirm;
