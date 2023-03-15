import React, { useContext, useEffect, useMemo } from 'react';
import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import {
  GetReleaseInfoQuery,
  LabwareFieldsFragment,
  ReleaseLabware,
  ReleaseLabwareMutation,
  ReleaseRequest
} from '../types/sdk';
import * as Yup from 'yup';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import { motion } from 'framer-motion';
import variants from '../lib/motionVariants';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import MutedText from '../components/MutedText';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import LabwareScanPanel from '../components/labwareScanPanel/LabwareScanPanel';
import columns from '../components/dataTableColumns/labwareColumns';
import { FormikErrorMessage, selectOptionValues } from '../components/forms';
import PinkButton from '../components/buttons/PinkButton';
import WhiteButton from '../components/buttons/WhiteButton';
import DownloadIcon from '../components/icons/DownloadIcon';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import Success from '../components/notifications/Success';
import { toast } from 'react-toastify';
import { reload, StanCoreContext } from '../lib/sdk';
import { Row } from 'react-table';
import WorkNumberSelect from '../components/WorkNumberSelect';
import CustomReactSelect from '../components/forms/CustomReactSelect';
import Label from '../components/forms/Label';
import RadioGroup, { RadioButtonInput } from '../components/forms/RadioGroup';
import DataTable from '../components/DataTable';

const validationSchema = Yup.object().shape({
  releaseLabware: Yup.array()
    .min(1, 'Please scan in at least 1 labware')
    .of(
      Yup.object().shape({
        barcode: Yup.string().required(),
        workNumber: Yup.string().optional()
      })
    )
    .required(),
  destination: Yup.string().required().label('Group/Team'),
  recipient: Yup.string().required().label('Contact')
});

const labwareBsContent = (labware: LabwareFieldsFragment) => {
  const bss = new Set(labware.slots.flatMap((slot) => slot.samples).map((sam) => sam.bioState.name.toLowerCase()));
  if (bss.has('cdna')) {
    return { cdna: true, other: bss.size > 1 };
  }
  return { cdna: false, other: bss.size > 0 };
};

const labwareBioStateCheck = (labwares: LabwareFieldsFragment[], foundLabware: LabwareFieldsFragment) => {
  if (foundLabware.released) {
    return ['Labware ' + foundLabware.barcode + ' has already been released.'];
  }
  if (foundLabware.destroyed) {
    return ['Labware ' + foundLabware.barcode + ' has been destroyed.'];
  }
  if (foundLabware.discarded) {
    return ['Labware ' + foundLabware.barcode + ' has been discarded.'];
  }
  const newBsContent = labwareBsContent(foundLabware);
  if (!newBsContent.cdna && !newBsContent.other) {
    return ['Labware ' + foundLabware.barcode + ' is empty.'];
  }
  if (newBsContent.cdna && newBsContent.other) {
    return ['Labware ' + foundLabware.barcode + ' contains a mix of bio states that cannot be released together.'];
  }
  if (labwares.length > 0) {
    const lwBsContent = labwareBsContent(labwares[0]);
    if (newBsContent.cdna && lwBsContent.other) {
      return [
        'Labware ' +
          foundLabware.barcode +
          ' cannot be released with the labware already scanned, because it contains cDNA.'
      ];
    }
    if (newBsContent.other && lwBsContent.cdna) {
      return [
        'Labware ' +
          foundLabware.barcode +
          ' cannot be released with the labware already scanned, because it does not contain cDNA.'
      ];
    }
  }
  return [];
};

interface PageParams {
  releaseInfo: GetReleaseInfoQuery;
}

enum ReleaseType {
  WORK_NUMBER = 'SGP Number',
  LABWARE_LOCATION = 'Labware/Location'
}

