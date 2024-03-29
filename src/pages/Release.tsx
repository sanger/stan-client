import React, { useContext, useEffect, useMemo } from 'react';
import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import {
  GetReleaseInfoQuery,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  ReleaseFileOptionFieldsFragment,
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
import { extendedSelectOptionValues, FormikErrorMessage, selectOptionValues } from '../components/forms';
import PinkButton from '../components/buttons/PinkButton';
import WhiteButton from '../components/buttons/WhiteButton';
import { useMachine } from '@xstate/react';
import createFormMachine from '../lib/machines/form/formMachine';
import Success from '../components/notifications/Success';
import { toast } from 'react-toastify';
import { reload, StanCoreContext } from '../lib/sdk';
import { Row } from 'react-table';
import WorkNumberSelect from '../components/WorkNumberSelect';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import Label from '../components/forms/Label';
import RadioGroup, { RadioButtonInput } from '../components/forms/RadioGroup';
import DataTable from '../components/DataTable';
import RemoveButton from '../components/buttons/RemoveButton';
import EditIcon from '../components/icons/EditIcon';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Input } from '../components/forms/Input';
import DownloadIcon from '../components/icons/DownloadIcon';
import { fromPromise } from 'xstate';

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
  recipient: Yup.string().required().label('Primary Contact'),
  otherRecipients: Yup.array().optional().label('CC contacts')
});

const labwareBsContent = (labware: LabwareFlaggedFieldsFragment) => {
  const bss = new Set(labware.slots.flatMap((slot) => slot.samples).map((sam) => sam.bioState.name.toLowerCase()));
  if (bss.has('cdna')) {
    return { cdna: true, other: bss.size > 1 };
  }
  return { cdna: false, other: bss.size > 0 };
};

