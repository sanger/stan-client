import { useFormikContext } from 'formik';
import React from 'react';
import { CommentFieldsFragment, LabwareFlaggedFieldsFragment, SlideCosting } from '../../types/sdk';
import LabwareScanner from '../labwareScanner/LabwareScanner';
import MutedText from '../MutedText';
import Heading from '../Heading';
import { motion } from 'framer-motion';
import variants from '../../lib/motionVariants';
import Panel from '../Panel';
import RemoveButton from '../buttons/RemoveButton';
import FormikInput from '../forms/Input';
import { getCurrentDateTime } from '../../types/stan';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { selectOptionValues } from '../forms';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import WorkNumberSelect from '../WorkNumberSelect';
import LabwareSamplesTable from './LabwareSamplesTable';
import { capitalize } from 'lodash';

type CellSegmentationPageProps = {
  comments: CommentFieldsFragment[];
  isQc: boolean;
};

type CellSegmentationProps = {
  labware: LabwareFlaggedFieldsFragment;
  costing?: string;
  workNumber: string;
  performed: string;
  comments?: string[];
};

type CellSegmentationFormProps = {
  cellSegmentation: CellSegmentationProps[];
  workNumberAll: string;
  performedAll: string;
  costingAll?: string;
  commentsAll?: string[];
};

export const slideCostingOptions: OptionType[] = Object.values(SlideCosting).map((val) => {
  return { value: capitalize(val), label: val };
});
export const Segmentation = ({ comments, isQc }: CellSegmentationPageProps) => {
  const { values, setFieldValue, setValues } = useFormikContext<CellSegmentationFormProps>();
  return (
    <motion.div variants={variants.fadeInWithLift} className="space-y-4 mb-6">
      <Heading level={3}>Labware</Heading>
      {values.cellSegmentation.length === 0 && <MutedText>Scan a piece of labware to get started</MutedText>}
      <LabwareScanner
        onAdd={async (labware) => {
          await setValues((prev: CellSegmentationFormProps) => {
            let cellSegmentation = [...prev.cellSegmentation];
            cellSegmentation.push({
              labware: labware,
              workNumber: prev.workNumberAll ?? '',
              performed: prev.performedAll ?? '',
              comments: prev.commentsAll ?? [],
              costing: !isQc ? prev.costingAll ?? '' : undefined
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
                  <LabwareSamplesTable labware={labware} />
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
                              max={getCurrentDateTime()}
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
                          {!isQc && (
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
                          )}
                          <div className={'flex flex-col'}>
                            <CustomReactSelect
                              label={'Comment'}
                              options={selectOptionValues(comments, 'text', 'id')}
                              name="commentsAll"
                              dataTestId="commentsAll"
                              emptyOption={true}
                              isMulti={true}
                              onChange={async (val) => {
                                const commentsAll = (val as OptionType[])
                                  .filter((v) => v.label.length > 0)
                                  .map((v) => v.value);
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
                          {!isQc && <TableHeader>Costing</TableHeader>}
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
                                  dataTestId={`cellSegmentation.${index}.workNumber`}
                                  workNumber={cellSeg.workNumber}
                                  onWorkNumberChange={async (workNumber) => {
                                    await setFieldValue(`cellSegmentation.${index}.workNumber`, workNumber);
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <FormikInput
                                  label={''}
                                  max={getCurrentDateTime()}
                                  type="datetime-local"
                                  name={`cellSegmentation.${index}.performed`}
                                  data-testid={`cellSegmentation.${index}.performed`}
                                />
                              </TableCell>
                              {!isQc && (
                                <TableCell>
                                  <CustomReactSelect
                                    options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                                    name={`cellSegmentation.${index}.costing`}
                                    dataTestId={`cellSegmentation.${index}.costing`}
                                    emptyOption={true}
                                    value={cellSeg.costing}
                                    onChange={async (val) => {
                                      await setFieldValue(
                                        `cellSegmentation.${index}.costing`,
                                        (val as OptionType).value
                                      );
                                    }}
                                  />
                                </TableCell>
                              )}
                              <TableCell>
                                <CustomReactSelect
                                  name={`cellSegmentation.${index}.comments`}
                                  options={selectOptionValues(comments, 'text', 'id')}
                                  dataTestId={`cellSegmentation.${index}.comments`}
                                  emptyOption={true}
                                  isMulti={true}
                                  value={cellSeg.comments ?? []}
                                  onChange={async (val) => {
                                    const selected = (val as OptionType[])
                                      .filter((v) => v.label.length > 0)
                                      .map((v) => v.value);
                                    await setFieldValue(`cellSegmentation.${index}.comments`, selected);
                                  }}
                                />
                              </TableCell>
                            </tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </LabwareScanner>
    </motion.div>
  );
};
