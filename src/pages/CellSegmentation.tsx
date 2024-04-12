import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import {
  CommentFieldsFragment,
  LabwareFlaggedFieldsFragment,
  SegmentationLabware,
  SegmentationMutation,
  SegmentationRequest,
  SlideCosting
} from '../types/sdk';
import { motion } from 'framer-motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import FormikInput from '../components/forms/Input';
import { formatDateTimeForCore, getCurrentDateTime } from '../types/stan';
import WorkNumberSelect from '../components/WorkNumberSelect';
import React, { useContext } from 'react';
import BlueButton from '../components/buttons/BlueButton';
import { useLoaderData } from 'react-router-dom';
import { selectOptionValues } from '../components/forms';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import * as Yup from 'yup';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import { StanCoreContext } from '../lib/sdk';
import createFormMachine from '../lib/machines/form/formMachine';
import { fromPromise } from 'xstate';
import { useMachine } from '@xstate/react';
import Warning from '../components/notifications/Warning';
import RemoveButton from '../components/buttons/RemoveButton';
import Panel from '../components/Panel';
import MutedText from '../components/MutedText';

type CellSegmentationProps = {
  labware: LabwareFlaggedFieldsFragment;
  workNumber: string;
  performed: string;
  costing: string;
  comments: string[];
};

export type CellSegmentationFormProps = {
  cellSegmentation: CellSegmentationProps[];
  workNumberAll: string;
  performedAll: string;
  costingAll: string;
  commentsAll: string[];
};

const defaultFormValues: CellSegmentationFormProps = {
  cellSegmentation: [],
  workNumberAll: '',
  performedAll: getCurrentDateTime(),
  costingAll: '',
  commentsAll: []
};

const validationSchema = Yup.object().shape({
  cellSegmentation: Yup.array().of(
    Yup.object().shape({
      workNumber: Yup.string().required('SGP number is required'),
      performed: Yup.string().required('Performed time is required'),
      costing: Yup.string().oneOf(Object.values(SlideCosting)).required('Costing is required'),
      comments: Yup.array().of(Yup.string()).min(1, 'Comment is required')
    })
  )
});

const slideCostingOptions: OptionType[] = Object.values(SlideCosting).map((val) => {
  return { value: val, label: val };
});

const toSegmentationRequest = (values: CellSegmentationFormProps): SegmentationRequest => {
  const labware: Array<SegmentationLabware> = values.cellSegmentation.map((cellSeg) => ({
    barcode: cellSeg.labware.barcode,
    workNumber: cellSeg.workNumber,
    performed: formatDateTimeForCore(cellSeg.performed),
    costing: SlideCosting[cellSeg.costing as keyof typeof SlideCosting],
    commentIds: cellSeg.comments.map((comment) => parseInt(comment))
  }));
  return {
    operationType: 'Cell segmentation',
    labware
  };
};

