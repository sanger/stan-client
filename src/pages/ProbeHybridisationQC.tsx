import React, { useCallback, useContext } from 'react';

import {
  CommentFieldsFragment,
  CompletionRequest,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  LabwareSampleComments,
  RecordCompletionMutation,
  SampleAddressComment
} from '../types/sdk';
import AppShell from '../components/AppShell';
import WorkNumberSelect from '../components/WorkNumberSelect';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import Heading from '../components/Heading';
import { useCollection } from '../lib/hooks/useCollection';
import { Form, Formik } from 'formik';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import { StanCoreContext } from '../lib/sdk';

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
import * as Yup from 'yup';
import { extractLabwareFromFlagged } from '../lib/helpers/labwareHelper';

import { useLoaderData } from 'react-router-dom';
import { fromPromise } from 'xstate';

type SampleAddressFormRow = {
  [key: string]: string[]; //key: address-sampleId, values: the selected comments
};

type LabwareCompletionDateForm = {
  globalComments: string[];
  completionDateTime: string;
  sampleAddressComments: SampleAddressFormRow;
};
type ProbeHybridisationQCFormValues = {
  workNumber: string;
  labwares: { [key: string]: LabwareCompletionDateForm }; //key: barcode
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

const mapSampleAddressCommentIds = (
  address: string,
  sampleId: number,
  commentIds: string[]
): SampleAddressComment[] => {
  return commentIds.map((commentId) => ({
    address: address,
    sampleId: Number(sampleId),
    commentId: Number(commentId)
  }));
};

const convertProbeHybridisationQCFormValuesToCompletionRequest = (
  probeHybridisationQCFormValues: ProbeHybridisationQCFormValues,
  allScannedLabware: LabwareFieldsFragment[]
) => {
  const completionRequest: CompletionRequest = {
    operationType: 'Probe hybridisation QC',
    workNumber: probeHybridisationQCFormValues.workNumber,
    labware: []
  };

  allScannedLabware.forEach((labware) => {
    const labwareSampleComments: LabwareSampleComments = {
      barcode: labware.barcode,
      comments: []
    };
    const labwareForm = probeHybridisationQCFormValues.labwares[labware.barcode];
    if (labwareForm !== undefined) {
      if (labwareForm.completionDateTime) {
        labwareSampleComments.completion = formatDateTimeForCore(labwareForm.completionDateTime);
      }
      if (labwareForm.sampleAddressComments) {
        for (const addressSampleId in labwareForm.sampleAddressComments) {
          const [address, sampleId] = addressSampleId.split('-');
          labwareSampleComments.comments.push(
            ...mapSampleAddressCommentIds(address, Number(sampleId), labwareForm.sampleAddressComments[addressSampleId])
          );
        }
      }
    }
    completionRequest.labware.push(labwareSampleComments);
  });
  return completionRequest;
};

const formInitialValues: ProbeHybridisationQCFormValues = {
  workNumber: '',
  labwares: {
    '': {
      globalComments: [],
      completionDateTime: getCurrentDateTime(),
      sampleAddressComments: { '': [] }
    }
  }
};

export default function ProbeHybridisationQC() {
  const comments = useLoaderData() as CommentFieldsFragment[];
  const stanCore = useContext(StanCoreContext);

  const labwares = useCollection<LabwareFieldsFragment>({
    getKey: (item) => item.barcode
  });

  const onAddLabware = useCallback(
    (labware: LabwareFlaggedFieldsFragment) => {
      labwares.append(extractLabwareFromFlagged([labware])[0]);
    },
    [labwares]
  );

  const validateProbeHybridisationQcLabware = useCallback(
    async (labwares: LabwareFlaggedFieldsFragment[], foundLabware: LabwareFlaggedFieldsFragment): Promise<string[]> => {
      return stanCore
        .FindLatestOperation({
          barcode: foundLabware.barcode,
          operationType: 'Probe hybridisation Xenium'
        })
        .then((response) => {
          return response.findLatestOp !== null
            ? []
            : [
                `No Probe Hybridisation Xenium operation has been recorded on the following labware: ${foundLabware.barcode}`
              ];
        });
    },
    [stanCore]
  );

  const onRemoveLabware = useCallback(
    (labware: LabwareFlaggedFieldsFragment) => {
      labwares.remove(labware.barcode);
    },
    [labwares]
  );

  const removeLabwareFromForm = useCallback(
    (removeLabware: (barcode: string) => void, barcode: string, values: ProbeHybridisationQCFormValues) => {
      removeLabware(barcode);
      delete values.labwares[barcode];
    },
    []
  );

  const formSubmitMachine = React.useMemo(() => {
    return createFormMachine<CompletionRequest, RecordCompletionMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordCompletion({
            request: input.event.values
          });
        })
      }
    });
  }, [stanCore]);
  const [currentForm, sendForm] = useMachine(formSubmitMachine);

  const { serverError, submissionResult } = currentForm.context;

  const validationWorkNumber = Yup.object().shape({
    workNumber: Yup.string().required('SGP Number is required')
  });

  const submitForm = async (values: CompletionRequest) => sendForm({ type: 'SUBMIT_FORM', values });
  const convertValuesAndSubmit = async (formValues: ProbeHybridisationQCFormValues) => {
    const values: CompletionRequest = convertProbeHybridisationQCFormValuesToCompletionRequest(
      formValues,
      labwares.items
    );
    await submitForm(values);
  };

  const mapCommentOptionsToValues = useCallback((options: OptionType[]) => {
    return options.map((v) => v.value);
  }, []);

  const updateSectionCommentsFromGlobal = useCallback(
    (
      options: OptionType[],
      labware: LabwareFlaggedFieldsFragment,
      setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
    ) => {
      labware.slots.forEach((slot) => {
        slot.samples.forEach((sample) => {
          const sampleAddressId = `${slot.address}-${sample.id}`;
          setFieldValue(
            `labwares[${labware.barcode}].sampleAddressComments[${sampleAddressId}]`,
            mapCommentOptionsToValues(options)
          );
        });
      });
    },
    [mapCommentOptionsToValues]
  );

  const validateCompletionDateTime = (selectedTime: string) => {
    return new Date(selectedTime) > new Date() ? 'Please select a time on or before current time' : undefined;
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
                  <LabwareScanner
                    onAdd={onAddLabware}
                    onRemove={onRemoveLabware}
                    labwareCheckFunction={validateProbeHybridisationQcLabware}
                  >
                    {({ labwares, removeLabware }) =>
                      labwares.map((labware) => (
                        <Panel key={labware.barcode}>
                          <div className="flex flex-row items-center justify-end">
                            {
                              <RemoveButton
                                data-testid={'remove'}
                                onClick={() => {
                                  removeLabwareFromForm(removeLabware, labware.barcode, values);
                                }}
                              />
                            }
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
                                  max={getCurrentDateTime()}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setFieldValue(`labwares.${labware.barcode}.completionDateTime`, e.target.value);
                                  }}
                                  value={values.labwares[labware.barcode]?.completionDateTime || getCurrentDateTime()}
                                  className="w-1/2"
                                  validate={validateCompletionDateTime}
                                />
                              </div>
                              <div className="flex flex-row w-full p-4">
                                <CustomReactSelect
                                  label={'Comment'}
                                  name={`labwares[${labware.barcode}].globalComments`}
                                  dataTestId="globalComment"
                                  emptyOption={true}
                                  options={selectOptionValues(comments, 'text', 'id')}
                                  isMulti={true}
                                  handleChange={(options) => {
                                    updateSectionCommentsFromGlobal(options as OptionType[], labware, setFieldValue);
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
                                                mapCommentOptionsToValues(values as OptionType[])
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
                message="Probe Hybridisation QC recorded for all labware(s)"
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
