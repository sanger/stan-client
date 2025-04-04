import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import WorkNumberSelect from '../WorkNumberSelect';
import { selectOptionValues } from '../forms';
import FormikInput from '../forms/Input';
import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { ProbeHybridisationXeniumFormValues, probeLotDefault } from '../../pages/ProbeHybridisationXenium';
import { ProbePanelFieldsFragment } from '../../types/sdk';
import RemoveButton from '../buttons/RemoveButton';
import IconButton from '../buttons/IconButton';
import AddIcon from '../icons/AddIcon';
import CustomReactSelect from '../forms/CustomReactSelect';
import { slideCostingOptions } from '../../lib/helpers';

type ProbeTableProps = {
  probePanels: ProbePanelFieldsFragment[];
};

const ProbeTable: React.FC<ProbeTableProps> = ({ probePanels }) => {
  const { values, setFieldValue } = useFormikContext<ProbeHybridisationXeniumFormValues>();
  return (
    <Table data-testid={'probeTable'}>
      <TableHead>
        <tr>
          <TableHeader>Barcode</TableHeader>
          <TableHeader>SGP Number</TableHeader>
          <TableHeader>Kit Costing</TableHeader>
          <TableHeader>Sample Prep Reagent Lot</TableHeader>
          <TableHeader>Probe</TableHeader>
        </tr>
      </TableHead>
      <TableBody>
        {values.labware.map((probeLw, lwIndex) => (
          <tr key={probeLw.labware.barcode}>
            <TableCell>{probeLw.labware.barcode}</TableCell>
            <TableCell>
              <WorkNumberSelect
                name={`labware.${lwIndex}.workNumber`}
                dataTestId={`${probeLw.labware.barcode}-workNumber`}
                onWorkNumberChange={(workNumber) => {
                  setFieldValue(`labware.${lwIndex}.workNumber`, workNumber);
                }}
                workNumber={values.labware[lwIndex].workNumber}
              />
            </TableCell>
            <TableCell>
              <CustomReactSelect
                dataTestId={`${probeLw.labware.barcode}-kitCosting`}
                name={`labware.${lwIndex}.kitCosting`}
                options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                value={probeLw.kitCosting}
                emptyOption={true}
              />
            </TableCell>
            <TableCell>
              <FormikInput
                label=""
                data-testid={`labware.${lwIndex}.samplePrepReagentLot`}
                name={`labware.${lwIndex}.samplePrepReagentLot`}
              />
            </TableCell>
            <TableCell>
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Probe Panel</TableHeader>
                    <TableHeader>Lot</TableHeader>
                    <TableHeader>Plex</TableHeader>
                    <TableHeader>Probe Costing</TableHeader>
                    <TableHeader></TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {probeLw.probes.map((probe, probeIndex) => (
                    <tr key={`probeLw.barcode-${lwIndex}-${probeIndex}`}>
                      <TableCell>
                        <CustomReactSelect
                          label={''}
                          dataTestId={`${probeLw.labware.barcode}-${probeIndex}-name`}
                          name={`labware.${lwIndex}.probes.${probeIndex}.name`}
                          options={selectOptionValues(probePanels, 'name', 'name')}
                          isMulti={false}
                          value={probe.name}
                          emptyOption={true}
                        />
                      </TableCell>
                      <TableCell>
                        <FormikInput
                          label={''}
                          data-testid={`${probeLw.labware.barcode}-${probeIndex}-lot`}
                          name={`labware.${lwIndex}.probes.${probeIndex}.lot`}
                        />
                      </TableCell>
                      <TableCell>
                        <FormikInput
                          label={''}
                          name={`labware.${lwIndex}.probes.${probeIndex}.plex`}
                          type={'number'}
                          data-testid={`${probeLw.labware.barcode}-${probeIndex}-plex`}
                          min={0}
                          value={probe.plex > 0 ? probe.plex : ''}
                        />
                      </TableCell>
                      <TableCell>
                        <CustomReactSelect
                          label={''}
                          dataTestId={`${probeLw.labware.barcode}-${probeIndex}-costing`}
                          name={`labware.${lwIndex}.probes.${probeIndex}.costing`}
                          options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                          isMulti={false}
                          value={probe.costing}
                          emptyOption={true}
                        />
                      </TableCell>
                      <TableCell>
                        <div
                          className={'flex flex-row space-x-2'}
                          data-testid={`${probeLw.labware.barcode}-${probeIndex}-action`}
                        >
                          {probeIndex === 0 && probeLw.probes.length === 1 ? (
                            <></>
                          ) : (
                            <FieldArray name={`labware.${lwIndex}.probes`}>
                              {(helpers) => (
                                <RemoveButton
                                  type={'button'}
                                  onClick={() => {
                                    helpers.remove(probeIndex);
                                  }}
                                />
                              )}
                            </FieldArray>
                          )}
                          {probeIndex === probeLw.probes.length - 1 && (
                            <FieldArray name={`labware.${lwIndex}.probes`}>
                              {(helpers) => (
                                <IconButton
                                  dataTestId={'addButton'}
                                  onClick={() => {
                                    helpers.push(probeLotDefault);
                                  }}
                                  className={'focus:outline-hidden'}
                                >
                                  <AddIcon className="inline-block text-green-500 h-5 w-5 -ml-1 mr-2" />
                                </IconButton>
                              )}
                            </FieldArray>
                          )}
                        </div>
                      </TableCell>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </TableCell>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
};
export default ProbeTable;