export const CellSegmentation = ({ initialFormValues = defaultFormValues }) => {
  const comments = useLoaderData() as CommentFieldsFragment[];
  const stanCore = useContext(StanCoreContext);
  const formMachine = React.useMemo(() => {
    return createFormMachine<SegmentationRequest, SegmentationMutation>().provide({
      actors: {
        submitForm: fromPromise(({ input }) => {
          if (input.event.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.Segmentation({
            request: { ...input.event.values }
          });
        })
      }
    });
  }, [stanCore]);

  const [current, send] = useMachine(formMachine);
  const { serverError, submissionResult } = current.context;
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Cell Segmentation</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {serverError && <Warning error={serverError} />}
          <div className={'flex flex-col space-y-6'}>
            <Formik
              initialValues={initialFormValues}
              onSubmit={async (values) => {
                send({ type: 'SUBMIT_FORM', values: toSegmentationRequest(values) });
              }}
              validationSchema={validationSchema}
              validateOnMount={true}
            >
              {({ values, setValues, isValid }) => (
                <Form>
                  <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-6">
                    <Heading level={3}>Labware</Heading>
                    {values.cellSegmentation.length === 0 && (
                      <MutedText>Scan a piece of labware to get started</MutedText>
                    )}
                    <LabwareScanner
                      onAdd={async (labware) => {
                        await setValues((prev: CellSegmentationFormProps) => {
                          let cellSegmentation = [...prev.cellSegmentation];
                          cellSegmentation.push({
                            labware: labware,
                            workNumber: prev.workNumberAll ?? '',
                            performed: prev.performedAll ?? '',
                            costing: prev.costingAll ?? undefined,
                            comments: prev.commentsAll ?? []
                          });
                          return { ...prev, cellSegmentation };
                        });
                      }}
                      onRemove={async (labware) => {
                        await setValues((prev: CellSegmentationFormProps) => {
                          let cellSegmentation = values.cellSegmentation.filter(
                            (cellSeg) => cellSeg.labware.barcode !== labware.barcode
                          );
                          return { ...prev, cellSegmentation };
                        });
                      }}
                      enableFlaggedLabwareCheck
                    >
                      {({ labwares, removeLabware }) => {
                        return (
                          <div>
                            {labwares.map((labware) => (
                              <Panel key={labware.barcode}>
                                <div className="flex flex-row items-center justify-end">
                                  <RemoveButton
                                    data-testid={'remove'}
                                    onClick={() => {
                                      removeLabware(labware.barcode);
                                    }}
                                  />
                                </div>
                                <div>
                                  <Table data-testid="labware-table-details">
                                    <TableHead>
                                      <tr>
                                        <TableHeader>Barcode</TableHeader>
                                        <TableHeader>Donor Id </TableHeader>
                                        <TableHeader>External Name</TableHeader>
                                        <TableHeader>Tissue type</TableHeader>
                                        <TableHeader>Section Number</TableHeader>
                                      </tr>
                                    </TableHead>
                                    <TableBody>
                                      {labware.slots.map((slot) =>
                                        slot.samples.map((sample) => (
                                          <tr key={`${labware.barcode}-${slot.id}-${sample.id}`}>
                                            <TableCell>{labware.barcode}</TableCell>
                                            <TableCell>{sample.tissue.donor.donorName}</TableCell>
                                            <TableCell>{sample.tissue.externalName}</TableCell>
                                            <TableCell>{sample.tissue.spatialLocation.tissueType.name}</TableCell>
                                            <TableCell>{sample.section}</TableCell>
                                          </tr>
                                        ))
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </Panel>
                            ))}
                            {labwares.length > 0 && (
                              <div>
                                <div className="mx-auto max-w-screen-lg py-2 mb-6">
                                  <div className="mt-4 p-3 bg-gray-100 rounded-md" data-testid="apply-to-all-div">
                                    <motion.div variants={variants.fadeInWithLift} className="space-y-4 p-2 pr-5">
                                      <Heading level={3}>Apply to all</Heading>
                                      <div className="grid grid-cols-2 gap-4 mt-2 pt-4">
                                        <div className={'flex flex-col'}>
                                          <WorkNumberSelect
                                            label={'SGP Number'}
                                            name={'workNumberAll'}
                                            dataTestId={'workNumberAll'}
                                            onWorkNumberChange={async (workNumber) => {
                                              await setValues((prev) => {
                                                let cellSegmentation = [...prev.cellSegmentation];
                                                cellSegmentation.forEach((cellSeg) => {
                                                  cellSeg.workNumber = workNumber;
                                                });
                                                return { ...prev, cellSegmentation, workNumberAll: workNumber };
                                              });
                                            }}
                                            requiredField={false}
                                          />
                                        </div>
                                        <div className={'flex flex-col'}>
                                          <FormikInput
                                            label={'Time'}
                                            data-testid={'performedAll'}
                                            type="datetime-local"
                                            name={'performedAll'}
                                            onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                                              await setValues((prev) => {
                                                let cellSegmentation = [...prev.cellSegmentation];
                                                cellSegmentation.forEach((cellSeg) => {
                                                  cellSeg.performed = e.target.value;
                                                });
                                                return { ...prev, cellSegmentation, performedAll: e.target.value };
                                              });
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 mt-2 pt-4">
                                        <div className={'flex flex-col'}>
                                          <CustomReactSelect
                                            label={'Costing'}
                                            options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                                            name="costingAll"
                                            dataTestId="costingAll"
                                            emptyOption={true}
                                            onChange={async (val) => {
                                              const costingAll = (val as OptionType).value;
                                              await setValues((prev) => {
                                                let cellSegmentation = [...prev.cellSegmentation];
                                                cellSegmentation.forEach((cellSeg) => {
                                                  cellSeg.costing = costingAll;
                                                });
                                                return { ...prev, cellSegmentation, costingAll };
                                              });
                                            }}
                                          />
                                        </div>
                                        <div className={'flex flex-col'}>
                                          <CustomReactSelect
                                            label={'Comment'}
                                            options={selectOptionValues(comments, 'text', 'id')}
                                            name="commentsAll"
                                            dataTestId="commentsAll"
                                            emptyOption={true}
                                            isMulti={true}
                                            onChange={async (val) => {
                                              const commentsAll = (val as OptionType[]).map((v) => v.value);
                                              await setValues((prev) => {
                                                let cellSegmentation = [...prev.cellSegmentation];
                                                cellSegmentation.forEach((cellSeg) => {
                                                  cellSeg.comments = commentsAll;
                                                });
                                                return { ...prev, cellSegmentation, commentsAll };
                                              });
                                            }}
                                            value={values.commentsAll}
                                          />
                                        </div>
                                      </div>
                                    </motion.div>
                                  </div>
                                </div>
                                <div className="py-6">
                                  <Table data-testid="cell-segmentation-values">
                                    <TableHead>
                                      <tr>
                                        <TableHeader>Barcode</TableHeader>
                                        <TableHeader>SGP Number</TableHeader>
                                        <TableHeader>Performed</TableHeader>
                                        <TableHeader>Costing</TableHeader>
                                        <TableHeader>Comment</TableHeader>
                                      </tr>
                                    </TableHead>
                                    <TableBody>
                                      {values.cellSegmentation.map((cellSeg, index) => {
                                        return (
                                          <tr key={index}>
                                            <TableCell>{cellSeg.labware.barcode}</TableCell>
                                            <TableCell>
                                              <WorkNumberSelect
                                                name={`cellSegmentation.${index}.workNumber`}
                                                dataTestId={`cellSegmentation.${index}.workNumber`}
                                                workNumber={cellSeg.workNumber}
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <FormikInput
                                                label={''}
                                                type="datetime-local"
                                                name={`cellSegmentation.${index}.performed`}
                                                data-testid={`cellSegmentation.${index}.performed`}
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <CustomReactSelect
                                                options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                                                name={`cellSegmentation.${index}.costing`}
                                                dataTestId={`cellSegmentation.${index}.costing`}
                                                emptyOption={true}
                                                value={cellSeg.costing ?? ''}
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <CustomReactSelect
                                                options={selectOptionValues(comments, 'text', 'id')}
                                                name={`cellSegmentation.${index}.comments`}
                                                dataTestId={`cellSegmentation.${index}.comments`}
                                                emptyOption={true}
                                                isMulti={true}
                                                value={cellSeg.comments ?? []}
                                              />
                                            </TableCell>
                                          </tr>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                                <div className={'sm:flex mt-4 sm:flex-row justify-end'}>
                                  <BlueButton type="submit" disabled={!isValid}>
                                    Save
                                  </BlueButton>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    </LabwareScanner>
                  </motion.div>
                </Form>
              )}
            </Formik>
          </div>
          <OperationCompleteModal
            show={submissionResult !== undefined}
            message={'Cell Segmentation recorded on all labware'}
          >
            <p>
              If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the
              Home screen.
            </p>
          </OperationCompleteModal>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
