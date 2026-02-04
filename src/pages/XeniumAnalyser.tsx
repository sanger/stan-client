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
  RecordAnalyserMutation
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
import FormikInput, { FormikCheckbox, Input } from '../components/forms/Input';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
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
import Labware from '../components/labwarePerSection/Labware';
import Panel from '../components/Panel';
import WhiteButton from '../components/buttons/WhiteButton';
import { createSessionStorageForLabwareAwaiting } from '../types/stan';
import { BarcodeDisplayer } from '../components/modal/BarcodeDisplayer';
import { findUploadedFiles } from '../lib/services/fileService';
import { sectionGroupsBySample } from '../lib/helpers/labwareHelper';
import Label from '../components/forms/Label';
import PinkButton from '../components/buttons/PinkButton';
import Modal, { ModalBody, ModalFooter } from '../components/Modal';
import RegionDefiner from '../components/xeniumAnalyser/RegionDefiner';
import { PlannedSectionDetails } from '../lib/machines/layout/layoutContext';

export type Region = {
  roi: string;
  colorIndexNumber?: number;
  sectionGroups: Array<PlannedSectionDetails>;
};

export type AnalyserLabwareForm = {
  labware: LabwareFlaggedFieldsFragment;
  hybridisation: boolean;
  workNumber: string;
  hasSgpNumberLink?: boolean;
  position?: CassettePosition;
  regions: Array<Region>;
  analyserScanData?: AnalyserScanDataFieldsFragment;
  /**
   * Temporarily stores the color index selected by the user while defining
   * a new region in the RegionDefiner component.
   *
   * This value is cleared once region creation or removal is completed.
   */
  selectedRegionColorIndex?: number;

  /**
   * Temporarily stores the set of slot / section addresses selected by the user
   * when creating or modifying a region in the RegionDefiner component.
   *
   * This value is cleared after the region operation completes.
   */
  selectedAddresses?: Set<string>;
};

export type XeniumAnalyserFormValues = {
  lotNumberA: string;
  lotNumberB: string;
  cellSegmentationLot: string;
  decodingConsumablesLot?: string;
  equipmentId: number | undefined;
  runName: string;
  repeat: boolean;
  performed: string;
  /**
   * Controls whether the RegionDefiner UI is visible.
   * When true, the user can create, edit, or remove regions.
   */
  showRegionDefiner: boolean;
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
  showRegionDefiner: false,
  labware: [],
  performed: '',
  workNumberAll: ''
};

type BarcodeDisplayerProps = {
  barcode: string;
  warningMessage?: string;
};

