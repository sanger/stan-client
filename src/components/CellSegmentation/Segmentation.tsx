import { useFormikContext } from 'formik';
import React from 'react';
import { LabwareFlaggedFieldsFragment, SlideCosting } from '../../types/sdk';
import LabwareScanner from '../labwareScanner/LabwareScanner';
import MutedText from '../MutedText';
import Heading from '../Heading';
import { motion } from '../../dependencies/motion';
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
import StyledLink from '../StyledLink';
import FlagIcon from '../icons/FlagIcon';
import { slideCostingOptions } from '../../lib/helpers';
import WhiteButton from '../buttons/WhiteButton';
import AddIcon from '../icons/AddIcon';
import { FlaggedBarcodeLink } from '../dataTableColumns/labwareColumns';
import IconButton from '../buttons/IconButton';
import { CellSegmentationDataLorder } from '../../pages/CellSegmentation';

type PanelLot = {
  name: string;
  lot: string;
  costing?: SlideCosting;
};

type CellSegmentationProps = {
  labware: LabwareFlaggedFieldsFragment;
  costing?: string;
  workNumber: string;
  performed: string;
  comments?: string[];
  proteinPanels: PanelLot[];
};

type CellSegmentationFormProps = {
  cellSegmentation: CellSegmentationProps[];
  workNumberAll: string;
  performedAll: string;
  costingAll?: string;
  commentsAll?: string[];
  reagentLotAll: string;
  proteinPanelCosting: string;
  proteinPanelName: string;
  proteinPanelLot: string;
};