const labwareBioStateCheck = (labwares: LabwareFlaggedFieldsFragment[], foundLabware: LabwareFlaggedFieldsFragment) => {
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

enum ReleaseType {
  WORK_NUMBER = 'SGP Number',
  LABWARE_LOCATION = 'Labware/Location'
}

function Release() {
  const releaseInfo = useLoaderData() as GetReleaseInfoQuery;
  const stanCore = useContext(StanCoreContext);
  const [releaseLabware, setReleaseLabware] = React.useState<ReleaseLabware[]>([]);
  const [labwareFromSGP, setLabwareFromSGP] = React.useState<LabwareFieldsFragment[]>([]);
  const [releaseType, setReleaseType] = React.useState<ReleaseType>(ReleaseType.LABWARE_LOCATION);
  const [selectedReleaseColumns, setSelectedReleaseColumns] = React.useState<ReleaseFileOptionFieldsFragment[]>(
    releaseInfo.releaseColumnOptions ?? []
  );
  const navigate = useNavigate();
  const initialValues: ReleaseRequest = {
    releaseLabware: releaseLabware,
    destination: '',
    recipient: ''
  };
  const formMachine = React.useMemo(() => {
    return createFormMachine<ReleaseRequest, ReleaseLabwareMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          const newValues: ReleaseRequest = {
            ...input.event.values,
            releaseLabware: input.event.values.releaseLabware.map((suggestedWork: ReleaseLabware) => {
              if (suggestedWork.workNumber) {
                return {
                  barcode: suggestedWork.barcode,
                  workNumber: suggestedWork.workNumber
                };
              } else return { barcode: suggestedWork.barcode };
            })
          };
          return stanCore.ReleaseLabware({ releaseRequest: newValues });
        })
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);

  const { serverError, submissionResult } = current.context;
  const formLocked = !current.matches('fillingOutForm');
  const submitForm = async (values: ReleaseRequest) => send({ type: 'SUBMIT_FORM', values });
  const releaseOptionsFilePath = useMemo(() => {
    if (submissionResult) {
      const releaseIds = submissionResult.release.releases.map((r) => r.id);
      return `/releaseOptions?id=${releaseIds.join(',')}&groups=${selectedReleaseColumns
        .map((releaseOption) => releaseOption.queryParamName)
        .join(',')}`;
    }
  }, [submissionResult, selectedReleaseColumns]);

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
      labware: LabwareFlaggedFieldsFragment[],
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
        const res = await stanCore.GetSuggestedLabwareForWork({ workNumber: workNumber, forRelease: true });
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

  const onRemoveLabware = React.useCallback(
    (
      barcode: string,
      values: ReleaseRequest,
      setValues: (values: React.SetStateAction<ReleaseRequest>, shouldValidate?: boolean | undefined) => void
    ) => {
      const updatedReleaseLw = values.releaseLabware.filter((lw) => lw.barcode !== barcode);
      setReleaseLabware(updatedReleaseLw);
      setValues({ ...values, releaseLabware: updatedReleaseLw });
    },
    [setReleaseLabware]
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Release</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={submitForm}>
            {({ values, setFieldValue, setValues }) => (
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
                                  columns.bioState(),
                                  {
                                    Header: '',
                                    id: 'actions',
                                    Cell: ({ row }: { row: Row<LabwareFieldsFragment> }) => {
                                      return (
                                        <RemoveButton
                                          type={'button'}
                                          onClick={() => {
                                            if (row.original.barcode) {
                                              setLabwareFromSGP((prev) =>
                                                prev.filter((lw) => lw.barcode !== row.original.barcode)
                                              );
                                              onRemoveLabware(row.original.barcode, values, setValues);
                                            }
                                          }}
                                        />
                                      );
                                    }
                                  }
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
                              onRemoveLabware(labware.barcode, values, setValues);
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
                        options={selectOptionValues(releaseInfo.releaseDestinations, 'name', 'name', true, {
                          sort: true,
                          alphaFirst: true
                        })}
                      />
                      <CustomReactSelect
                        isDisabled={formLocked}
                        label={'Primary Contact'}
                        dataTestId="contact"
                        name={'recipient'}
                        emptyOption
                        options={extendedSelectOptionValues(
                          releaseInfo.releaseRecipients,
                          'username',
                          'username',
                          true,
                          {
                            sort: true,
                            alphaFirst: true
                          },
                          'fullName'
                        )}
                      />
                      <CustomReactSelect
                        isDisabled={formLocked}
                        label={'Other contacts'}
                        dataTestId="cc"
                        name={'otherRecipients'}
                        emptyOption
                        isMulti
                        options={extendedSelectOptionValues(
                          releaseInfo.releaseRecipients,
                          'username',
                          'username',
                          true,
                          {
                            sort: true,
                            alphaFirst: true
                          },
                          'fullName'
                        )}
                        value={values.otherRecipients}
                        handleChange={(values) => {
                          setFieldValue(
                            'otherRecipients',
                            (values as OptionType[]).map((option) => option.value)
                          );
                        }}
                      />
                    </motion.div>
                    {releaseInfo.releaseColumnOptions && releaseInfo.releaseColumnOptions.length > 0 && (
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 ">
                        <Heading level={3}>Release Columns</Heading>
                        {releaseInfo.releaseColumnOptions.map((releaseOption) => (
                          <div className="flex flex-row items-center gap-x-2" key={releaseOption.displayName}>
                            <Input
                              type="checkbox"
                              data-testid={`${releaseOption.displayName}-checkbox`}
                              className={'w-5 rounded'}
                              checked={selectedReleaseColumns.some(
                                (column) =>
                                  column.displayName === releaseOption.displayName &&
                                  column.queryParamName === releaseOption.queryParamName
                              )}
                              onChange={() => {
                                setSelectedReleaseColumns((prevSelected) => {
                                  const findIndex = prevSelected.findIndex(
                                    (option) =>
                                      option.displayName === releaseOption.displayName &&
                                      option.queryParamName === releaseOption.queryParamName
                                  );
                                  if (findIndex < 0) {
                                    return [...prevSelected, releaseOption];
                                  } else {
                                    const newSelected = [...prevSelected];
                                    newSelected.splice(findIndex, 1);
                                    return newSelected;
                                  }
                                });
                              }}
                            />
                            <label className={'whitespace-nowrap'}>{releaseOption.displayName}</label>
                          </div>
                        ))}
                      </motion.div>
                    )}
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
                    {values.otherRecipients && values.otherRecipients.length > 0 && (
                      <p>
                        The cc contact(s) are <span className="font-semibold">{values.otherRecipients.join(',')}</span>.
                      </p>
                    )}
                    {values.otherRecipients && values.otherRecipients.length > 0 && (
                      <p>
                        The cc contact(s) are <span className="font-semibold">{values.otherRecipients.join(',')}</span>.
                      </p>
                    )}
                    {selectedReleaseColumns.length > 0 && (
                      <p>
                        The selected release columns are{' '}
                        <span className="font-semibold">
                          {selectedReleaseColumns.map((col) => col.displayName).join(',')}
                        </span>
                        .
                      </p>
                    )}
                    <PinkButton
                      disabled={formLocked}
                      loading={current.matches('submitting')}
                      type="submit"
                      className="sm:w-full"
                    >
                      Release Labware
                    </PinkButton>
                    {submissionResult && (
                      <PinkButton className="sm:w-full">
                        <a
                          className="w-full text-gray-800 focus:outline-none"
                          download={'release.tsv'}
                          href={`/release?id=${submissionResult.release.releases.map(
                            (r) => r.id
                          )}&groups=${selectedReleaseColumns.map((col) => col.queryParamName).join(',')}`}
                        >
                          <DownloadIcon className={'inline-block h-5 w-5 -mt-1 -ml-1 mr-2'} />
                          Download Release File
                        </a>
                      </PinkButton>
                    )}
                    {current.matches('submitted') && releaseOptionsFilePath && (
                      <WhiteButton
                        className="sm:w-full whitespace-nowrap"
                        onClick={() => navigate(releaseOptionsFilePath)}
                      >
                        <EditIcon className={'inline-block h-5 w-5 -ml-1 mr-2'} />
                        Change Release File Options
                      </WhiteButton>
                    )}

                    {current.matches('submitted') && (
                      <PinkButton
                        action={'tertiary'}
                        onClick={() => reload(navigate)}
                        className="sm:w-full"
                        type="button"
                      >
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
