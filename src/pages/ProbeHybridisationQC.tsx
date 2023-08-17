import React, { useCallback, useContext } from 'react';

import {
  CommentFieldsFragment,
  CompletionRequest,
  LabwareFieldsFragment,
  LabwareSampleComments,
  RecordCompletionMutation
} from '../types/sdk';
import AppShell from '../components/AppShell';
import WorkNumberSelect from '../components/WorkNumberSelect';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import Heading from '../components/Heading';
import { useCollection } from '../lib/hooks/useCollection';
import { Form, Formik } from 'formik';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import { reload, StanCoreContext } from '../lib/sdk';

import { motion } from 'framer-motion';
import Panel from '../components/Panel';
import RemoveButton from '../components/buttons/RemoveButton';
import Labware from '../components/labware/Labware';
import FormikInput from '../components/forms/Input';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { selectOptionValues } from '../components/forms';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import { mapify } from '../lib/helpers';
import { formatDateTimeForCore, getCurrentDateTime } from '../types/stan';
import BlueButton from '../components/buttons/BlueButton';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import Warning from '../components/notifications/Warning';
import MutedText from '../components/MutedText';
import * as Yup from 'yup';

type SectionComments = {
  comments: CommentFieldsFragment[];
};

type SampleAddressFormRow = {
  [key: string]: string[]; //key = barcode-address-sampleId, values = string[]
};

type LabwareCompletionDateForm = {
  globalComments: string[];
  completionDateTime: string;
  sampleAddressComments: SampleAddressFormRow;
};
type ProbeHybridisationQCFormValues = {
  workNumber: string;
  labwares: { [key: string]: LabwareCompletionDateForm };
};

const getCommentTextFromField = (
  availableComments: CommentFieldsFragment[],
  values: ProbeHybridisationQCFormValues,
  barcode: string,
  address: string,
  sampleId: number
): string[] => {
  const commentsMap = mapify(availableComments, 'id');
  const labwareComments = values.labwares[barcode];
  if (labwareComments && labwareComments.sampleAddressComments) {
    const comments = labwareComments.sampleAddressComments[`${address}-${sampleId}`];
    if (comments) {
      return comments
        .map((commentId) => commentsMap.get(Number(commentId)))
        .filter((comment) => comment !== undefined)
        .map((comment) => comment!.text);
    }
  }
  return [];
};

const currentDateTime = getCurrentDateTime();
const currentDate = () => {
  return currentDateTime.split('T')[0];
};

const convertProbeHybridisationQCFormValuesToCompletionRequest = (
  probeHybridisationQCFormValues: ProbeHybridisationQCFormValues
) => {
  const completionRequest: CompletionRequest = {
    operationType: 'Probe hybridisation QC',
    workNumber: probeHybridisationQCFormValues.workNumber,
    labware: []
  };

  for (const barcode in probeHybridisationQCFormValues.labwares) {
    const labwareInfo = probeHybridisationQCFormValues.labwares[barcode];

    if (barcode && labwareInfo.sampleAddressComments) {
      const labware: LabwareSampleComments = {
        barcode: barcode,
        comments: []
      };

      if (labwareInfo.completionDateTime) {
        labware.completion = formatDateTimeForCore(labwareInfo.completionDateTime);
      }

      for (const addressSampleId in labwareInfo.sampleAddressComments) {
        const [address, sampleId] = addressSampleId.split('-');
        const commentIds = labwareInfo.sampleAddressComments[addressSampleId];

        const comments = commentIds.map((commentId) => ({
          address: address,
          sampleId: Number(sampleId),
          commentId: Number(commentId)
        }));

        labware.comments.push(...comments);
      }

      completionRequest.labware.push(labware);
    }
  }

  return completionRequest;
};

const formInitialValues: ProbeHybridisationQCFormValues = {
  workNumber: '',
  labwares: {
    '': {
      globalComments: [],
      completionDateTime: '',
      sampleAddressComments: { '': [] }
    }
  }
};

