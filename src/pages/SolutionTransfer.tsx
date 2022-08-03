import React, { ChangeEvent } from 'react';

import AppShell from '../components/AppShell';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import { reload, stanCore } from '../lib/sdk';
import variants from '../lib/motionVariants';
import { motion } from 'framer-motion';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import FormikSelect from '../components/forms/Select';
import LabwareScanTable from '../components/labwareScanPanel/LabwareScanPanel';
import labwareScanTableColumns from '../components/dataTable/labwareColumns';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import WorkNumberSelect from '../components/WorkNumberSelect';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import PinkButton from '../components/buttons/PinkButton';
import { Row } from 'react-table';
import MutedText from '../components/MutedText';
import {
  GetSolutionTransferInfoQuery,
  LabwareFieldsFragment,
  PerformSolutionTransferMutation,
  SolutionTransferRequest
} from '../types/sdk';
import { FormikErrorMessage } from '../components/forms';

interface SolutionTransferParams {
  solutionTransferInfo: GetSolutionTransferInfoQuery;
}

type SolutionTransferFormData = Required<SolutionTransferRequest> & {
  /**Solution to apply to all labware**/
  applyAllSolution: string;
};
const SolutionTransfer: React.FC<SolutionTransferParams> = ({ solutionTransferInfo }: SolutionTransferParams) => {
  const [current, send] = useMachine(
    createFormMachine<SolutionTransferRequest, PerformSolutionTransferMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.PerformSolutionTransfer({
            request: {
              labware: e.values.labware,
              workNumber: e.values.workNumber
            }
          });
        }
      }
    })
  );

  const { serverError, submissionResult } = current.context;

  function buildValidationSchema(): Yup.ObjectSchema {
    return Yup.object().shape({
      workNumber: Yup.string().required('SGP Number is a required field'),
      labware: Yup.array()
        .of(
          Yup.object().shape({
            barcode: Yup.string().required('Barcode is a required field'),
            solution: Yup.string().required('Solution is a required field')
          })
        )
        .required('At least one labware must be scanned')
        .min(1, 'At least one labware must be scanned'),
      applyAllSolution: Yup.string().optional()
    });
  }

  // Column with actions (such as delete) to add to the end of the labwareScanTableColumns passed in
  const solutionsColumn = React.useMemo(() => {
    return {
      Header: 'Solution',
      id: 'solutions',
      Cell: ({ row }: { row: Row<LabwareFieldsFragment> }) => {
        return (
          <FormikSelect name={`labware.${row.index}.solution`} label={''} emptyOption>
            {solutionTransferInfo.solutions.map((solution) => (
              <option value={solution.name} key={`${row.values.barcode}-${solution.name}`}>
                {solution.name}
              </option>
            ))}
          </FormikSelect>
        );
      }
    };
  }, [solutionTransferInfo]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Solution Transfer</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className={'max-w-screen-xl mx-auto'}>
          {solutionTransferInfo && (
            <Formik<SolutionTransferFormData>
              initialValues={{
                workNumber: '',
                labware: [],
                applyAllSolution: ''
              }}
              onSubmit={async (values) => {
                send({
                  type: 'SUBMIT_FORM',
                  values
                });
              }}
              validationSchema={buildValidationSchema()}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <GrayBox>
                    <motion.div
                      variants={variants.fadeInParent}
                      initial={'hidden'}
                      animate={'visible'}
                      exit={'hidden'}
                      className="md:w-2/3 space-y-10"
                    >
                      {serverError && <Warning error={serverError} />}
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                        <Heading level={3}>SGP Number</Heading>
                        <p className="mt-2">Please select an SGP number to associate with solution transfer.</p>
                        <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
                          <WorkNumberSelect
                            onWorkNumberChange={(workNumber) => {
                              setFieldValue('workNumber', workNumber);
                            }}
                            name={'workNumber'}
                          />
                        </motion.div>
                      </motion.div>

                      <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                        <Heading level={3}>Labware</Heading>
                        <LabwareScanner
                          /***
                         Handlers to update the form data whenever labware list changes
                        ***/
                          onChange={(labware) => {
                            labware.forEach((lw, indx) => setFieldValue(`labware.${indx}.barcode`, lw.barcode));
                          }}
                          onAdd={() => {
                            setFieldValue(`labware.${values.labware.length}.solution`, values.applyAllSolution ?? '');
                          }}
                          onRemove={(labware) => {
                            const updatedLabware = values.labware.filter((lw) => lw.barcode !== labware.barcode);
                            setFieldValue('labware', updatedLabware);
                          }}
                        >
                          {values.labware.length === 0 && <FormikErrorMessage name={'labware'} />}
                          <motion.div variants={variants.fadeInWithLift}>
                            {values.labware.length > 0 && (
                              <motion.div variants={variants.fadeInWithLift} className={'pt-10 pb-5'}>
                                <FormikSelect
                                  name={'applyAllSolution'}
                                  label={'Solution'}
                                  emptyOption
                                  className={'w-1/2'}
                                  onChange={(evt: ChangeEvent<HTMLSelectElement>) => {
                                    setFieldValue('applyAllSolution', evt.currentTarget.value);
                                    values.labware.forEach((lw, indx) =>
                                      setFieldValue(`labware.${indx}.solution`, evt.currentTarget.value)
                                    );
                                  }}
                                >
                                  {solutionTransferInfo.solutions.map((solution) => (
                                    <option value={solution.name} key={solution.name}>
                                      {solution.name}
                                    </option>
                                  ))}
                                </FormikSelect>
                                <MutedText>Solution selected will be applied to all labware</MutedText>{' '}
                              </motion.div>
                            )}
                            <LabwareScanTable
                              columns={[
                                labwareScanTableColumns.barcode(),
                                solutionsColumn,
                                labwareScanTableColumns.donorId(),
                                labwareScanTableColumns.tissueType(),
                                labwareScanTableColumns.labwareType(),
                                labwareScanTableColumns.fixative()
                              ]}
                            />
                          </motion.div>
                        </LabwareScanner>
                      </motion.div>
                    </motion.div>
                    <Sidebar>
                      <Heading level={3} showBorder={false}>
                        Summary
                      </Heading>
                      {values.workNumber ? (
                        <p>
                          The selected SGP number is <span className="font-semibold">{values.workNumber}</span>.
                        </p>
                      ) : (
                        <p className="text-sm italic">No SGP number selected.</p>
                      )}

                      <div className="my-4 mx-4 sm:mx-auto p-1 rounded-md bg-sdb-400 italic">
                        <p className="my-3 text-white-800 text-xs leading-normal">
                          Once <span className="font-bold text-white-800">all labware</span> have been scanned and{' '}
                          <span className="font-bold text-white-800">solutions</span> selected for all, click
                          <span className="font-bold text-white-800"> Submit</span> to record solution transfer of
                          samples.
                        </p>
                      </div>
                      <PinkButton type="submit" className="sm:w-full">
                        Submit
                      </PinkButton>
                    </Sidebar>

                    <OperationCompleteModal
                      show={submissionResult !== undefined}
                      message={'Solution transfer recorded on all labware'}
                      onReset={reload}
                    >
                      <p>
                        If you wish to start the process again, click the "Reset Form" button. Otherwise you can return
                        to the Home screen.
                      </p>
                    </OperationCompleteModal>
                  </GrayBox>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default SolutionTransfer;
