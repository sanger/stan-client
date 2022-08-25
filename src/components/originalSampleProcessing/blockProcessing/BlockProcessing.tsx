import {
  GetBlockProcessingInfoQuery,
  LabwareFieldsFragment,
  NextReplicateDataFieldsFragment,
  PerformTissueBlockMutation,
  TissueBlockRequest
} from '../../../types/sdk';
import { useMachine } from '@xstate/react';
import ButtonBar from '../../ButtonBar';
import BlueButton from '../../buttons/BlueButton';
import React from 'react';
import { LabwareTypeName, NewLabwareLayout } from '../../../types/stan';
import labwareScanTableColumns from '../../dataTable/labwareColumns';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import BlockProcessingLabwarePlan from './BlockProcessingLabwarePlan';
import { cloneDeep, Dictionary, groupBy } from 'lodash';
import Heading from '../../Heading';
import Planner, { PlanChangedProps } from '../../planning/Planner';
import createFormMachine from '../../../lib/machines/form/formMachine';
import { stanCore } from '../../../lib/sdk';
import WorkNumberSelect from '../../WorkNumberSelect';
import columns from '../../dataTable/labwareColumns';
import Warning from '../../notifications/Warning';
import variants from '../../../lib/motionVariants';
import { motion } from 'framer-motion';
import { optionValues } from '../../forms';
import ProcessingSuccess from '../ProcessingSuccess';
import { useConfirmLeave } from '../../../lib/hooks';
import { Prompt } from 'react-router-dom';
import { Row } from 'react-table';
import FormikInput from '../../forms/Input';

/**
 * Used as Formik's values
 */
export type BlockFormValue = {
  sourceBarcode: string;
  labwareType: string;
  replicateNumber: string;
  medium?: string;
  commentId?: number;
  preBarcode?: string;
};
export type BlockFormData = {
  workNumber: string;
  plans: BlockFormValue[];
  discardSources?: { sourceBarcode: string; discard: boolean }[];
};

const allowedLabwareTypeNames: Array<LabwareTypeName> = [
  LabwareTypeName.TUBE,
  LabwareTypeName.PRE_BARCODED_TUBE,
  LabwareTypeName.PROVIASETTE,
  LabwareTypeName.CASSETTE
];

type BlockProcessingParams = {
  readonly processingInfo: GetBlockProcessingInfoQuery;
};

