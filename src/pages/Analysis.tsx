import React, { useCallback } from "react";
import AppShell from "../components/AppShell";
import Heading from "../components/Heading";
import {
  CommentFieldsFragment,
  ExtractResult,
  RnaAnalysisLabware,
} from "../types/sdk";
import ExtractResultPanel from "../components/extractResult/ExtractResultPanel";
import BlueButton from "../components/buttons/BlueButton";
import variants from "../lib/motionVariants";
import { motion } from "framer-motion";
import AnalysisLabware from "../components/analysisLabware/analysisLabware";

type AnalysisProps = {
  /***
   * Comments for 'analysis' category
   */
  comments: CommentFieldsFragment[];
};

function Analysis({ comments }: AnalysisProps) {
  const [extractResults, setExtractResults] = React.useState<ExtractResult[]>(
    []
  );
  const [analysisLabwares, setAnalysisLabwares] = React.useState<
    RnaAnalysisLabware[]
  >([]);
  const [analysisMode, setAnalysisMode] = React.useState(false);

  const onChange = useCallback(
    (result: ExtractResult[]) => {
      setExtractResults(result);
    },
    [extractResults]
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
            <ExtractResultPanel onChange={onChange} locked={false} />
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
              barcodes={extractResults.map((result) => result.labware.barcode)}
              comments={comments}
              analysisLabwares={analysisLabwares}
            />
          </motion.div>
        )}
      </AppShell.Main>

      {!analysisMode && (
        <div className="flex-shrink-0 max-w-screen-xl mx-auto">
          <div className="my-4 mx-4 sm:mx-auto p-4 rounded-md bg-gray-100">
            <p className="my-3 text-gray-800 text-sm leading-normal">
              Once <span className="font-bold text-gray-900">all tubes</span>{" "}
              have been scanned, click Analysis to record RNA Analysis.
            </p>

            <div className="flex flex-row items-center justify-center gap-4">
              <BlueButton
                id="#extract"
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
      )}
    </AppShell>
  );
}
export default Analysis;