export const regionName = (runName: string, sgpNumber: string, index: number) => {
  return [sgpNumber, runName, `Region${index + 1}`].filter(Boolean).join('_');
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
    showRegionDefiner: Yup.boolean(),
    labware: Yup.array()
      .of(
        Yup.object().shape({
          hybridisation: Yup.boolean(),
          workNumber: Yup.string().required().label('SGP Number'),
          position: Yup.string().required(),
          selectedRegionColorIndex: Yup.number(),
          selectedAddresses: Yup.array(),
          regions: Yup.array()
            .of(
              Yup.object().shape({
                roi: Yup.string()
                  .required('Region of interest is a required field')
                  .label('ROI')
                  .max(64, 'Region of interest field should be string of maximum length 64'),
                sectionGroups: Yup.array().min(1).required('At least one section group per region'),
                colorIndexNumber: Yup.number()
              })
            )
            .required()
            .min(1)
        })
      )
      .required()
      .min(1)
  });

  /**
   * Builds a list of labware regions.
   * Initially, each section group is assigned to its own region.
   */
  const labwareRegions = React.useCallback((lw: LabwareFlaggedFieldsFragment) => {
    const sectionGroups = sectionGroupsBySample(lw);
    const regions: Array<Region> = [];
    Object.values(sectionGroups).forEach((sectionGroup, index) => {
      const roi = regionName('', '', index);
      regions.push({
        roi: roi,
        sectionGroups: [sectionGroup]
      });
    });
    return regions;
  }, []);

  /**This creates the slot related information for the labware */
  const createTableDataForSlots = React.useCallback(
    (
      labware: LabwareFlaggedFieldsFragment,
      setValues: (values: SetStateAction<XeniumAnalyserFormValues>, shouldValidate?: boolean) => {},
      values: XeniumAnalyserFormValues
    ) => {
      const setLabwareSampleData = async (lw: LabwareFlaggedFieldsFragment) => {
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
                    regions: labwareRegions(labware),
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
                regions: labwareRegions(labware)
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
    [labwareRegions, stanCore]
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
                  const labwareSections = values.labware.find((ls) => ls.labware.barcode === lw.labware.barcode);
                  return {
                    barcode: lw.labware.barcode,
                    workNumber: lw.workNumber,
                    decodingConsumablesLot: values.decodingConsumablesLot,
                    position: lw.position?.toLowerCase() === 'left' ? CassettePosition.Left : CassettePosition.Right,
                    samples: labwareSections
                      ? labwareSections?.regions!.flatMap((region) =>
                          region.sectionGroups.flatMap((section) =>
                            Array.from(section.addresses).flatMap((address) => ({
                              address,
                              sampleId: section.source.sampleId,
                              roi: region.roi
                            }))
                          )
                        )
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
              {({ values, setValues, isValid, setFieldValue }) => (
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
                                      hasSgpNumberLink,
                                      regions: lw.regions.map((region, index) => ({
                                        ...region,
                                        roi: regionName(prev.runName, workNumber, index)
                                      }))
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
                              <Label name={'Run Name'} className={'whitespace-nowrap'} />
                              <Input
                                type="text"
                                name="runName"
                                data-testid="runName"
                                onChange={async (e) => {
                                  const runName = e.target.value.trim();
                                  if (runName && runName.length > 0) {
                                    await setValues((prev) => ({
                                      ...prev,
                                      runName,
                                      labware: prev.labware.map((lw) => ({
                                        ...lw,
                                        regions: lw.regions.map((region, i) => ({
                                          ...region,
                                          roi: regionName(runName, lw.workNumber, i)
                                        }))
                                      }))
                                    }));
                                  }
                                }}
                              />
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
                            <div className="grid grid-cols-4 gap-x-2">
                              <div className="flex flex-col items-center justify-between space-y-8">
                                <Labware
                                  labware={lw.labware}
                                  gridDirection={GridDirection.LeftUp}
                                  regions={lw.regions}
                                  onSlotClick={async () => {
                                    await setFieldValue('showRegionDefiner', true);
                                  }}
                                />
                                <PinkButton
                                  data-testid={'define-regions-button'}
                                  onClick={async () => {
                                    await setFieldValue('showRegionDefiner', true);
                                  }}
                                >
                                  Define Regions
                                </PinkButton>
                              </div>
                              <div className="col-span-3">
                                <div className="grid grid-cols-7 gap-x-2">
                                  <div className="col-span-1">
                                    <div className="grid grid-rows-3 ">
                                      <div>
                                        <label>SGP Number</label>
                                        <WorkNumberSelect
                                          name={`labware.${lwIndex}.workNumber`}
                                          dataTestId={`${lw.labware.barcode}-workNumber`}
                                          onWorkNumberChange={async (_workNumber) => {
                                            const workNumber = _workNumber.trim();
                                            const hasSgpNumberLink =
                                              workNumber.length > 0
                                                ? await hasUploadedFilesInSgpFolder(workNumber)
                                                : false;
                                            await setValues((prev) => ({
                                              ...prev,
                                              labware: prev.labware.map((lw, index) =>
                                                index !== lwIndex
                                                  ? lw
                                                  : {
                                                      ...lw,
                                                      workNumber,
                                                      hasSgpNumberLink,
                                                      regions: lw.regions.map((region, i) => ({
                                                        ...region,
                                                        roi: regionName(prev.runName, workNumber, i)
                                                      }))
                                                    }
                                              )
                                            }));
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
                                      </div>
                                      <div>
                                        <label>Cassette Position</label>
                                        <CustomReactSelect
                                          options={objectKeys(CassettePosition).map((val) => {
                                            return { value: val, label: val };
                                          })}
                                          name={`labware.${lwIndex}.position`}
                                          dataTestId={`${lw.labware.barcode}-position`}
                                          emptyOption={true}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-span-6" data-testid={`${lw.labware.barcode}-regions-table`}>
                                    <Table>
                                      <TableHead>
                                        <tr>
                                          <TableHeader>Region</TableHeader>
                                          <TableHeader>External Id</TableHeader>
                                          <TableHeader>Section Number</TableHeader>
                                          <TableHeader>Address(es)</TableHeader>
                                        </tr>
                                      </TableHead>
                                      <TableBody>
                                        {values.labware[lwIndex].regions.map((region, regionIndex) => (
                                          <tr key={`region-row-${regionIndex}`}>
                                            <TableCell className="break-words align-top">
                                              <div className="grid grid-cols-1">
                                                <FormikInput
                                                  label={''}
                                                  type="textarea"
                                                  as="textarea"
                                                  data-testid={`${lw.labware.barcode}-${regionIndex}-roi`}
                                                  name={`labware[${lwIndex}].regions[${regionIndex}].roi`}
                                                  onBlur={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const barcode = e.target.value.trim();
                                                    if (barcode.length !== 0) {
                                                      await setFieldValue('barcodeDisplayerProps', { barcode });
                                                    }
                                                  }}
                                                />
                                              </div>
                                            </TableCell>
                                            <TableCell className="break-words align-top">
                                              <div className="grid grid-cols-1">
                                                {region.sectionGroups.map((section, index) => {
                                                  return (
                                                    <label className="py-1" key={`externalName-${index}`}>
                                                      {section.source.tissue?.externalName}
                                                    </label>
                                                  );
                                                })}
                                              </div>
                                            </TableCell>
                                            <TableCell className="break-words align-top">
                                              <div className="grid grid-cols-1">
                                                {region.sectionGroups.map((section, index) => {
                                                  return (
                                                    <label className="py-1" key={`section-${index}`}>
                                                      {section.source.newSection}
                                                    </label>
                                                  );
                                                })}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="grid grid-cols-1 text-wrap">
                                                {region.sectionGroups.map((section, index) => {
                                                  return (
                                                    <label className="py-1" key={`addresses-${index}`}>
                                                      {Array.from(section.addresses).join(', ')}
                                                    </label>
                                                  );
                                                })}
                                              </div>
                                            </TableCell>
                                          </tr>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Modal show={values.showRegionDefiner}>
                              <ModalBody>
                                <RegionDefiner labwareIndex={lwIndex} />
                              </ModalBody>
                              <ModalFooter>
                                <BlueButton
                                  className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
                                  onClick={async () => {
                                    await setFieldValue('showRegionDefiner', false);
                                  }}
                                >
                                  Done
                                </BlueButton>
                              </ModalFooter>
                            </Modal>
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