export default function BlockProcessing({ processingInfo }: BlockProcessingParams) {
  const formMachine = React.useMemo(() => {
    return createFormMachine<TissueBlockRequest, PerformTissueBlockMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.PerformTissueBlock({
            request: e.values
          });
        }
      }
    });
  }, []);
  const [current, send] = useMachine(formMachine);

  const { submissionResult, serverError } = current.context;
  /**
   * For tracking whether the user gets a prompt if they tried to navigate to another page
   */
  const [shouldConfirm] = useConfirmLeave(true);

  const [selectedLabwareType, setSelectedLabwareType] = React.useState<string>(LabwareTypeName.TUBE);
  const [numLabware, setNumLabware] = React.useState<number>(1);

  /**Next replicate data  for all source labware scanned**/
  const [nextReplicateData, setNextReplicateData] = React.useState<NextReplicateDataFieldsFragment[]>([]);

  /**To keep the mapping between source selected and the plan. Key is source labware barcode and value is unique id for a plan created**/
  const [planToSourceMap, setPlanToSourceMap] = React.useState(new Map<string, string>());

  /**
   * Limit the labware types the user can Section on to.
   */
  const allowedLabwareTypes = React.useMemo(
    () =>
      processingInfo
        ? processingInfo.labwareTypes.filter((lw) => allowedLabwareTypeNames.includes(lw.name as LabwareTypeName))
        : [],
    [processingInfo]
  );

  /**A source is selected for a plan, so update the mapping state between source and plan**/
  const notifySourceSelection = React.useCallback(
    (cid: string, sourceBarcode: string) => {
      if (planToSourceMap.has(cid) && planToSourceMap.get(cid) === sourceBarcode) {
        return;
      }
      setPlanToSourceMap((prev) => {
        const map = new Map<string, string>();
        Array.from(prev.entries()).forEach(([key, value]) => {
          map.set(key, value);
        });
        map.set(cid, sourceBarcode);
        return map;
      });
    },
    [planToSourceMap]
  );

  /** Display created Labware plans**/
  const buildPlanLayouts = React.useCallback(
    (
      plans: Map<string, NewLabwareLayout>,
      sourceLabware: LabwareFieldsFragment[],
      sampleColors: Map<number, string>,
      deleteAction: (cid: string) => void,
      confirmAction?: (cid: string, plan: undefined) => void,
      scrollRef?: React.MutableRefObject<HTMLDivElement | null>
    ) => {
      type PlanWithId = {
        cid: string;
        plan: NewLabwareLayout | undefined;
      };
      //Group plans labware type
      const planWithKeys: PlanWithId[] = Array.from(plans.keys()).map((k) => {
        return {
          cid: k,
          plan: plans.get(k)
        };
      });
      const layoutPlanGroupedByType: Dictionary<PlanWithId[]> = groupBy(
        planWithKeys,
        (planWithKey) => planWithKey.plan!.labwareType.name
      );
      const nextReplicateDataCopy = cloneDeep(nextReplicateData);

      let rowIndx: number = 0;
      return Object.keys(layoutPlanGroupedByType).length > 0 ? (
        <div className={'flex flex-col py-10 gap-y-20'}>
          {allowedLabwareTypeNames.map((labwareType) => {
            const labwarePlans = layoutPlanGroupedByType[labwareType];
            return (
              labwarePlans && (
                <div className={'flex flex-col'} data-testid={`divSection-${labwareType}`} key={labwareType}>
                  <Heading className={'mb-8'} level={2}>{`${labwareType.toString()}s`}</Heading>
                  {labwarePlans.map((lwPlan, indx) => {
                    //Auto numbering for replicateNumbers
                    const sourcebarcode = planToSourceMap.get(lwPlan.cid);
                    /** Make sure
                     * 1) All labware with sources having same original samples(donor id + spatial location) are numbered consecutively
                     * 2) All labware with same source are numbered consecutively
                     ***/
                    let replicateData: NextReplicateDataFieldsFragment | undefined = undefined;
                    if (sourcebarcode) {
                      replicateData = nextReplicateDataCopy.find((repData) =>
                        repData.barcodes.some((barcode) => barcode === sourcebarcode)
                      );
                      if (replicateData) {
                        replicateData.nextReplicateNumber++;
                      }
                    }
                    rowIndx++;
                    return (
                      <BlockProcessingLabwarePlan
                        key={lwPlan.cid}
                        cid={lwPlan.cid}
                        blockProcessInfo={processingInfo!}
                        outputLabware={lwPlan.plan!}
                        sourceLabware={sourceLabware}
                        sampleColors={sampleColors}
                        onDelete={deleteAction}
                        rowIndex={rowIndx - 1}
                        replicateNumber={replicateData ? replicateData.nextReplicateNumber - 1 : -1}
                        ref={
                          labwareType === selectedLabwareType && indx === labwarePlans.length - numLabware
                            ? scrollRef
                            : undefined
                        }
                        notifySourceSelection={notifySourceSelection}
                      />
                    );
                  })}
                </div>
              )
            );
          })}
        </div>
      ) : (
        <></>
      );
    },
    [processingInfo, selectedLabwareType, numLabware, nextReplicateData, notifySourceSelection, planToSourceMap]
  );

  /**
   * Display settings panel to add labware
   */
  const buildPlanCreationSettings = React.useCallback(() => {
    return (
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-center text-sm">
        <div className="text-gray-500">Labware type</div>
        <div className="text-gray-500">Number of labware</div>
        <select
          className="mt-1 block  py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100"
          onChange={(e) => setSelectedLabwareType(e.currentTarget.value)}
          data-testid={'labwareType'}
          value={selectedLabwareType}
        >
          {optionValues(allowedLabwareTypes, 'name', 'name')}
        </select>
        <input
          type="number"
          className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100"
          onChange={(e) => setNumLabware(Number(e.currentTarget.value))}
          value={numLabware}
          data-testid={'numLabware'}
          min={1}
        />
      </div>
    );
  }, [selectedLabwareType, setSelectedLabwareType, numLabware, setNumLabware, allowedLabwareTypes]);

  /**
   * Builds a yup validator for the labware plan form
   */
  function buildValidationSchema(): Yup.AnyObjectSchema {
    return Yup.object().shape({
      workNumber: Yup.string().required('SGP Number is required'),
      plans: Yup.array()
        .of(
          Yup.object().shape({
            sourceBarcode: Yup.string().required().min(1),
            medium: Yup.string()
              .required('Medium is required')
              .oneOf(
                processingInfo.mediums.map((medium) => medium.name),
                'Medium is required'
              ),
            replicateNumber: Yup.string().required('Replicate number is required'),
            commentId: Yup.number().optional(),
            labwareType: Yup.string()
              .required()
              .oneOf(allowedLabwareTypes.map((type) => type.name)),
            preBarcode: Yup.string().when('labwareType', {
              is: (value: string) => value === LabwareTypeName.PRE_BARCODED_TUBE,
              then: Yup.string()
                .required('Barcode is required')
                .matches(/[a-zA-Z]{2}\d{8}/, 'Barcode should be in the format with two letters followed by 8 numbers')
            })
          })
        )
        .required()
        .min(1),
      discardSources: Yup.array()
        .of(
          Yup.object().shape({
            sourceBarcode: Yup.string().optional(),
            discard: Yup.boolean().optional()
          })
        )
        .optional()
    });
  }

  /**Reformat form data as mutation input**/
  const buildTissueBlockRequest = (formData: BlockFormData): TissueBlockRequest => {
    return {
      workNumber: formData.workNumber,
      labware: formData.plans.map((plan) => ({
        sourceBarcode: plan.sourceBarcode,
        preBarcode: plan.preBarcode,
        commentId: plan.commentId,
        replicate: plan.replicateNumber,
        medium: plan.medium ?? '',
        labwareType: plan.labwareType
      })),
      discardSourceBarcodes: formData.discardSources?.filter((ds) => ds.discard).map((ds) => ds.sourceBarcode)
    };
  };

  const discardSourceColumn = React.useMemo(() => {
    return {
      Header: 'Discard Source',
      id: 'discard_source',
      Cell: ({ row }: { row: Row<LabwareFieldsFragment> }) => {
        return (
          <>
            <FormikInput
              name={`discardSources.${row.index}.sourceBarcode`}
              label={''}
              type={'hidden'}
              value={row.original.barcode}
            />
            <FormikInput
              label={''}
              className={'content-center align-middle justify-center'}
              name={`discardSources.${row.index}.discard`}
              type={'checkbox'}
            />
          </>
        );
      }
    };
  }, []);

  /**Notifies about a plan change - so  make sure that we have fetched nextReplicateData for all source labware scanned
   * This is the only place we can check it, as we don't have a specific action to denote all source labware scanning is finished
   * Inorder to avoid unnecessary fetching of same data multiple times on each plan change, we are checking it against the stored nextReplicateData
   * **/
  const onPlanChanged = React.useCallback(
    (planChangedProps: PlanChangedProps<undefined>) => {
      if (planChangedProps.numberOfPlans === 0) {
        return;
      }
      async function fetchNextReplicateData() {
        const barcodes = planChangedProps.sourceLabware.map((lw) => lw.barcode);
        return await stanCore.GetNextReplicateNumber({ barcodes });
      }
      if (nextReplicateData.length > 0) {
        /**Any update is source labwared scanned**/
        const barcodes = nextReplicateData.flatMap((rd) => rd.barcodes);
        if (
          planChangedProps.sourceLabware.length === barcodes.length &&
          planChangedProps.sourceLabware.every((sourceLw) => barcodes.includes(sourceLw.barcode))
        ) {
          return;
        }
      }
      /**There is update, so fetch next Replicate data for all**/
      fetchNextReplicateData().then((res) => setNextReplicateData(res.nextReplicateNumbers));
    },
    [nextReplicateData]
  );
  /**Save operation performed, so display the success page**/
  if (current.matches('submitted') && submissionResult) {
    return (
      <ProcessingSuccess
        labware={submissionResult.performTissueBlock.labware}
        columns={[
          columns.barcode(),
          columns.labwareType(),
          columns.medium(),
          columns.fixative(),
          columns.donorId(),
          columns.tissueType(),
          columns.spatialLocation(),
          columns.replicate()
        ]}
        successMessage={'Block processing complete'}
      />
    );
  }

  return (
    <>
      <motion.div
        variants={variants.fadeInParent}
        initial={'hidden'}
        animate={'visible'}
        exit={'hidden'}
        className="my-4 mx-auto max-w-screen-xl space-y-16"
      >
        {processingInfo && (
          <Formik<BlockFormData>
            initialValues={{
              workNumber: '',
              plans: []
            }}
            validationSchema={buildValidationSchema()}
            onSubmit={async (values) => {
              send({
                type: 'SUBMIT_FORM',
                values: buildTissueBlockRequest(values)
              });
            }}
          >
            {({ setFieldValue, values }) => (
              <Form>
                <motion.div variants={variants.fadeInWithLift} className="space-y-10">
                  <motion.div variants={variants.fadeInWithLift}>
                    <Heading level={3}>SGP Number</Heading>
                    <p className="mt-2">Please select an SGP number to associate with block processing.</p>
                    <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
                      <WorkNumberSelect
                        onWorkNumberChange={(workNumber) => {
                          setFieldValue('workNumber', workNumber);
                        }}
                      />
                    </motion.div>
                  </motion.div>
                  <Planner<undefined>
                    selectedLabwareType={allowedLabwareTypes.find((lt) => lt.name === selectedLabwareType)}
                    numPlansToCreate={numLabware}
                    onPlanChanged={onPlanChanged}
                    buildPlanLayouts={buildPlanLayouts}
                    columns={[
                      labwareScanTableColumns.barcode(),
                      discardSourceColumn,
                      labwareScanTableColumns.donorId(),
                      labwareScanTableColumns.tissueType(),
                      labwareScanTableColumns.spatialLocation()
                    ]}
                    buildPlanCreationSettings={buildPlanCreationSettings}
                  />
                  {serverError && <Warning message={'Failed to perform Block Processing'} error={serverError} />}
                  {values.plans.length > 0 && (
                    <motion.div variants={variants.fadeInWithLift} className={'sm:flex mt-4 sm:flex-row justify-end'}>
                      <ButtonBar>
                        <BlueButton type={'submit'}>Save</BlueButton>
                      </ButtonBar>
                    </motion.div>
                  )}
                </motion.div>
              </Form>
            )}
          </Formik>
        )}
      </motion.div>
      <Prompt when={shouldConfirm} message={'You have unsaved changes. Are you sure you want to leave?'} />
    </>
  );
}
