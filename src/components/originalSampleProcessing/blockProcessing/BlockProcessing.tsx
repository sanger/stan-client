import {
  GetBlockProcessingInfoQuery,
  InputMaybe,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  PerformTissueBlockMutation,
  Scalars,
  TissueBlockContent,
  TissueBlockRequest
} from '../../../types/sdk';
import { useMachine } from '@xstate/react';
import ButtonBar from '../../ButtonBar';
import BlueButton from '../../buttons/BlueButton';
import React from 'react';
import { LabwareTypeName, NewFlaggedLabwareLayout } from '../../../types/stan';
import columns from '../../dataTableColumns/labwareColumns';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import BlockProcessingLabwarePlan from './BlockProcessingLabwarePlan';
import { Dictionary, groupBy } from 'lodash';
import Heading from '../../Heading';
import Planner from '../../planning/Planner';
import createFormMachine from '../../../lib/machines/form/formMachine';
import { stanCore } from '../../../lib/sdk';
import WorkNumberSelect from '../../WorkNumberSelect';
import Warning from '../../notifications/Warning';
import variants from '../../../lib/motionVariants';
import { motion } from '../../../dependencies/motion';
import { selectOptionValues } from '../../forms';
import ProcessingSuccess from '../ProcessingSuccess';
import { useConfirmLeave } from '../../../lib/hooks';
import { Row } from 'react-table';
import FormikInput from '../../forms/Input';
import CustomReactSelect, { OptionType } from '../../forms/CustomReactSelect';
import PromptOnLeave from '../../notifications/PromptOnLeave';
import { useLoaderData } from 'react-router-dom';
import { fromPromise } from 'xstate';

/**
 * Used as Formik's values
 */

type TissueBlockContentForm = TissueBlockContent & {
  isEditReplicateDisabled?: boolean;
};

type TissueBlockLabwareForm = {
  contents: Array<TissueBlockContentForm>;
  labwareType: Scalars['String']['input'];
  preBarcode?: InputMaybe<Scalars['String']['input']>;
};

export type BlockFormData = {
  workNumber: string;
  //Plan cid for key
  plans: Map<string, TissueBlockLabwareForm>;
  discardSources?: { sourceBarcode: string; discard: boolean }[];
};

const allowedLabwareTypeNames: Array<LabwareTypeName> = [
  LabwareTypeName.TUBE,
  LabwareTypeName.PRE_BARCODED_TUBE,
  LabwareTypeName.PROVIASETTE,
  LabwareTypeName.CASSETTE
];

type BlockProcessingParams = {
  readonly processingInfo?: GetBlockProcessingInfoQuery;
};

