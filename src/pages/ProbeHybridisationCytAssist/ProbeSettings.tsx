import React, { useRef } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { slideCostingOptions } from '../../lib/helpers';
import WorkNumberSelect from '../../components/WorkNumberSelect';
import CustomReactSelect from '../../components/forms/CustomReactSelect';
import { selectOptionValues } from '../../components/forms';
import FormikInput from '../../components/forms/Input';
import { ProbeHybridisationCytAssistFormValues, ProbePanelInfo } from './ProbeHybridisationCytAssist';
import Labware, { LabwareImperativeRef } from '../../components/labware/Labware';
import IconButton from '../../components/buttons/IconButton';
import AddIcon from '../../components/icons/AddIcon';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../../components/Table';
import RemoveButton from '../../components/buttons/RemoveButton';

const probeLotDefault = { panel: '', lot: '' };

const ProbeSettings: React.FC<ProbePanelInfo> = ({ probesOptions, probeLabware, lwIndex }: ProbePanelInfo) => {
  const { values, setFieldValue } = useFormikContext<ProbeHybridisationCytAssistFormValues>();
  const labwareRef = useRef<LabwareImperativeRef>();

  return (
    <>
      <div className="grid grid-cols-5 w-full gap-x-2 ">
        <div data-testid={probeLabware.labware.barcode}>
          <Labware
            labware={probeLabware.labware}
            selectable={'non_empty'}
            selectionMode={'multi'}
            onSelect={async (selected) => {
              await setFieldValue(`labware.${lwIndex}.addresses`, selected.join(','));
            }}
            labwareRefCallback={(el: LabwareImperativeRef) => {
              labwareRef.current = el;
            }}
            highlightedSlots={new Set(values.labware[lwIndex].addresses?.split(',').map((addr) => addr.trim()) || [])}
          />
        </div>
        <div className="col-span-4">
          <div className="grid grid-cols-3 w-full gap-4 mb-4 ">
            <WorkNumberSelect
              label="SGP Number"
              name={`labware.${lwIndex}.workNumber`}
              dataTestId={`labware.${lwIndex}.workNumber`}
              onWorkNumberChange={async (workNumber) => {
                await setFieldValue(`labware.${lwIndex}.workNumber`, workNumber);
              }}
              workNumber={values.labware[lwIndex].workNumber}
            />
            <CustomReactSelect
              label="Custom Probe Panel"
              dataTestId={`labware.${lwIndex}.customPanel`}
              name={`labware.${lwIndex}.customPanel`}
              options={selectOptionValues(probesOptions.spikeProbes, 'name', 'name')}
              isMulti={false}
              emptyOption={true}
              value={probeLabware.customPanel}
            />
            <div>
              <FormikInput
                label="Section Addresses"
                name={`labware.${lwIndex}.addresses`}
                data-testid={`labware.${lwIndex}.addresses`}
                info={<AddressesFieldInfo />}
              />
            </div>
          </div>

          <Table data-testid={`probe-table-${lwIndex}`} isFixed={true}>
            <TableHead>
              <tr>
                <TableHeader>Probe</TableHeader>
                <TableHeader>Probe LOT</TableHeader>
                <TableHeader>Probe Costing</TableHeader>
                <TableHeader />
              </tr>
            </TableHead>
            <TableBody>
              {probeLabware.probes!.map((probe, probeIndex) => (
                <tr key={`probeLw.barcode-${lwIndex}-${probeIndex}`}>
                  <TableCell>
                    <CustomReactSelect
                      label={''}
                      dataTestId={`labware.${lwIndex}.probes.${probeIndex}.panel`}
                      name={`labware.${lwIndex}.probes.${probeIndex}.panel`}
                      options={selectOptionValues(probesOptions.cytAssistProbes, 'name', 'name')}
                      isMulti={false}
                      value={probe.panel}
                      emptyOption={true}
                    />
                  </TableCell>
                  <TableCell>
                    <FormikInput
                      label={''}
                      data-testid={`labware.${lwIndex}.probes.${probeIndex}.lot`}
                      name={`labware.${lwIndex}.probes.${probeIndex}.lot`}
                    />
                  </TableCell>
                  <TableCell>
                    <CustomReactSelect
                      label={''}
                      dataTestId={`labware.${lwIndex}.probes.${probeIndex}.costing`}
                      name={`labware.${lwIndex}.probes.${probeIndex}.costing`}
                      options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                      isMulti={false}
                      value={probe.costing}
                      emptyOption={true}
                    />
                  </TableCell>
                  <TableCell
                    className={'flex flex-row space-x-2 justify-end items-start'}
                    data-testid={`labware.${lwIndex}.probes.${probeIndex}.actions`}
                  >
                    <FieldArray name={`labware.${lwIndex}.probes`}>
                      {(helpers) => (
                        <>
                          {probeLabware.probes.length > 1 && (
                            <RemoveButton
                              type={'button'}
                              onClick={async () => {
                                helpers.remove(probeIndex);
                              }}
                            />
                          )}
                          <IconButton
                            dataTestId={'addButton'}
                            onClick={async () => {
                              helpers.push(probeLotDefault);
                            }}
                            className={'focus:outline-hidden'}
                            type={'button'}
                          >
                            <AddIcon className="inline-block text-green-500 h-5 w-5 -ml-1 mr-2" />
                          </IconButton>
                        </>
                      )}
                    </FieldArray>
                  </TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

const AddressesFieldInfo = () => {
  return (
    <div className={'flex flex-col whitespace-pre-wrap space-x-2 space-y-2'}>
      <p>
        Addresses are used to identify the labware slots where the probes will be applied. You can either select labware
        slots or enter them manually.
      </p>
      <p>
        <strong>Example:</strong> A1, B2, C3
      </p>
      <p>Labware slot selection supports multi-select:</p>
      <p>
        – Hold <kbd>Shift</kbd> to select consecutive slots
      </p>
      <p>
        – Hold <kbd>Ctrl</kbd> (<kbd>Cmd</kbd> on Mac) to select non-consecutive slots
      </p>
      <p>
        <strong>Note</strong>: There is no front-end validation when manually entering invalid slots (e.g., slots that
        do not exist within the labware or are empty).
      </p>
    </div>
  );
};
export default ProbeSettings;