function Release({ releaseInfo }: PageParams) {
  const stanCore = useContext(StanCoreContext);
  const [releaseLabware, setReleaseLabware] = React.useState<ReleaseLabware[]>([]);
  const [labwareFromSGP, setLabwareFromSGP] = React.useState<LabwareFieldsFragment[]>([]);
  const [releaseType, setReleaseType] = React.useState<ReleaseType>(ReleaseType.LABWARE_LOCATION);

  const initialValues: ReleaseRequest = {
    releaseLabware: releaseLabware,
    destination: '',
    recipient: ''
  };
  const formMachine = React.useMemo(() => {
    return createFormMachine<ReleaseRequest, ReleaseLabwareMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          const newValues: ReleaseRequest = {
            ...e.values,
            releaseLabware: e.values.releaseLabware.map((suggestedWork) => {
              if (suggestedWork.workNumber) {
                return {
                  barcode: suggestedWork.barcode,
                  workNumber: suggestedWork.workNumber
                };
              } else return { barcode: suggestedWork.barcode };
            })
          };
          return stanCore.ReleaseLabware({ releaseRequest: newValues });
        }
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(() => formMachine);

  const { serverError, submissionResult } = current.context;
  const formLocked = !current.matches('fillingOutForm');
  const submitForm = async (values: ReleaseRequest) => send({ type: 'SUBMIT_FORM', values });
  const releaseFilePath = useMemo(() => {
    if (submissionResult) {
      const releaseIds = submissionResult.release.releases.map((r) => r.id);
      return `/release?id=${releaseIds.join(',')}`;
    }
  }, [submissionResult]);

  useEffect(() => {
    if (current.matches('submitted')) {
      const ToastSuccess = () => <Success message={'Labware(s) Released'} />;
      toast(ToastSuccess, {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: true,
        autoClose: 4000
      });
    }
  }, [current]);

  const updateFieldValues = React.useCallback(
    (
      releaseLabware: ReleaseLabware[],
      setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
    ) => {
      releaseLabware.forEach((releaseLw, index) => {
        setFieldValue(`releaseLabware.${index}`, releaseLw);
      });
    },
    []
  );

  const onAddLabware = React.useCallback(
    async (
      labware: LabwareFieldsFragment[],
      setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
    ) => {
      if (labware.length <= releaseLabware.length) return;
      const addLabware = labware.filter((lw) => !releaseLabware.some((rlw) => rlw.barcode === lw.barcode));
      if (addLabware.length > 0) {
        const res = await stanCore.GetSuggestedWorkForLabware({ barcodes: addLabware.map((lw) => lw.barcode) });
        const suggestedLabware: ReleaseLabware[] = res.suggestedWorkForLabware.suggestedWorks.map((suggestedWork) => ({
          barcode: suggestedWork.barcode,
          workNumber: suggestedWork.workNumber ?? ''
        }));
        const newLabware = [...releaseLabware, ...suggestedLabware];
        setReleaseLabware(newLabware);
        updateFieldValues(newLabware, setFieldValue);
      }
    },
    [releaseLabware, setReleaseLabware, stanCore, updateFieldValues]
  );
  const handleSelectWorkNumberForRelease = React.useCallback(
    (workNumber: string, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
      async function updateLabwareFromSGP(workNumber: string) {
        const res = await stanCore.GetSuggestedLabwareForWork({ workNumber });
        const suggestedLabware = res.suggestedLabwareForWork.map((labware) => ({
          barcode: labware.barcode,
          workNumber
        }));
        const newLabware = [...releaseLabware, ...suggestedLabware];
        setReleaseLabware(newLabware);
        setLabwareFromSGP((prev) => {
          return [...prev, ...res.suggestedLabwareForWork];
        });
        updateFieldValues(newLabware, setFieldValue);
      }
      updateLabwareFromSGP(workNumber);
    },
    [stanCore, setReleaseLabware, setLabwareFromSGP, releaseLabware, updateFieldValues]
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Release</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={submitForm}>
            {({ values, setFieldValue }) => (
              <Form>
                <GrayBox>
                  <motion.div
                    variants={variants.fadeInParent}
                    initial={'hidden'}
                    animate={'visible'}
                    exit={'hidden'}
                    className="md:w-3/4 space-x-4 space-y-10"
                  >
                    {serverError && <Warning error={serverError} />}
                    <motion.div variants={variants.fadeInWithLift} className="space-y-4 ">
                      <Heading level={3}>Release Type</Heading>
                      <div className={'flex flex-row'}>
                        <RadioGroup label="Release by" name={'release_type'}>
                          {[ReleaseType.LABWARE_LOCATION, ReleaseType.WORK_NUMBER].map((key) => {
                            return (
                              <RadioButtonInput
                                key={key}
                                name={'releaseType'}
                                value={key}
                                checked={releaseType === key}
                                onChange={(e) => {
                                  setReleaseType(e.currentTarget.value as ReleaseType);
                                  setReleaseLabware([]);
                                  setLabwareFromSGP([]);
                                }}
                                label={key}
                              />
                            );
                          })}
                        </RadioGroup>
                      </div>
                      {releaseType === ReleaseType.WORK_NUMBER ? (
                        <div className={'flex flex-col w-full'}>
                          <MutedText>Please choose the SGP number to release all associated labware.</MutedText>
                          <Label
                            name={'SGP Number:'}
                            className={'w-full ml-2 mt-2 font-sans font-medium text-gray-700'}
                          >
                            <WorkNumberSelect
                              onWorkNumberChange={(workNumber) =>
                                handleSelectWorkNumberForRelease(workNumber, setFieldValue)
                              }
                              dataTestId={'worknumber_release'}
                            />
                          </Label>
                          {releaseLabware.length > 0 && (
                            <div className={'flex flex-col w-full'}>
                              <Heading className={'mt-4'} level={4}>
                                Labware to release
                              </Heading>
                              <DataTable
                                data={labwareFromSGP}
                                columns={[
                                  columns.barcode(),
                                  columns.donorId(),
                                  columns.labwareType(),
                                  columns.externalName(),
                                  columns.bioState()
                                ]}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <MutedText>
                            Please scan either the location or a piece of labware you wish to release.
                          </MutedText>
                          <LabwareScanner
                            onChange={(labware) => {
                              onAddLabware(labware, setFieldValue);
                            }}
                            onRemove={(labware) => {
                              const updatedReleasedLabware = releaseLabware.filter(
                                (rlw) => rlw.barcode !== labware.barcode
                              );
                              setReleaseLabware(updatedReleasedLabware);
                              updateFieldValues(updatedReleasedLabware, setFieldValue);
                            }}
                            locked={formLocked}
                            labwareCheckFunction={labwareBioStateCheck}
                            enableLocationScanner={true}
                          >
                            {releaseLabware.length > 0 && (
                              <div className={'flex flex-col'}>
                                <Heading className={'mt-4'} level={4}>
                                  Labware to release
                                </Heading>
                                <div className={'flex flex-col mt-4 w-1/2'}>
                                  <WorkNumberSelect
                                    label={'Select SGP for all'}
                                    requiredField={false}
                                    dataTestId={'select-all'}
                                    onWorkNumberChange={(workNumber) => {
                                      const updatedReleasedLabware = releaseLabware.map((rl) => ({
                                        ...rl,
                                        workNumber: workNumber
                                      }));
                                      setReleaseLabware(updatedReleasedLabware);
                                      updateFieldValues(updatedReleasedLabware, setFieldValue);
                                    }}
                                  />
                                </div>
                                <LabwareScanPanel
                                  columns={[
                                    columns.barcode(),
                                    {
                                      Header: 'SGP Number',
                                      id: 'workNumber',
                                      Cell: ({ row }: { row: Row<LabwareFieldsFragment> }) => {
                                        return (
                                          <WorkNumberSelect
                                            name={`releaseLabware.${row.index}.workNumber`}
                                            onWorkNumberChange={(workNumber) => {
                                              const updatedReleaseLabware = [...releaseLabware];
                                              updatedReleaseLabware[row.index].workNumber = workNumber;
                                              setReleaseLabware(updatedReleaseLabware);
                                            }}
                                            workNumber={releaseLabware[row.index]?.workNumber ?? undefined}
                                          />
                                        );
                                      }
                                    },
                                    columns.donorId(),
                                    columns.labwareType(),
                                    columns.externalName(),
                                    columns.bioState()
                                  ]}
                                />
                              </div>
                            )}
                          </LabwareScanner>
                        </>
                      )}

                      <FormikErrorMessage name={'releaseLabware'} />
                    </motion.div>

                    <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                      <Heading level={3}>Destination</Heading>

                      <CustomReactSelect
                        isDisabled={formLocked}
                        label={'Group/Team'}
                        dataTestId="group"
                        name={'destination'}
                        emptyOption
                        options={selectOptionValues(releaseInfo.releaseDestinations, 'name', 'name')}
                      />

                      <CustomReactSelect
                        isDisabled={formLocked}
                        label={'Contact'}
                        dataTestId="contact"
                        name={'recipient'}
                        emptyOption
                        options={selectOptionValues(releaseInfo.releaseRecipients, 'username', 'username')}
                      />
                    </motion.div>
                  </motion.div>

                  <Sidebar data-testid={'summary'}>
                    <Heading level={3} showBorder={false}>
                      Summary
                    </Heading>

                    {releaseLabware.length > 0 ? (
                      <p>
                        <span className="font-semibold">{releaseLabware.length}</span> piece(s) of labware will be
                        released
                        {values.destination && <span className="font-semibold"> to {values.destination}</span>}.
                      </p>
                    ) : (
                      <p className="italic text-sm">Please scan labwares.</p>
                    )}
                    {!values.destination && <p className="italic text-sm">Please select a group/team.</p>}

                    {values.recipient ? (
                      <p>
                        The primary contact is <span className="font-semibold">{values.recipient}</span>.
                      </p>
                    ) : (
                      <p className="italic text-sm">Please select a contact.</p>
                    )}

                    <PinkButton
                      disabled={formLocked}
                      loading={current.matches('submitting')}
                      type="submit"
                      className="sm:w-full"
                    >
                      Release Labware
                    </PinkButton>

                    {current.matches('submitted') && releaseFilePath && (
                      <WhiteButton className="sm:w-full">
                        <a
                          className="w-full text-gray-800 focus:outline-none"
                          download={'release.tsv'}
                          href={releaseFilePath}
                        >
                          <DownloadIcon className={'inline-block h-5 w-5 -mt-1 -ml-1 mr-2'} />
                          Download Release File
                        </a>
                      </WhiteButton>
                    )}

                    {current.matches('submitted') && (
                      <PinkButton action="tertiary" onClick={reload} className="sm:w-full" type="button">
                        Reset Form
                      </PinkButton>
                    )}
                  </Sidebar>
                </GrayBox>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Release;
