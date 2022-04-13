import React, { useMemo } from "react";
import AppShell from "../components/AppShell";
import Heading from "../components/Heading";
import {
  LabwareFieldsFragment,
  RecordRnaAnalysisMutation,
  RnaAnalysisRequest,
} from "../types/sdk";
import BlueButton from "../components/buttons/BlueButton";
import createFormMachine from "../lib/machines/form/formMachine";
import { useMachine } from "@xstate/react";
import { stanCore } from "../lib/sdk";
import MutedText from "../components/MutedText";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import LabwareScanPanel from "../components/labwareScanPanel/LabwareScanPanel";
import labwareColumns from "../components/dataTable/labwareColumns";

function FetalWaste() {
  const [current, send] = useMachine(
    createFormMachine<
      RnaAnalysisRequest,
      RecordRnaAnalysisMutation
    >().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordRNAAnalysis({
            request: e.values,
          });
        },
      },
    })
  );
  const [fetalWasteLabware, setFetalWasteLabware] = React.useState<
    LabwareFieldsFragment[]
  >([]);

  const columns = useMemo(() => [labwareColumns.barcode()], []);
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title> Fetal Waste</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="mt-8 space-y-8">
            <Heading level={3}> Labware </Heading>
            <div>
              {fetalWasteLabware.length === 0 && (
                <MutedText>Scan a piece of labware to get started</MutedText>
              )}
              <div className="sm:w-2/3 md:w-1/2 mb-4">
                <LabwareScanner
                  onChange={(labwares) =>
                    setFetalWasteLabware((prev) => [...prev, ...labwares])
                  }
                >
                  <LabwareScanPanel columns={columns} />
                </LabwareScanner>
              </div>
            </div>
          </div>
        </div>
      </AppShell.Main>

      {fetalWasteLabware.length > 0 && (
        <div className="flex-shrink-0 max-w-screen-xl mx-auto">
          <div className="my-4 mx-4 sm:mx-auto p-4 rounded-md bg-gray-100">
            <p className="my-3 text-gray-800 text-sm leading-normal">
              Once <span className="font-bold text-gray-900">all labware</span>{" "}
              have been scanned, click
              <span className="font-bold text-gray-900"> Convert</span> to
              change bio state of all scanned labware to 'Fetal Waste'.
            </p>

            <div className="flex flex-row items-center justify-center gap-4">
              <BlueButton
                id="convert"
                disabled={fetalWasteLabware.length < 1}
                className="whitespace-nowrap"
                action={"primary"}
                onClick={() => {}}
              >
                Convert
              </BlueButton>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
export default FetalWaste;