export default function BlockProcessing({ processingInfo }: BlockProcessingParams) {
  const processingInfoLoaderData = useLoaderData() as GetBlockProcessingInfoQuery;

  const formMachine = React.useMemo(() => {
    return createFormMachine<TissueBlockRequest, PerformTissueBlockMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.PerformTissueBlock({
            request: input.event.values
          });
        })
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

  /**
   * Limit the labware types the user can Section on to.
   */
  const allowedLabwareTypes = React.useMemo(() => {
    const blockProcessingInfo = processingInfo || processingInfoLoaderData;
    return blockProcessingInfo
      ? blockProcessingInfo.labwareTypes.filter((lw) => allowedLabwareTypeNames.includes(lw.name as LabwareTypeName))
      : [];
  }, [processingInfo, processingInfoLoaderData]);

  /** Display created Labware plans**/
  const buildPlanLayouts = React.useCallback(
    (
      plans: Map<string, { labware: NewFlaggedLabwareLayout; sectionThickness?: number }>,
      sourceLabware: LabwareFlaggedFieldsFragment[],
      sampleColors: Map<number, string>,
      deleteAction: (cid: string) => void,
      confirmAction?: (cid: string, plan: undefined) => void,
      scrollRef?: React.MutableRefObject<HTMLDivElement | null>
    ) => {
      type PlanWithId = {
        cid: string;
        plan: NewFlaggedLabwareLayout | undefined;
      };
      //Group plans labware type
      const planWithKeys: PlanWithId[] = Array.from(plans.keys()).map((k) => {
        return {
          cid: k,
          plan: plans.get(k)?.labware
        };
      });
      const layoutPlanGroupedByType: Dictionary<PlanWithId[]> = groupBy(
        planWithKeys,
        (planWithKey) => planWithKey.plan!.labwareType.name
      );
      return Object.keys(layoutPlanGroupedByType).length > 0 ? (
        <div className={'flex flex-col py-10 gap-y-20'}>
          {allowedLabwareTypeNames.map((labwareType) => {
            const labwarePlans = layoutPlanGroupedByType[labwareType];
            return (
              labwarePlans && (
                <div className={'flex flex-col'} data-testid={`divSection-${labwareType}`} key={labwareType}>
                  <Heading className={'mb-8'} level={2}>{`${labwareType.toString()}s`}</Heading>
                  {labwarePlans.map((lwPlan, indx) => {
                    return (
                      <BlockProcessingLabwarePlan
                        key={lwPlan.cid}
                        cid={lwPlan.cid}
                        blockProcessInfo={processingInfo!}
                        outputLabware={lwPlan.plan!}
                        sourceLabware={sourceLabware}
                        sampleColors={sampleColors}
                        onDelete={deleteAction}
                        ref={
                          labwareType === selectedLabwareType && indx === labwarePlans.length - numLabware
                            ? scrollRef
                            : undefined
                        }
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
    [processingInfo, selectedLabwareType, numLabware]
  );

  /**
   * Display settings panel to add labware
   */
  const buildPlanCreationSettings = React.useCallback(() => {
    return (
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-center text-sm">
        <div className="text-gray-500">Labware type</div>
        <div className="text-gray-500">Number of labware</div>
        <CustomReactSelect
          className="block text-left"
          handleChange={(val) => setSelectedLabwareType((val as OptionType).value)}
          dataTestId={'labwareType'}
          value={selectedLabwareType}
          options={selectOptionValues(allowedLabwareTypes, 'name', 'name')}
        />
        <input
          type="number"
          className="block h-10 border border-gray-300 bg-white rounded-md shadow-xs focus:outline-hidden focus:ring-sdb-100 focus:border-sdb-100"
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
      plans: Yup.mixed<Map<string, TissueBlockLabwareForm>>().required(),
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
      labware: [
        ...formData.plans.values().map((labware) => ({
          ...labware,
          contents: labware.contents.map(({ isEditReplicateDisabled, ...tissueBlockLabwareProps }) => ({
            ...tissueBlockLabwareProps
          }))
        }))
      ],
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

  /**Save operation performed, so display the success page**/
  if (current.matches('submitted') && submissionResult) {
    return (
      <ProcessingSuccess
        labware={submissionResult.performTissueBlock.labware}
        columns={[
          columns.barcode(),
          columns.labwareType(),
          columns.fixative(),
          columns.donorId(),
          columns.tissueType(),
          columns.spatialLocation(),
          columns.replicate()
        ]}
        successMessage={'Block labware generation complete'}
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
              plans: new Map()
            }}
            validationSchema={buildValidationSchema}
            onSubmit={async (values) => {
              send({
                type: 'SUBMIT_FORM',
                values: buildTissueBlockRequest(values)
              });
            }}
          >
            {({ setFieldValue, values, isValid }) => (
              <Form>
                <motion.div variants={variants.fadeInWithLift} className="space-y-10">
                  <motion.div variants={variants.fadeInWithLift}>
                    <Heading level={3}>SGP Number</Heading>
                    <p className="mt-2">Please select an SGP number to associate with the block.</p>
                    <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
                      <WorkNumberSelect onWorkNumberChange={(workNumber) => setFieldValue('workNumber', workNumber)} />
                    </motion.div>
                  </motion.div>
                  <Planner<undefined>
                    selectedLabwareType={allowedLabwareTypes.find((lt) => lt.name === selectedLabwareType)}
                    numPlansToCreate={numLabware}
                    buildPlanLayouts={buildPlanLayouts}
                    columns={[
                      columns.barcode(),
                      discardSourceColumn,
                      columns.donorId(),
                      columns.tissueType(),
                      columns.spatialLocation(),
                      columns.replicate()
                    ]}
                    buildPlanCreationSettings={buildPlanCreationSettings}
                  />
                  {serverError && (
                    <Warning message={'Failed to perform block labware generation'} error={serverError} />
                  )}

                  <motion.div variants={variants.fadeInWithLift} className={'sm:flex mt-4 sm:flex-row justify-end'}>
                    <ButtonBar>
                      <BlueButton type={'submit'} disabled={!isValid}>
                        Save
                      </BlueButton>
                    </ButtonBar>
                  </motion.div>
                </motion.div>
              </Form>
            )}
          </Formik>
        )}
      </motion.div>
      <PromptOnLeave when={shouldConfirm} message={'You have unsaved changes. Are you sure you want to leave?'} />
    </>
  );
}
