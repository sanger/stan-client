import React, { useCallback } from 'react';
import AppShell from '../components/AppShell';
import Heading from '../components/Heading';
import {
  CommentFieldsFragment,
  EquipmentFieldsFragment,
  ExtractResultQuery,
  RecordRnaAnalysisMutation,
  RnaAnalysisLabware,
  RnaAnalysisRequest
} from '../types/sdk';
import ExtractResultPanel from '../components/extractResult/ExtractResultPanel';
import BlueButton from '../components/buttons/BlueButton';
import variants from '../lib/motionVariants';
import { motion } from '../dependencies/motion';
import AnalysisLabware from '../components/analysisLabware/analysisLabware';
import createFormMachine from '../lib/machines/form/formMachine';
import { useMachine } from '@xstate/react';
import { reload, stanCore } from '../lib/sdk';
import ButtonBar from '../components/ButtonBar';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import Warning from '../components/notifications/Warning';
import { Link, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { fromPromise } from 'xstate';

// TODO Add front-end validation to this page

type AnalysisProps = {
  /***
   * Comments for 'RNA analysis' category
   */
  comments: CommentFieldsFragment[];
  /***
   * equipments for 'RNA analysis' category
   */
  equipments: [];
};

function Analysis() {
  const analysisProps = useLoaderData() as AnalysisProps;
  const navigate = useNavigate();
  const initExtractResult: ExtractResultQuery[] = useLocation().state as ExtractResultQuery[];
  const comments = analysisProps.comments;
  const equipments: EquipmentFieldsFragment[] = analysisProps.equipments;
  const [extractResults, setExtractResults] = React.useState<ExtractResultQuery[]>(initExtractResult ?? []);
  const [analysisLabwares, setAnalysisLabwares] = React.useState<RnaAnalysisLabware[]>([]);
  const [equipmentId, setEquipmentId] = React.useState(0);
  const [operationType, setOperationType] = React.useState('');
  const [analysisMode, setAnalysisMode] = React.useState(false);

  const formMachine = React.useMemo(() => {
    return createFormMachine<RnaAnalysisRequest, RecordRnaAnalysisMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordRNAAnalysis({
            request: input.event.values
          });
        })
      }
    });
  }, []);
  const [current, send] = useMachine(formMachine);
  const { serverError } = current.context;

  const onChangeExtractResults = useCallback((result: ExtractResultQuery[]) => {
    setExtractResults(result);
  }, []);

  const onChangeLabwareData = useCallback((operationType: string, labwares: RnaAnalysisLabware[]) => {
    setAnalysisLabwares(labwares);
    setOperationType(operationType);
  }, []);

  const onChangeEquipment = useCallback((equipmentId: number) => {
    setEquipmentId(equipmentId);
  }, []);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Analysis</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="mt-8 space-y-4">
            <Heading level={3}> Labware </Heading>
            <ExtractResultPanel
              onChangeExtractResults={onChangeExtractResults}
              locked={analysisMode}
              initExtractedResults={initExtractResult}
            />
          </div>
        </div>
        {analysisMode && (
          <motion.div initial={'hidden'} animate={'visible'} variants={variants.fadeIn} className="mt-12  space-y-4">
            <AnalysisLabware
              barcodes={extractResults.map((result) => result.extractResult.labware.barcode)}
              comments={comments}
              equipments={equipments}
              analysisLabwares={analysisLabwares}
              onChangeLabwareData={onChangeLabwareData}
              onChangeEquipment={onChangeEquipment}
            />
          </motion.div>
        )}
      </AppShell.Main>

      {!analysisMode ? (
        <div className="shrink-0 max-w-screen-xl mx-auto">
          <div className="my-4 mx-4 sm:mx-auto p-4 rounded-md bg-gray-100">
            <p className="my-3 text-gray-800 text-sm leading-normal">
              Once <span className="font-bold text-gray-900">all tubes</span> have been scanned, click Analysis to
              record RNA Analysis.
            </p>

            <div className="flex flex-row items-center justify-center gap-4">
              <BlueButton
                id="analysis"
                disabled={extractResults.length < 1}
                className="whitespace-nowrap"
                action={'primary'}
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
            <Warning message={'Failed to record RNA Analysis results'} error={serverError} />
          ) : (
            <OperationCompleteModal show={current.matches('submitted')} message={'RNA Analysis data saved'}>
              <p>
                If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the
                Home screen.
              </p>
            </OperationCompleteModal>
          )}
          <ButtonBar>
            <BlueButton onClick={() => reload(navigate)} action="tertiary">
              Reset Form
            </BlueButton>
            <Link to={'/'}>
              <BlueButton action="primary">Return Home</BlueButton>
            </Link>
            <BlueButton
              onClick={() => {
                send({
                  type: 'SUBMIT_FORM',
                  values: {
                    operationType: operationType,
                    labware: analysisLabwares,
                    equipmentId: equipmentId
                  }
                });
              }}
              disabled={equipmentId > 0 && operationType && operationType.length > 1 ? false : true}
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
