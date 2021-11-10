import React, { useCallback } from "react";
import AppShell from "../components/AppShell";
import Heading from "../components/Heading";
import {
  CommentFieldsFragment,
  ExtractResultQuery,
  RecordRnaAnalysisMutation,
  RnaAnalysisLabware,
  RnaAnalysisRequest,
} from "../types/sdk";
import ExtractResultPanel from "../components/extractResult/ExtractResultPanel";
import BlueButton from "../components/buttons/BlueButton";
import variants from "../lib/motionVariants";
import { motion } from "framer-motion";
import AnalysisLabware from "../components/analysisLabware/analysisLabware";
import createFormMachine from "../lib/machines/form/formMachine";
import { useMachine } from "@xstate/react";
import { reload, stanCore } from "../lib/sdk";
import ButtonBar from "../components/ButtonBar";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import Warning from "../components/notifications/Warning";
import { Link } from "react-router-dom";

type AnalysisProps = {
  /***
   * Comments for 'analysis' category
   */
  comments: CommentFieldsFragment[];
};

function Analysis({ comments }: AnalysisProps) {
  const [extractResults, setExtractResults] = React.useState<
    ExtractResultQuery[]
  >([]);
  const [analysisLabwares, setAnalysisLabwares] = React.useState<
    RnaAnalysisLabware[]
  >([]);
  const [operationType, setOperationType] = React.useState("");
  const [analysisMode, setAnalysisMode] = React.useState(false);

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
  const { serverError } = current.context;

  const onChangeExtractResults = useCallback((result: ExtractResultQuery[]) => {
    setExtractResults(result);
  }, []);

  const onChangeLabwareData = useCallback(
    (operationType: string, labwares: RnaAnalysisLabware[]) => {
      setAnalysisLabwares(labwares);
      setOperationType(operationType);
    },
    []
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title> Analysis</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="mt-8 space-y-4">
            <Heading level={3}> Section Tubes </Heading>
            <ExtractResultPanel
              onChangeExtractResults={onChangeExtractResults}
              locked={analysisMode}
            />
          </div>
        </div>
        {analysisMode && (
          <motion.div
            initial={"hidden"}
            animate={"visible"}
            variants={variants.fadeIn}
            className="mt-12  space-y-4"
          >
            <AnalysisLabware
              barcodes={extractResults.map(
                (result) => result.extractResult.labware.barcode
              )}
              comments={comments}
              analysisLabwares={analysisLabwares}
              onChangeLabwareData={onChangeLabwareData}
            />
          </motion.div>
        )}
      </AppShell.Main>

      {!analysisMode ? (
        <div className="flex-shrink-0 max-w-screen-xl mx-auto">
          <div className="my-4 mx-4 sm:mx-auto p-4 rounded-md bg-gray-100">
            <p className="my-3 text-gray-800 text-sm leading-normal">
              Once <span className="font-bold text-gray-900">all tubes</span>{" "}
              have been scanned, click Analysis to record RNA Analysis.
            </p>

            <div className="flex flex-row items-center justify-center gap-4">
              <BlueButton
                id="analysis"
                disabled={extractResults.length < 1}
                className="whitespace-nowrap"
                action={"primary"}
                onClick={() => {
                  setAnalysisMode(true);
                }}
              >
                Analysis
              </BlueButton>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {serverError ? (
            <Warning
              message={"Failed to record RNA Analysis results"}
              error={serverError}
            />
          ) : (
            <OperationCompleteModal
              show={current.matches("submitted")}
              message={"RNA Analysis data saved"}
              onReset={reload}
            >
              <p>
                If you wish to start the process again, click the "Reset Form"
                button. Otherwise you can return to the Home screen.
              </p>
            </OperationCompleteModal>
          )}
          <ButtonBar>
            <BlueButton onClick={reload} action="tertiary">
              Reset Form
            </BlueButton>
            <Link to={"/"}>
              <BlueButton action="primary">Return Home</BlueButton>
            </Link>
            <BlueButton
              onClick={() =>
                send({
                  type: "SUBMIT_FORM",
                  values: {
                    operationType: operationType,
                    labware: analysisLabwares,
                  },
                })
              }
            >
              Save
            </BlueButton>
          </ButtonBar>
        </div>
      )}
    </AppShell>
  );
}
export default Analysis;
