import React, { useCallback, useContext, useEffect, useRef } from 'react';

import { CommentFieldsFragment, LabwareFlaggedFieldsFragment, SampleAddressComment } from '../types/sdk';
import AppShell from '../components/AppShell';
import WorkNumberSelect from '../components/WorkNumberSelect';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import Heading from '../components/Heading';
import { StanCoreContext } from '../lib/sdk';
import Panel from '../components/Panel';
import RemoveButton from '../components/buttons/RemoveButton';
import Labware from '../components/labware/Labware';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { selectOptionValues } from '../components/forms';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import { formatDateTimeForCore, getCurrentDateTime } from '../types/stan';
import BlueButton from '../components/buttons/BlueButton';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import Warning from '../components/notifications/Warning';
import { useLoaderData } from 'react-router-dom';
import { ClientError } from 'graphql-request';
import Success from '../components/notifications/Success';
import MutedText from '../components/MutedText';
import { sectionGroupsBySample } from '../lib/helpers/labwareHelper';
import { PlannedSectionDetails } from '../lib/machines/layout/layoutContext';
import { Form, Formik, FormikErrors } from 'formik';
import FormikInput from '../components/forms/Input';
import * as Yup from 'yup';

type HybQCSection = PlannedSectionDetails & { comments: string[] };

type HybQCLabware = {
  labware: LabwareFlaggedFieldsFragment;
  hybSectionGroups: Array<HybQCSection>;
  comments: string[];
  workNumber: string;
  completionTime: string;
};

type ProbeHybridisationQCForm = {
  operationType: string;
  workNumber: string;
  completionTime: string;
  hybQCLabware: Array<HybQCLabware>;
};