const labwareLink = (labware: LabwareFlaggedFieldsFragment) => {
  return (
    <div className="whitespace-nowrap">
      <StyledLink
        className="text-sp bg-transparent hover:text-sp-700 active:text-sp-800"
        to={`/labware/${labware.barcode}`}
        target="_blank"
      >
        {labware.flagged && <FlagIcon className="inline-block h-5 w-5 -ml-1 mr-1 mb-2" />}
        {labware.barcode}
      </StyledLink>
    </div>
  );
};
export const Segmentation = ({ comments, proteinPanels }: CellSegmentationDataLorder) => {
  const { values, setFieldValue, setValues, errors } = useFormikContext<CellSegmentationFormProps>();
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
              costing: prev.costingAll ?? '',
              proteinPanels: []
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
                  {labwareLink(labware)}
                  <LabwareSamplesTable labware={labware} showBarcode={false} />
                </Panel>
              ))}
              {labwares.length > 0 && (
                <div>
                  <div className="mx-auto max-w-screen-lx py-2 mb-6 grid grid-cols-2 gap-4">
                    <div className="mt-4 p-3 bg-gray-200 rounded-md" data-testid="apply-to-all-div">
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 p-2 pr-5">
                        <Heading level={3}>Apply to all</Heading>
                        <div className="grid grid-cols-3 gap-4 mt-2 pt-4">
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
                            <FormikInput
                              label={'Reagent LOT'}
                              name={'reagentLotAll'}
                              onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                                await setValues((prev) => {
                                  const cellSegmentation = prev.cellSegmentation.map((cellSeg) => {
                                    return { ...cellSeg, reagentLot: e.target.value };
                                  });
                                  return { ...prev, cellSegmentation, reagentLotAll: e.target.value };
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

                    <div className="mt-4 p-3 bg-gray-200 rounded-md" data-testid="add-to-all-div">
                      <motion.div variants={variants.fadeInWithLift} className="space-y-4 p-2 pr-5">
                        <Heading level={3}>Protein Panels</Heading>
                        <div className="grid grid-cols-3 gap-4 mt-2 pt-4">
                          <div>
                            <CustomReactSelect
                              label={'Protein Panel'}
                              options={selectOptionValues(proteinPanels, 'name', 'name')}
                              name="proteinPanelName"
                              dataTestId="proteinPanelName"
                              emptyOption={true}
                            />
                          </div>
                          <div className={'flex flex-col'}>
                            <FormikInput label={'LOT number'} name={'proteinPanelLot'} />
                          </div>
                          <div className={'flex flex-col'}>
                            <CustomReactSelect
                              label={'Costing'}
                              options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                              name="proteinPanelCosting"
                              dataTestId="proteinPanelCosting"
                              emptyOption={true}
                            />
                          </div>
                        </div>
                        <div className="sm:flex sm:flex-row mt-4 pt-4 items-center justify-end">
                          <WhiteButton
                            data-testid="addProteinPanel"
                            type="button"
                            disabled={
                              !values.proteinPanelCosting ||
                              !values.proteinPanelName ||
                              !values.proteinPanelLot ||
                              errors.proteinPanelLot !== undefined
                            }
                            onClick={async () => {
                              await setValues((prev) => {
                                let cellSegmentation = [...prev.cellSegmentation];
                                cellSegmentation.forEach((cellSeg) => {
                                  let proteinPanels = [...cellSeg.proteinPanels];
                                  proteinPanels.push({
                                    name: prev.proteinPanelName,
                                    lot: prev.proteinPanelLot,
                                    costing: prev.proteinPanelCosting as SlideCosting
                                  });
                                  cellSeg.proteinPanels = proteinPanels;
                                });
                                return { ...prev, cellSegmentation };
                              });
                            }}
                          >
                            <AddIcon className="inline-block text-green-500 h-4 w-4 mt-1 mr-2" />
                            Add to all
                          </WhiteButton>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  {labwares.length > 0 &&
                    values.cellSegmentation.map((cellSeg, index) => (
                      <Panel key={cellSeg.labware.barcode}>
                        <div className="grid grid-cols-2 mb-4 ">
                          {FlaggedBarcodeLink(cellSeg.labware.barcode, cellSeg.labware.flagPriority)}
                          <div className="flex flex-row items-center justify-end">
                            <RemoveButton
                              onClick={() => {
                                removeLabware(cellSeg.labware.barcode);
                              }}
                            />
                          </div>
                        </div>
                        <div className={'grid grid-cols-2 gap-4'}>
                          <div className="grid grid-cols-3 gap-3 bg-gray-50 shadow-sm p-4 rounded-md mt-2">
                            <WorkNumberSelect
                              label="SGP Number"
                              dataTestId={`cellSegmentation.${index}.workNumber`}
                              workNumber={cellSeg.workNumber}
                              onWorkNumberChange={async (workNumber) => {
                                await setFieldValue(`cellSegmentation.${index}.workNumber`, workNumber);
                              }}
                            />
                            <FormikInput
                              label="Performed"
                              max={getCurrentDateTime()}
                              type="datetime-local"
                              name={`cellSegmentation.${index}.performed`}
                              data-testid={`cellSegmentation.${index}.performed`}
                            />
                            <CustomReactSelect
                              label="Costing"
                              options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                              name={`cellSegmentation.${index}.costing`}
                              dataTestId={`cellSegmentation.${index}.costing`}
                              emptyOption={true}
                              value={cellSeg.costing}
                              onChange={async (val) => {
                                await setFieldValue(`cellSegmentation.${index}.costing`, (val as OptionType).value);
                              }}
                            />
                            <FormikInput
                              label="Reagent LOT"
                              name={`cellSegmentation.${index}.reagentLot`}
                              data-testid={`cellSegmentation.${index}.reagentLot`}
                            />
                            <CustomReactSelect
                              label="Comment"
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
                          </div>
                          <div>
                            <Table data-testid="labware-protein-probes">
                              <TableHead>
                                <TableHeader>Protein Panel</TableHeader>
                                <TableHeader>Lot number</TableHeader>
                                <TableHeader>Costing</TableHeader>
                                <TableHeader></TableHeader>
                              </TableHead>
                              {cellSeg.proteinPanels.length === 0 && (
                                <TableBody>
                                  <tr>
                                    <TableCell>
                                      <CustomReactSelect
                                        name={`cellSegmentation.${index}.proteinPanels.0.name`}
                                        options={selectOptionValues(proteinPanels, 'name', 'name')}
                                        dataTestId={`cellSegmentation.${index}.proteinPanels.0.name`}
                                        emptyOption={true}
                                        value={`cellSegmentation.${index}.proteinPanels.0`}
                                        onChange={async (val) => {
                                          await setFieldValue(
                                            `cellSegmentation.${index}.proteinPanels.0.name`,
                                            (val as OptionType).value
                                          );
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <FormikInput
                                        label=""
                                        name={`cellSegmentation.${index}.proteinPanels.0.lot`}
                                        data-testid={`cellSegmentation.${index}.proteinPanels.0.lot`}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <CustomReactSelect
                                        options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                                        name={`cellSegmentation.${index}.proteinPanels.0.costing`}
                                        dataTestId={`cellSegmentation.${index}.proteinPanels.0.costing`}
                                        emptyOption={true}
                                        onChange={async (val) => {
                                          await setFieldValue(
                                            `cellSegmentation.${index}.proteinPanels.0.costing`,
                                            (val as OptionType).value
                                          );
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className={'flex flex-row space-x-2'}></div>
                                    </TableCell>
                                  </tr>
                                </TableBody>
                              )}
                              {cellSeg.proteinPanels.length > 0 &&
                                cellSeg.proteinPanels.map((proteinPanel, probeIndex) => (
                                  <TableBody>
                                    <tr key={probeIndex}>
                                      <TableCell>
                                        <CustomReactSelect
                                          name={`cellSegmentation.${index}.proteinPanels.${probeIndex}.name`}
                                          options={selectOptionValues(proteinPanels, 'name', 'name')}
                                          dataTestId={`cellSegmentation.${index}.proteinPanels.${probeIndex}.name`}
                                          emptyOption={true}
                                          value={proteinPanel.name}
                                          onChange={async (val) => {
                                            await setFieldValue(
                                              `cellSegmentation.${index}.proteinPanels.${probeIndex}.name`,
                                              (val as OptionType).value
                                            );
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <FormikInput
                                          label=""
                                          name={`cellSegmentation.${index}.proteinPanels.${probeIndex}.lot`}
                                          data-testid={`cellSegmentation.${index}.proteinPanels.${probeIndex}.lot`}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <CustomReactSelect
                                          options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                                          name={`cellSegmentation.${index}.proteinPanels.${probeIndex}.costing`}
                                          dataTestId={`cellSegmentation.${index}.proteinPanels.${probeIndex}.costing`}
                                          emptyOption={true}
                                          value={proteinPanel.costing}
                                          onChange={async (val) => {
                                            await setFieldValue(
                                              `cellSegmentation.${index}.proteinPanels.${probeIndex}.costing`,
                                              (val as OptionType).value
                                            );
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <div
                                          className={'flex flex-row space-x-2'}
                                          data-testid={`${cellSeg.labware.barcode}-${index}-action`}
                                        >
                                          <RemoveButton
                                            type={'button'}
                                            onClick={async () => {
                                              await setValues((prev) => {
                                                let cellSegmentation = [...prev.cellSegmentation];
                                                const proteinPanels = cellSegmentation[index].proteinPanels.filter(
                                                  (_, i) => i !== probeIndex
                                                );
                                                cellSegmentation[index] = {
                                                  ...cellSegmentation[index],
                                                  proteinPanels
                                                };

                                                return {
                                                  ...prev,
                                                  cellSegmentation
                                                };
                                              });
                                            }}
                                          />

                                          <IconButton
                                            dataTestId={'addButton'}
                                            onClick={async () => {
                                              await setValues((prev) => {
                                                let cellSegmentation = [...prev.cellSegmentation];
                                                cellSegmentation[index].proteinPanels.push({
                                                  name: '',
                                                  lot: ''
                                                });
                                                return {
                                                  ...prev,
                                                  cellSegmentation
                                                };
                                              });
                                            }}
                                            className={'focus:outline-hidden'}
                                          >
                                            <AddIcon className="inline-block text-green-500 h-5 w-5 -ml-1 mr-2" />
                                          </IconButton>
                                        </div>
                                      </TableCell>
                                    </tr>
                                  </TableBody>
                                ))}
                            </Table>
                          </div>
                        </div>
                      </Panel>
                    ))}
                </div>
              )}
            </div>
          );
        }}
      </LabwareScanner>
    </motion.div>
  );
};
