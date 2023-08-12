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
          <TableHeader>Probe</TableHeader>
          <TableHeader />
        </tr>
      </TableHead>
      <TableBody>
        {values.labware.map((probeLw, lwIndex) => (
          <tr key={probeLw.barcode}>
            <TableCell>{probeLw.barcode}</TableCell>
            <TableCell>
              <WorkNumberSelect
                name={`labware.${lwIndex}.workNumber`}
                dataTestId={`${probeLw.barcode}-workNumber`}
                onWorkNumberChange={(workNumber) => {
                  setFieldValue(`labware.${lwIndex}.workNumber`, workNumber);
                }}
                workNumber={values.labware[lwIndex].workNumber}
              />
            </TableCell>
            <TableCell>
              <TableHead>
                <tr>
                  <TableHeader>Probe Panel</TableHeader>
                  <TableHeader>Lot</TableHeader>
                  <TableHeader>Plex</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {probeLw.probes.map((probe, probeIndex) => (
                  <tr key={`probeLw.barcode-${lwIndex}-${probeIndex}`}>
                    <TableCell>
                      <CustomReactSelect
                        label={''}
                        dataTestId={`${probeLw.barcode}-${probeIndex}-name`}
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
                        data-testid={`${probeLw.barcode}-${probeIndex}-lot`}
                        name={`labware.${lwIndex}.probes.${probeIndex}.lot`}
                      />
                    </TableCell>
                    <TableCell>
                      <FormikInput
                        label={''}
                        name={`labware.${lwIndex}.probes.${probeIndex}.plex`}
                        type={'number'}
                        data-testid={`${probeLw.barcode}-${probeIndex}-plex`}
                        min={0}
                        value={probe.plex > 0 ? probe.plex : ''}
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className={'flex flex-row space-x-2'}
                        data-testid={`${probeLw.barcode}-${probeIndex}-action`}
                      >
                        {probeIndex === 0 && probeLw.probes.length === 1 ? (
                          <></>
                        ) : (
                          <FieldArray name={`labware.${lwIndex}.probes`}>
                            {(helpers) => (
                              <RemoveButton
                                type={'button'}
                                onClick={() => {
                                  //probeLabware.probes.splice(row.index, 1);
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
                                className={'focus:outline-none'}
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
            </TableCell>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
};
export default ProbeTable;