export default function ProbeHybridisationQC({ comments }: SectionComments) {
  const stanCore = useContext(StanCoreContext);

  const labwares = useCollection<LabwareFieldsFragment>({
    getKey: (item) => item.barcode
  });

  const onAddLabware = useCallback(
    (labware: LabwareFieldsFragment) => {
      labwares.append(labware);
    },
    [labwares]
  );

  const onRemoveLabware = useCallback(
    (labware: LabwareFieldsFragment) => {
      labwares.remove(labware.barcode);
    },
    [labwares]
  );

  const formSubmitMachine = React.useMemo(() => {
    return createFormMachine<CompletionRequest, RecordCompletionMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordCompletion({
            request: e.values
          });
        }
      }
    });
  }, [stanCore]);
  const [currentForm, sendForm] = useMachine(() => formSubmitMachine);

  const { serverError, submissionResult } = currentForm.context;

  const validationWorkNumber = Yup.object().shape({
    workNumber: Yup.string().required('SGP Number is required'),
    labwares: Yup.object().shape({}).required('At least one labware is required')
  });

  const submitForm = async (values: CompletionRequest) => sendForm({ type: 'SUBMIT_FORM', values });
  const convertValuesAndSubmit = async (formValues: ProbeHybridisationQCFormValues) => {
    const values: CompletionRequest = convertProbeHybridisationQCFormValuesToCompletionRequest(formValues);
    await submitForm(values);
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Probe Hybridisation QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <Formik<ProbeHybridisationQCFormValues>
          initialValues={formInitialValues}
          validationSchema={validationWorkNumber}
          onSubmit={convertValuesAndSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="max-w-screen-xl mx-auto">
                <div className="space-y-2">
                  {serverError && <Warning error={serverError} />}
                  <Heading level={2}>SGP Number</Heading>
                  <p>Select an SGP number to associate with this operation.</p>
                  <div className="mt-4 md:w-1/2">
                    <WorkNumberSelect
                      name="workNumber"
                      onWorkNumberChange={(workNumber) => {
                        setFieldValue('workNumber', workNumber);
                      }}
                    />
                  </div>
                </div>
                <div className="mt-8 space-y-2">
                  <Heading level={2}>Slides</Heading>
                  <p>Please scan a slide</p>
                  <LabwareScanner onAdd={onAddLabware} onRemove={onRemoveLabware}>
                    {({ labwares, removeLabware }) =>
                      labwares.map((labware) => (
                        <motion.div
                          key={labware.barcode}
                          initial={{ opacity: 0, y: -50 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3"
                        >
                          <Panel>
                            <div className="flex flex-row items-center justify-end">
                              {<RemoveButton data-testid={'remove'} onClick={() => removeLabware(labware.barcode)} />}
                            </div>
                            <div className="flex flex-row">
                              <div className="flex flex-col w-full" data-testid={'labware'}>
                                <Labware labware={labware} name={labware.labwareType.name} />
                              </div>
                              <div className="flex flex-col w-full bg-gray-100">
                                <div className="p-4">
                                  <FormikInput
                                    label={'Completion Time'}
                                    data-testid={'completionDateTime'}
                                    type="datetime-local"
                                    name={`labwares[${labware.barcode}].completionDateTime`}
                                    max={currentDateTime}
                                    min={currentDate() + 'T00:00'}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      setFieldValue(`labwares.${labware.barcode}.completionDateTime`, e.target.value);
                                    }}
                                    value={values.labwares[labware.barcode]?.completionDateTime || ''}
                                    className="w-1/2"
                                  />
                                  <MutedText className="pl-2">
                                    If not manually selected, the current timestamp will be applied automatically
                                  </MutedText>
                                </div>
                                <div className="flex flex-row w-full p-4">
                                  <CustomReactSelect
                                    label={'Comment'}
                                    name={`labwares[${labware.barcode}].globalComments`}
                                    dataTestId="globalComment"
                                    emptyOption={true}
                                    options={selectOptionValues(comments, 'text', 'id')}
                                    isMulti={true}
                                    // handleChange={(options) => {
                                    //   const selectedOptions = (options as OptionType[]).map((v) => v.value);
                                    //   labware.slots.forEach((slot) => {
                                    //     slot.samples.forEach((sample) => {
                                    //       const oldSelected =
                                    //         values.labwares[labware.barcode] &&
                                    //         values.labwares[labware.barcode].sampleAddressComments
                                    //           ? values.labwares[labware.barcode].sampleAddressComments[
                                    //               `${slot.address}-${sample.id}`
                                    //             ]
                                    //           : [];
                                    //       const updatedSelected = oldSelected
                                    //         ? oldSelected.concat(selectedOptions)
                                    //         : selectedOptions;
                                    //       setFieldValue(
                                    //         `labwares[${labware.barcode}].sampleAddressComments[${slot.address}-${sample.id}]`,
                                    //         updatedSelected
                                    //       );
                                    //     });
                                    //   });
                                    // }}

                                    handleChange={(options) => {
                                      const selectedOptions = (options as OptionType[]).map((v) => v.value);

                                      labware.slots.forEach((slot) => {
                                        slot.samples.forEach((sample) => {
                                          const sampleAddressId = `${slot.address}-${sample.id}`;
                                          const oldSelected =
                                            values.labwares[labware.barcode]?.sampleAddressComments?.[
                                              sampleAddressId
                                            ] || [];
                                          const updatedSelected = [...oldSelected, ...selectedOptions];

                                          setFieldValue(
                                            `labwares[${labware.barcode}].sampleAddressComments[${sampleAddressId}]`,
                                            updatedSelected
                                          );
                                        });
                                      });
                                    }}
                                    value={() => {
                                      const labwareData = values.labwares[labware.barcode];
                                      return labwareData ? labwareData.globalComments : [];
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="pt-4">
                              <Table>
                                <TableHead>
                                  <tr>
                                    <TableHeader>Address</TableHeader>
                                    <TableHeader>Section Number</TableHeader>
                                    <TableHeader>Donor Id </TableHeader>
                                    <TableHeader>Tissue type</TableHeader>
                                    <TableHeader>Spatial Location</TableHeader>
                                    <TableHeader>Replicate</TableHeader>
                                    <TableHeader>Comment</TableHeader>
                                  </tr>
                                </TableHead>
                                <TableBody>
                                  {labware.slots.flatMap((slot) => {
                                    if (slot.samples.length <= 0) return <></>;
                                    return slot.samples.flatMap((sample) => {
                                      return (
                                        <tr key={`${labware.barcode}-${slot.address}-${sample.id}`}>
                                          <TableCell width={100}>{slot.address}</TableCell>
                                          <TableCell width={120}>{sample.section}</TableCell>
                                          <TableCell width={200}>{sample.tissue.donor.donorName}</TableCell>
                                          <TableCell width={200}>
                                            {sample.tissue.spatialLocation.tissueType.name}
                                          </TableCell>
                                          <TableCell width={100}>{sample.tissue.spatialLocation.code}</TableCell>
                                          <TableCell>{sample.tissue.replicate!}</TableCell>
                                          <TableCell className="w-full">
                                            <CustomReactSelect
                                              isMulti={true}
                                              options={selectOptionValues(comments, 'text', 'id')}
                                              name={`labwares[${labware.barcode}].sampleAddressComments[${slot.address}-${sample.id}]`}
                                              value={getCommentTextFromField(
                                                comments,
                                                values,
                                                labware.barcode,
                                                slot.address,
                                                sample.id
                                              )}
                                              handleChange={(values) => {
                                                setFieldValue(
                                                  `labwares.${labware.barcode}.sampleAddressComments.${slot.address}-${sample.id}`,
                                                  (values as OptionType[]).map((v) => v.value)
                                                );
                                              }}
                                            />
                                          </TableCell>
                                        </tr>
                                      );
                                    });
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </Panel>
                        </motion.div>
                      ))
                    }
                  </LabwareScanner>
                  {labwares.items.length > 0 && (
                    <div className={'sm:flex mt-4 sm:flex-row justify-end'} key="submit">
                      <BlueButton type="submit">Save</BlueButton>
                    </div>
                  )}
                </div>
              </div>
              <OperationCompleteModal
                show={submissionResult !== undefined}
                message={'Probe Hybridisation QC recorded for all labware(s)'}
                onReset={reload}
              >
                <p>
                  If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the
                  Home screen.
                </p>
              </OperationCompleteModal>
            </Form>
          )}
        </Formik>
      </AppShell.Main>
    </AppShell>
  );
}