export default function ProbeHybridisationQC() {
  const comments = useLoaderData() as CommentFieldsFragment[];
  const stanCore = useContext(StanCoreContext);
  const resultRef = useRef<HTMLDivElement>(null);
  // Scroll the mutation result into view if it appears
  useEffect(() => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  const [submissionError, setSubmissionError] = React.useState<Array<ClientError>>([]);
  const [submissionSuccess, setSubmissionSuccess] = React.useState<Array<String>>([]);

  const resetSubmissionResult = useCallback(() => {
    setSubmissionError([]);
    setSubmissionSuccess([]);
  }, []);

  const convertValuesAndSubmit = (values: ProbeHybridisationQCForm) => {
    resetSubmissionResult();
    values.hybQCLabware.forEach(async (hybQcData) => {
      const comments: Array<SampleAddressComment> = [];
      hybQcData.hybSectionGroups.forEach((section) => {
        section.addresses.forEach((address) => {
          section.comments.forEach((comment) => {
            comments.push({
              address: address,
              commentId: parseInt(comment),
              sampleId: section.source.sampleId
            });
          });
        });
      });
      await stanCore
        .RecordCompletion({
          request: {
            operationType: values.operationType,
            workNumber: hybQcData.workNumber,
            labware: [
              {
                barcode: hybQcData.labware.barcode,
                completion: hybQcData.completionTime ? formatDateTimeForCore(hybQcData.completionTime) : undefined,
                comments
              }
            ]
          }
        })
        .then((response) => {
          setSubmissionSuccess((prev) => {
            return [...prev, hybQcData.labware.barcode];
          });
        })
        .catch((error) => {
          setSubmissionError((prev) => {
            return [...prev, error];
          });
        });
    });
  };

  const fetchProbeHybSlots = async (
    foundLabware: LabwareFlaggedFieldsFragment,
    setValues: (
      values: React.SetStateAction<ProbeHybridisationQCForm>,
      shouldValidate?: boolean
    ) => Promise<void | FormikErrors<ProbeHybridisationQCForm>>
  ): Promise<string[]> => {
    resetSubmissionResult();
    const response = await stanCore.GetProbeHybSlots({ barcode: foundLabware.barcode });
    if (response.probeHybSlots.length === 0) {
      return [`No probe hybridisation operation has been recorded on the following labware: ${foundLabware.barcode}`];
    }
    await setValues((prev) => {
      const hybQCLabware = prev.hybQCLabware;
      const hybSectionGroups = Object.values(sectionGroupsBySample(foundLabware))
        .filter((section) => response.probeHybSlots.some((address) => section.addresses.has(address)))
        .map((section) => ({ ...section, comments: [] }));

      hybQCLabware.push({
        labware: foundLabware,
        workNumber: prev.workNumber,
        completionTime: prev.completionTime,
        comments: [],
        hybSectionGroups
      });
      return { ...prev, hybQCLabware: hybQCLabware };
    });
    return [];
  };

  const initialValues: ProbeHybridisationQCForm = {
    operationType: 'Probe hybridisation QC',
    workNumber: '',
    completionTime: getCurrentDateTime(),
    hybQCLabware: []
  };

  const validationSchema = Yup.object().shape({
    hybQCLabware: Yup.array()
      .of(
        Yup.object().shape({
          workNumber: Yup.string().required('SGP number is required'),
          completionTime: Yup.date()
            .required('Completion time is required')
            .max(new Date(), 'Please select a time on or before current time')
        })
      )
      .min(1, 'At least one slide must be scanned in to proceed')
  });

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Probe Hybridisation QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="space-y-2">
            {submissionError.length > 0 && (
              <div className="mt-4" ref={resultRef}>
                {submissionError.map((error, index) => (
                  <Warning error={error} key={index} />
                ))}
                {submissionSuccess.length > 0 && (
                  <Success
                    message={`Probe Hybridisation QC recorded for the following labware: ${submissionSuccess.join(
                      ', '
                    )}`}
                  />
                )}
              </div>
            )}
          </div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values) => convertValuesAndSubmit(values)}
            validateOnMount={true}
          >
            {({ values, setFieldValue, setValues, isValid }) => (
              <Form>
                <div className="mt-8 space-y-2">
                  <div className="grid grid-cols-2 gap-x-1">
                    <div>
                      <Heading level={4}>SGP Number</Heading>
                      <MutedText>Select an SGP number to apply to all the scanned labware.</MutedText>
                      <div className="mt-4 md:w-1/2">
                        <WorkNumberSelect
                          dataTestId="globalWorkNumber"
                          name="workNumber"
                          onWorkNumberChange={async (workNumber) => {
                            await setValues((prev) => {
                              const hybQCLabware =
                                prev.hybQCLabware.length > 0
                                  ? prev.hybQCLabware.map((labware) => ({
                                      ...labware,
                                      workNumber
                                    }))
                                  : [];
                              return { ...prev, workNumber: workNumber, hybQCLabware };
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Heading level={4}>Completion Time</Heading>
                      <MutedText>Select a completion to apply to all the scanned labware.</MutedText>
                      <FormikInput
                        label=""
                        data-testid={'globalCompletionDateTime'}
                        type="datetime-local"
                        name="completionTime"
                        max={getCurrentDateTime()}
                        onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                          await setValues((prev) => {
                            const hybQCLabware =
                              prev.hybQCLabware.length > 0
                                ? prev.hybQCLabware.map((labware) => ({
                                    ...labware,
                                    completionTime: e.target.value
                                  }))
                                : [];
                            return { ...prev, completionTime: e.target.value, hybQCLabware };
                          });
                        }}
                      />
                    </div>
                  </div>
                  <Heading level={2}>Slides</Heading>
                  <p>Please scan a slide</p>
                  <LabwareScanner
                    checkForCleanedOutAddresses
                    enableFlaggedLabwareCheck
                    labwareCheckFunction={(labwares, foundLabware) => {
                      return fetchProbeHybSlots(foundLabware, setValues);
                    }}
                  >
                    {({ removeLabware, cleanedOutAddresses }) =>
                      values.hybQCLabware.map((currentHybQCLabware, index) => {
                        return (
                          <Panel key={currentHybQCLabware.labware.barcode}>
                            <div className="flex flex-row items-center justify-end">
                              <RemoveButton
                                data-testid={'remove'}
                                onClick={async () => {
                                  resetSubmissionResult();
                                  removeLabware(currentHybQCLabware.labware.barcode);
                                  await setValues((prev) => {
                                    return {
                                      ...prev,
                                      hybQCLabware: prev.hybQCLabware.filter(
                                        (labware) => labware.labware.barcode !== currentHybQCLabware.labware.barcode
                                      )
                                    };
                                  });
                                }}
                              />
                            </div>
                            <div className="flex flex-row">
                              <div className="flex flex-col w-full mr-3" data-testid={'labware'}>
                                <Labware
                                  labware={currentHybQCLabware.labware}
                                  name={currentHybQCLabware.labware.labwareType.name}
                                  cleanedOutAddresses={cleanedOutAddresses?.get(currentHybQCLabware.labware.id)}
                                />
                              </div>
                              <div className="flex flex-col w-full bg-gray-100 ml-3">
                                <div className="grid grid-cols-2 gap-4 m-4">
                                  <div>
                                    <WorkNumberSelect
                                      label="SGP Number"
                                      workNumber={currentHybQCLabware.workNumber}
                                      onWorkNumberChange={async (workNumber) => {
                                        await setFieldValue(`hybQCLabware.${index}.workNumber`, workNumber);
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <FormikInput
                                      label={'Completion Time'}
                                      data-testid={'completionDateTime'}
                                      type="datetime-local"
                                      max={getCurrentDateTime()}
                                      name={`hybQCLabware.${index}.completionTime`}
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-row w-full p-4">
                                  <CustomReactSelect
                                    className="w-3/4"
                                    label={'Comment'}
                                    dataTestId="globalComment"
                                    emptyOption={true}
                                    options={selectOptionValues(comments, 'text', 'id')}
                                    name={`hybQCLabware.${index}.comments`}
                                    isMulti={true}
                                    value={values.hybQCLabware[index].comments}
                                    handleChange={async (val) => {
                                      const selectedComments = (val as OptionType[])
                                        .filter((v) => v.label.length > 0)
                                        .map((v) => v.value);

                                      await setValues((prev) => {
                                        const hybQCLabware = prev.hybQCLabware;
                                        hybQCLabware.map((labware) => {
                                          if (labware.labware.barcode === currentHybQCLabware.labware.barcode) {
                                            labware.comments = selectedComments;
                                            labware.hybSectionGroups.forEach((section) => {
                                              section.comments = selectedComments;
                                            });
                                          }
                                          return labware;
                                        });
                                        return { ...prev, hybQCLabware };
                                      });
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
                                  {currentHybQCLabware.hybSectionGroups.map((section, sectionIndex) => (
                                    <tr key={`${currentHybQCLabware.labware.barcode}-${section.source.sampleId}`}>
                                      <TableCell width={100}>{Array.from(section.addresses).join(', ')}</TableCell>
                                      <TableCell width={120}>{section.source.newSection}</TableCell>
                                      <TableCell width={200}>{section.source.tissue?.donor.donorName}</TableCell>
                                      <TableCell width={200}>
                                        {section.source.tissue?.spatialLocation.tissueType.name}
                                      </TableCell>
                                      <TableCell width={100}>{section.source.tissue?.spatialLocation.code}</TableCell>
                                      <TableCell>{section.source.tissue?.replicate!}</TableCell>
                                      <TableCell className="w-full">
                                        <CustomReactSelect
                                          isMulti={true}
                                          options={selectOptionValues(comments, 'text', 'id')}
                                          name={`hybQCLabware.${index}.hybSectionGroups.${sectionIndex}.comments`}
                                          value={currentHybQCLabware.hybSectionGroups[sectionIndex].comments}
                                        />
                                      </TableCell>
                                    </tr>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </Panel>
                        );
                      })
                    }
                  </LabwareScanner>
                  <div className={'sm:flex mt-4 sm:flex-row justify-end'} key="submit">
                    <BlueButton type="submit" disabled={!isValid}>
                      Save
                    </BlueButton>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <OperationCompleteModal
          show={submissionSuccess.length > 0 && submissionError.length === 0}
          message="Probe Hybridisation QC recorded for all labware(s)"
        >
          <p>
            If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the Home
            screen.
          </p>
        </OperationCompleteModal>
      </AppShell.Main>
    </AppShell>
  );
}
