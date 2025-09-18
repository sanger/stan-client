import React, { SetStateAction, useContext } from 'react';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import {
  AnalyserLabware,
  AnalyserRequest,
  AnalyserScanDataFieldsFragment,
  CassettePosition,
  EquipmentFieldsFragment,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  RecordAnalyserMutation,
  SamplePositionFieldsFragment
} from '../types/sdk';
import { useMachine } from '@xstate/react';
import * as Yup from 'yup';
import AppShell from '../components/AppShell';
import Warning from '../components/notifications/Warning';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import { Form, Formik } from 'formik';
import FormikInput, { FormikCheckbox } from '../components/forms/Input';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Table, { TabelSubHeader, TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import CustomReactSelect from '../components/forms/CustomReactSelect';
import { GridDirection, objectKeys } from '../lib/helpers';
import BlueButton from '../components/buttons/BlueButton';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { FormikErrorMessage, selectOptionValues } from '../components/forms';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { fromPromise } from 'xstate';
import { lotRegx } from './ProbeHybridisationXenium';
import { joinUnique, samplesFromLabwareOrSLot } from '../components/dataTableColumns';
import RemoveButton from '../components/buttons/RemoveButton';
import PassIcon from '../components/icons/PassIcon';
import Labware from '../components/labware/Labware';
import Panel from '../components/Panel';
import WhiteButton from '../components/buttons/WhiteButton';
import { createSessionStorageForLabwareAwaiting } from '../types/stan';
import { BarcodeDisplayer } from '../components/modal/BarcodeDisplayer';
import { findUploadedFiles } from '../lib/services/fileService';

/**Sample data type to represent a sample row which includes all fields to be saved and displayed. */
type SampleWithRegion = {
  address: string;
  sampleId: number;
  region: string;
  sectionNumber?: string;
  externalName?: string;
  roi: string;
};

type AnalyserLabwareForm = {
  labware: LabwareFlaggedFieldsFragment;
  hybridisation: boolean;
  workNumber: string;
  hasSgpNumberLink?: boolean;
  position?: CassettePosition;
  samples: Array<SampleWithRegion>;
  analyserScanData?: AnalyserScanDataFieldsFragment;
};

type XeniumAnalyserFormValues = {
  lotNumberA: string;
  lotNumberB: string;
  cellSegmentationLot: string;
  decodingConsumablesLot?: string;
  equipmentId: number | undefined;
  runName: string;
  repeat: boolean;
  performed: string;
  labware: Array<AnalyserLabwareForm>;
  workNumberAll: string;
  barcodeDisplayerProps?: BarcodeDisplayerProps;
};
const formInitialValues: XeniumAnalyserFormValues = {
  runName: '',
  repeat: false,
  lotNumberB: '',
  lotNumberA: '',
  cellSegmentationLot: '',
  equipmentId: undefined,
  labware: [],
  performed: '',
  workNumberAll: ''
};

type BarcodeDisplayerProps = {
  barcode: string;
  warningMessage?: string;
};

const LabwareAnalyserTable = (labwareForm: AnalyserLabwareForm) => {
  const samples = samplesFromLabwareOrSLot(labwareForm.labware);
  return (
    <Table className="text-sm">
      <TableHead>
        <tr>
          <TableHeader>Barcode</TableHeader>
          <TableHeader>Donor ID</TableHeader>
          <TableHeader>Labware Type</TableHeader>
          <TableHeader>External Name</TableHeader>
          <TableHeader>Bio State</TableHeader>
          <TableHeader>Work Numbers</TableHeader>
          <TableHeader>Probes</TableHeader>
          <TableHeader>Cell Segmentation Recorded</TableHeader>
        </tr>
      </TableHead>
      <TableBody>
        <tr>
          <TableCell className="break-words align-top">{labwareForm.labware.barcode}</TableCell>
          <TableCell className="break-words align-top">
            {joinUnique(samples.map((sample) => sample.tissue.donor.donorName))}
          </TableCell>
          <TableCell className="break-words align-top">{labwareForm.labware.labwareType.name}</TableCell>
          <TableCell className="break-words align-top">
            {joinUnique(samples.map((sample) => sample.tissue.externalName ?? ''))}
          </TableCell>
          <TableCell className="break-words align-top">
            {joinUnique(samples.map((sample) => sample.bioState.name))}
          </TableCell>
          <TableCell className="break-words align-top">
            {labwareForm.analyserScanData?.workNumbers.join(', ')}
          </TableCell>
          <TableCell className="break-words align-top">{labwareForm.analyserScanData?.probes.join(', ')}</TableCell>
          <TableCell className="break-words align-top">
            {labwareForm.analyserScanData?.cellSegmentationRecorded ? (
              <PassIcon className={`inline-block h-8 w-8 text-green-500`} />
            ) : (
              ' - '
            )}
          </TableCell>
        </tr>
      </TableBody>
    </Table>
  );
};

const XeniumAnalyser = () => {
  const equipments = useLoaderData() as EquipmentFieldsFragment[];
  const navigate = useNavigate();
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<AnalyserRequest, RecordAnalyserMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.RecordAnalyser({
            request: { ...input.event.values }
          });
        })
      }
    });
  }, [stanCore]);
  const [current, send] = useMachine(formMachine);
  const { serverError, submissionResult } = current.context;
  const validationSchema = Yup.object().shape({
    lotNumberA: Yup.string()
      .required('Decoding reagent A lot number is a required field')
      .label('A Lot Number')
      .max(32, 'Decoding reagent lot number should be a string of up to 32 letters and numbers.')
      .matches(/^[A-Za-z0-9]+$/, 'Decoding reagent lot number should be a string of letters and numbers.'),
    lotNumberB: Yup.string()
      .required('Decoding reagent B lot number is a required field')
      .label('B Lot Number')
      .max(32, 'Decoding reagent lot number should be a string of up to 32 letters and numbers.')
      .matches(/^[A-Za-z0-9]+$/, 'Decoding reagent lot number should be a string of letters and numbers.'),
    cellSegmentationLot: Yup.string()
      .optional()
      .label('Cell segmentation lot number')
      .max(25)
      .matches(
        lotRegx,
        'LOT number should be a string of maximum length 25 of capital letters, numbers and underscores.'
      ),
    runName: Yup.string().required().label('Run Name').max(255, 'Run name should be a string of maximum length 255'),
    performed: Yup.date().required('Time is a required field').label('Time'),
    equipmentId: Yup.number().required().label('Equipment').required('Equipment is a required field'),
    decodingConsumablesLot: Yup.string()
      .optional()
      .matches(/^\d{6}$/, 'Consumables lot number should be a 6-digit number'),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          hybridisation: Yup.boolean(),
          workNumber: Yup.string().required().label('SGP Number'),
          position: Yup.string().required(),
          samples: Yup.array()
            .of(
              Yup.object().shape({
                roi: Yup.string()
                  .required('Region of interest is a required field')
                  .label('ROI')
                  .max(64, 'Region of interest field should be string of maximum length 64')
              })
            )
            .required()
            .min(1)
        })
      )
      .required()
      .min(1)
  });

  /**Create samples with region information */
  const labwareSamplesWithRegions = React.useCallback(
    (lw: LabwareFlaggedFieldsFragment, samplePositions: SamplePositionFieldsFragment[]) => {
      const samples: SampleWithRegion[] = [];
      lw.slots.forEach((slot) => {
        slot.samples.forEach((sample) => {
          const samplePosition = samplePositions.find((sp) => sp.address === slot.address && sp.sampleId === sample.id);
          samples.push({
            address: slot.address,
            sampleId: sample.id,
            region: samplePosition?.region ?? '',
            externalName: sample.tissue.externalName ?? '',
            sectionNumber: String(sample.section) ?? '',
            roi: sample.tissue.externalName ?? ''
          });
        });
      });
      return samples;
    },
    []
  );

  /**This creates the slot related information for the labware */
  const createTableDataForSlots = React.useCallback(
    (
      labware: LabwareFlaggedFieldsFragment,
      setValues: (values: SetStateAction<XeniumAnalyserFormValues>, shouldValidate?: boolean) => {},
      values: XeniumAnalyserFormValues
    ) => {
      const setLabwareSampleData = async (lw: LabwareFlaggedFieldsFragment) => {
        let samplePositions: SamplePositionFieldsFragment[] = [];
        try {
          /**Check if the images were been uploaded to the sgp folder**/
          const hasSgpNumberLink =
            values.workNumberAll.length > 0 ? await hasUploadedFilesInSgpFolder(values.workNumberAll) : false;
          /**Validate whether probe hybridisation has been recorded on this labware**/
          const latestOp = await stanCore
            .FindLatestOperation({ barcode: lw.barcode, operationType: 'Probe hybridisation Xenium' })
            .then((res) => res.findLatestOp);
          /**If probe hybridisation has been recorded, get the sample positions,otherwise return**/
          if (latestOp) {
            /**
             * FindSamplePositions - if no samples in the labware have a region, the array would be empty.
             * Fetch sample positions first and then add the region to the sample information got from the labware
             * to create samples
             */
            samplePositions = await stanCore
              .FindSamplePositions({ labwareBarcode: lw.barcode })
              .then((res) => res.samplePositions);
            stanCore.GetAnalyserScanData({ barcode: labware.barcode }).then((res) => {
              setValues((prev) => {
                const analyserLabware: AnalyserLabwareForm | undefined = prev.labware.find(
                  (lw) => lw.labware.barcode === labware.barcode
                );
                if (analyserLabware) {
                  analyserLabware.analyserScanData = res.analyserScanData;
                } else {
                  prev.labware.push({
                    labware,
                    hybridisation: true,
                    workNumber: values.workNumberAll,
                    hasSgpNumberLink,
                    position: undefined,
                    samples: labwareSamplesWithRegions(labware, samplePositions),
                    analyserScanData: res.analyserScanData
                  });
                }
                return { ...prev };
              });
            });
          } else {
            setValues((prev) => {
              prev.labware.push({
                labware,
                hybridisation: false,
                workNumber: values.workNumberAll,
                hasSgpNumberLink,
                position: undefined,
                samples: labwareSamplesWithRegions(labware, samplePositions)
              });
              return { ...prev };
            });
            return;
          }
        } catch (e) {
          return;
        }
      };
      setLabwareSampleData(labware);
    },
    [labwareSamplesWithRegions, stanCore]
  );

  const hasUploadedFilesInSgpFolder = async (workNumber: string): Promise<boolean> => {
    const files = await findUploadedFiles([workNumber]);
    return files.length > 0;
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Xenium Analyser</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className={'flex flex-col space-y-6'}>
            {serverError && <Warning error={serverError} />}
            <Formik<XeniumAnalyserFormValues>
              initialValues={formInitialValues}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                const labwareROIData: AnalyserLabware[] = values.labware.map((lw) => {
                  const labwareSample = values.labware.find((ls) => ls.labware.barcode === lw.labware.barcode);
                  return {
                    barcode: lw.labware.barcode,
                    workNumber: lw.workNumber,
                    decodingConsumablesLot: values.decodingConsumablesLot,
                    position: lw.position?.toLowerCase() === 'left' ? CassettePosition.Left : CassettePosition.Right,
                    samples: labwareSample
                      ? labwareSample.samples.map((sample) => {
                          return {
                            address: sample.address,
                            sampleId: sample.sampleId,
                            roi: sample.roi
                          };
                        })
                      : []
                  };
                });
                send({
                  type: 'SUBMIT_FORM',
                  values: {
                    performed: values.performed.replace('T', ' ') + ':00',
                    equipmentId: values.equipmentId!,
                    runName: values.runName,
                    repeat: values.repeat,
                    lotNumberA: values.lotNumberA,
                    lotNumberB: values.lotNumberB,
                    cellSegmentationLot: values.cellSegmentationLot,
                    labware: labwareROIData,
                    operationType: 'Xenium analyser'
                  }
                });
              }}
            >
              {({ values, setValues, isValid }) => (
                <Form>
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-6">
                    <Heading level={3}>Labware</Heading>
                    {values.labware
                      .filter((lw) => !lw.hybridisation)
                      .map((lw) => (
                        <Warning key={`war-${lw.labware.barcode}`}>
                          No probe hybridisation recorded for {lw.labware.barcode}
                        </Warning>
                      ))}
                    <LabwareScanner
                      limit={2}
                      onAdd={(labware) => {
                        /**If labware scanned not already displayed, add to list**/
                        createTableDataForSlots(labware, setValues, values);
                      }}
                      onRemove={async (labware) => {
                        await setValues((prev) => {
                          return {
                            ...prev,
                            labware: prev.labware.filter((lw) => lw.labware.barcode !== labware.barcode)
                          };
                        });
                      }}
                      enableFlaggedLabwareCheck
                    >
                      {({ removeLabware }) =>
                        values.labware.map((labwareForm) => (
                          <Panel key={labwareForm.labware.barcode}>
                            <div className="flex flex-row items-center justify-end">
                              <RemoveButton onClick={() => removeLabware(labwareForm.labware.barcode)} />
                            </div>
                            <div className="flex flex-row mt-3">{LabwareAnalyserTable(labwareForm)}</div>
                          </Panel>
                        ))
                      }
                    </LabwareScanner>
                  </motion.div>
                  {values.labware.length > 0 && values.labware.some((lw) => lw.hybridisation) && (
                    <>
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 py-4">
                        <Heading level={3}>Analyser Details</Heading>
                        <div className="grid grid-cols-3 gap-x-6 mt-2 pt-4">
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Time'}
                              data-testid={'performed'}
                              type="datetime-local"
                              name={'performed'}
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <CustomReactSelect
                              label={'Equipment'}
                              options={selectOptionValues(equipments, 'name', 'id')}
                              name="equipmentId"
                              dataTestId="equipmentId"
                              emptyOption={true}
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <WorkNumberSelect
                              label={'SGP Number'}
                              name={'workNumberAll'}
                              dataTestId={'workNumberAll'}
                              onWorkNumberChange={async (_workNumber) => {
                                const workNumber = _workNumber.trim();
                                const hasSgpNumberLink =
                                  workNumber.length > 0 ? await hasUploadedFilesInSgpFolder(workNumber) : false;
                                await setValues((prev) => {
                                  return {
                                    ...prev,
                                    workNumberAll: workNumber,
                                    labware: prev.labware.map((lw) => ({
                                      ...lw,
                                      workNumber,
                                      hasSgpNumberLink
                                    }))
                                  };
                                });
                              }}
                              requiredField={false}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-x-6 mt-2 pt-4">
                          <div className="flex flex-row">
                            <div className="w-1/2">
                              <FormikInput label={'Run Name'} type="text" name="runName" data-testid="runName" />
                            </div>
                            <div>
                              <FormikCheckbox name="repeat" dataTestId="is-repeat-run" label="Is a repeat run" />
                            </div>
                          </div>
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Decoding reagent A lot number'}
                              type="text"
                              name="lotNumberA"
                              data-testid="lotNumberA"
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Decoding reagent B lot number'}
                              type="text"
                              name="lotNumberB"
                              data-testid="lotNumberB"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-x-6 mt-2 pt-4">
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Cell segmentation lot number'}
                              type="text"
                              name="cellSegmentationLot"
                              data-testid="cellSegmentationLot"
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <FormikInput
                              label={'Decoding consumables lot number'}
                              name="decodingConsumablesLot"
                              data-testid="decodingConsumablesLot"
                            />
                          </div>
                        </div>
                      </motion.div>
                      {values.labware
                        .filter((lw) => lw.hybridisation)
                        .map((lw, lwIndex) => (
                          <motion.div variants={variants.fadeInWithLift} className="mt-4" key={lw.labware.barcode}>
                            <div className="flex flex-row gap-x-6">
                              <div>
                                <Labware labware={lw.labware} gridDirection={GridDirection.LeftUp} />
                              </div>
                              <div className="w-full">
                                <Table className="text-sm">
                                  <TableHead>
                                    <tr>
                                      <TableHeader>SGP Number</TableHeader>
                                      <TableHeader>Cassette Position</TableHeader>
                                      <TableHeader>Samples</TableHeader>
                                    </tr>
                                  </TableHead>
                                  <TableBody>
                                    <tr key={lw.labware.barcode}>
                                      <TableCell className="align-top w-1/10 ">
                                        <WorkNumberSelect
                                          name={`labware.${lwIndex}.workNumber`}
                                          dataTestId={`${lw.labware.barcode}-workNumber`}
                                          onWorkNumberChange={async (_workNumber) => {
                                            const workNumber = _workNumber.trim();
                                            const hasSgpNumberLink =
                                              workNumber.length > 0
                                                ? await hasUploadedFilesInSgpFolder(workNumber)
                                                : false;

                                            await setValues((prev: XeniumAnalyserFormValues) => {
                                              const updatedLabware = [...prev.labware];
                                              updatedLabware[lwIndex] = {
                                                ...updatedLabware[lwIndex],
                                                workNumber,
                                                hasSgpNumberLink
                                              };
                                              return { ...prev, labware: updatedLabware };
                                            });
                                          }}
                                          workNumber={values.labware[lwIndex]?.workNumber}
                                          requiredField={true}
                                        />
                                        {lw.hasSgpNumberLink && (
                                          <div
                                            className="mt-5 flex-row whitespace-nowrap"
                                            data-testid="sgp-folder-link"
                                          >
                                            <Link
                                              className="text-indigo-800 hover:text-indigo-900 active:text-indigo-950 font-semibold hover:underline"
                                              to={`/file_manager?workNumber=${values.labware[lwIndex]?.workNumber}`}
                                              target="_blank"
                                            >
                                              {`${values.labware[lwIndex]?.workNumber} Folder Link`}
                                            </Link>
                                          </div>
                                        )}
                                        <FormikErrorMessage name={`labware.${lwIndex}.workNumber`} />
                                      </TableCell>
                                      <TableCell className="align-top w-1/10">
                                        <CustomReactSelect
                                          options={objectKeys(CassettePosition).map((val) => {
                                            return { value: val, label: val };
                                          })}
                                          name={`labware.${lwIndex}.position`}
                                          dataTestId={`${lw.labware.barcode}-position`}
                                          emptyOption={true}
                                        />
                                      </TableCell>

                                      <TableCell className="align-top w-8/10">
                                        <div
                                          className={'flex flex-col space-y-2 w-full'}
                                          data-testid={`${lw.labware.barcode}-samples`}
                                        >
                                          <div className={'flex gap-x-10'}>
                                            <TabelSubHeader className="whitespace-normal break-words w-2/10">
                                              Slot address
                                            </TabelSubHeader>
                                            <TabelSubHeader className="whitespace-normal break-words w-3/10">
                                              External Id
                                            </TabelSubHeader>
                                            <TabelSubHeader className="whitespace-normal break-words w-2/10">
                                              Section number
                                            </TabelSubHeader>
                                            <TabelSubHeader className="whitespace-normal break-words w-3/10">
                                              Region
                                            </TabelSubHeader>
                                          </div>
                                          {lw.samples.map((sample, sampleIndex) => {
                                            return (
                                              <div
                                                className={'flex gap-x-10'}
                                                key={`${lw.labware.barcode}-${sample.sampleId}`}
                                              >
                                                <label className="items-center w-2/10">{sample.address}</label>
                                                <label className="items-center whitespace-normal break-words w-3/10">
                                                  {sample.externalName}
                                                </label>
                                                <label className="items-center w-2/10">{sample.sectionNumber}</label>
                                                <FormikInput
                                                  label={''}
                                                  className="w-3/10"
                                                  type="text"
                                                  name={`labware.${lwIndex}.samples.${sampleIndex}.roi`}
                                                  data-testid={`${lw.labware.barcode}-${sampleIndex}-roi`}
                                                  onBlur={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const barcode = e.target.value.trim();
                                                    if (barcode.length !== 0) {
                                                      const barcodeDisplayerProps = {
                                                        barcode,
                                                        warningMessage:
                                                          barcode !== sample.externalName
                                                            ? 'The region does not match the sample external name'
                                                            : undefined
                                                      };
                                                      await setValues((prev) => ({
                                                        ...prev,
                                                        barcodeDisplayerProps
                                                      }));
                                                    }
                                                  }}
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </TableCell>
                                    </tr>
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                        <BlueButton type="submit" disabled={!isValid}>
                          Save
                        </BlueButton>
                      </div>
                    </>
                  )}
                  <OperationCompleteModal
                    show={submissionResult !== undefined}
                    message={'Xenium analyser recorded on all labware'}
                    additionalButtons={
                      <WhiteButton
                        type="button"
                        style={{ marginLeft: 'auto' }}
                        className="w-full text-base md:ml-0 sm:ml-3 sm:w-auto sm:text:sm"
                        onClick={() => {
                          createSessionStorageForLabwareAwaiting(
                            values.labware.map((analyserLabware) => analyserLabware.labware as LabwareFieldsFragment)
                          );
                          navigate('/store');
                        }}
                      >
                        Store
                      </WhiteButton>
                    }
                  >
                    <p>
                      If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to
                      the Home screen.
                    </p>
                  </OperationCompleteModal>
                  {values.barcodeDisplayerProps && (
                    <BarcodeDisplayer
                      barcode={values.barcodeDisplayerProps.barcode}
                      warningMessage={values.barcodeDisplayerProps.warningMessage}
                      header={'Scan the region barcode into your machine'}
                      show={true}
                      onClose={async () => {
                        await setValues((prev) => ({
                          ...prev,
                          barcodeDisplayerProps: undefined
                        }));
                      }}
                    />
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default XeniumAnalyser;
