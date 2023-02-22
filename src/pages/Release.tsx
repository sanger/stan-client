import React, { useContext, useEffect, useMemo } from 'react';
import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import { GetReleaseInfoQuery, LabwareFieldsFragment, ReleaseLabwareMutation, ReleaseRequest } from '../types/sdk';
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

function Release({ releaseInfo }: PageParams) {
  const stanCore = useContext(StanCoreContext);
  const [releaseLabware, setReleaseLabware] = React.useState<LabwareFieldsFragment[]>([]);

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
          return stanCore.ReleaseLabware({ releaseRequest: e.values });
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
                      <Heading level={3}>Labware</Heading>
                      <MutedText>Please scan either the location or a piece of labware you wish to release.</MutedText>

                      <LabwareScanner
                        onChange={(labware) => {
                          labware.map((lw, indx) => setFieldValue(`releaseLabware.${indx}.barcode`, lw.barcode));
                          setReleaseLabware(labware);
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
                                onWorkNumberChange={(workNumber) => {
                                  values.releaseLabware.forEach((_, index) =>
                                    setFieldValue(`releaseLabware.${index}.workNumber`, workNumber)
                                  );
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
                                          setFieldValue(`releaseLabware.${row.index}.workNumber`, workNumber);
                                        }}
                                        workNumber={values.releaseLabware[row.index]?.workNumber ?? undefined}
                                      />
                                    );
                                  }
                                },
                                columns.donorId(),
                                columns.labwareType(),
                                columns.externalName(),
                                columns.bioState()
                              ]}
                              onRemove={(lw) => {
                                values.releaseLabware.filter((releaseLw) => releaseLw.barcode === lw.barcode);
                                setReleaseLabware((prev) => {
                                  return prev.filter((releaseLw) => releaseLw.barcode === lw.barcode);
                                });
                              }}
                            />
                          </div>
                        )}
                      </LabwareScanner>

                      <FormikErrorMessage name={'barcodes'} />
                    </motion.div>

                    <motion.div variants={variants.fadeInWithLift} className="space-y-4">
                      <Heading level={3}>Destination</Heading>

                      <CustomReactSelect
                        isDisabled={formLocked}
                        label={'Group/Team'}
                        dataTestId="Group/Team"
                        name={'destination'}
                        emptyOption
                        options={selectOptionValues(releaseInfo.releaseDestinations, 'name', 'name')}
                      />

                      <CustomReactSelect
                        isDisabled={formLocked}
                        label={'Contact'}
                        dataTestId="Contact"
                        name={'recipient'}
                        emptyOption
                        options={selectOptionValues(releaseInfo.releaseRecipients, 'username', 'username')}
                      />
                    </motion.div>
                  </motion.div>

                  <Sidebar>
                    <Heading level={3} showBorder={false}>
                      Summary
                    </Heading>

                    {releaseLabware.length > 0 ? (
                      <p>
                        <span className="font-semibold">{values.releaseLabware.length}</span> piece(s) of labware will
                        be released
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
