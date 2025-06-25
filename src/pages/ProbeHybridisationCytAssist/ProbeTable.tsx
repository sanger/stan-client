import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { slideCostingOptions } from '../../lib/helpers';
import WorkNumberSelect from '../../components/WorkNumberSelect';
import CustomReactSelect from '../../components/forms/CustomReactSelect';
import { selectOptionValues } from '../../components/forms';
import FormikInput from '../../components/forms/Input';
import RemoveButton from '../../components/buttons/RemoveButton';
import IconButton from '../../components/buttons/IconButton';
import AddIcon from '../../components/icons/AddIcon';
import { ProbeHybridisationCytAssistFormValues, ProbePanelInfo } from './ProbeHybridisationCytAssist';

const probeLotDefault = { panel: '', lot: '' };

const ProbeTable: React.FC<ProbePanelInfo> = ({ cytAssistProbes, spikeProbes }: ProbePanelInfo) => {
  const { values, setFieldValue } = useFormikContext<ProbeHybridisationCytAssistFormValues>();
  return (
    <>
      <div className="grid grid-cols-9 w-full gap-1 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 tracking-wide uppercase">
        <span>Barcode</span>
        <span>SGP Number</span>
        <span>Kit Costing</span>
        <span>Reagent LOT</span>
        <span>Custom Probe Panel</span>
        <span>Probe Probe</span>
        <span>Probe LOT</span>
        <span>Probe Costing</span>
        <span></span>
      </div>
      {values.labware.map((probeLw, lwIndex) => (
        <div className="grid grid-cols-9 w-full gap-1 mt-2 " key={probeLw.labware.barcode}>
          <span>{probeLw.labware.barcode}</span>
          <WorkNumberSelect
            name={`labware.${lwIndex}.workNumber`}
            dataTestId={`labware.${lwIndex}.workNumber`}
            onWorkNumberChange={async (workNumber) => {
              await setFieldValue(`labware.${lwIndex}.workNumber`, workNumber);
            }}
            workNumber={values.labware[lwIndex].workNumber}
          />
          <CustomReactSelect
            dataTestId={`labware.${lwIndex}.kitCosting`}
            name={`labware.${lwIndex}.kitCosting`}
            options={selectOptionValues(slideCostingOptions, 'label', 'value')}
            value={probeLw.kitCosting}
            emptyOption={true}
          />
          <div>
            <FormikInput
              label=""
              data-testid={`labware.${lwIndex}.reagentLot`}
              name={`labware.${lwIndex}.reagentLot`}
              className=""
            />
          </div>
          <CustomReactSelect
            label=""
            dataTestId={`labware.${lwIndex}.customPanel`}
            name={`labware.${lwIndex}.customPanel`}
            options={selectOptionValues(spikeProbes, 'name', 'name')}
            isMulti={false}
            emptyOption={true}
            value={probeLw.customPanel}
          />
          <div className="col-span-4">
            {probeLw.probes.length === 0 && (
              <div className="grid grid-cols-4 w-full border gap-x-1 border-gray-200 rounded-md p-2 mt-2">
                <CustomReactSelect
                  dataTestId={`labware.${lwIndex}.probes.0.panel`}
                  label=""
                  name={`labware.${lwIndex}.probes.0.panel`}
                  options={selectOptionValues(cytAssistProbes, 'name', 'name')}
                  isMulti={false}
                  emptyOption={true}
                />
                <div>
                  <FormikInput
                    label=""
                    name={`labware.${lwIndex}.probes.0.lot`}
                    data-testid={`labware.${lwIndex}.probes.0.lot`}
                  />
                </div>
                <CustomReactSelect
                  label=""
                  dataTestId={`labware.${lwIndex}.probes.0.costing`}
                  name={`labware.${lwIndex}.probes.0.costing`}
                  options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                  isMulti={false}
                  emptyOption={true}
                />

                <div
                  className={'flex flex-row space-x-2 justify-end items-end'}
                  data-testid={`labware.${lwIndex}.probes.0.actions`}
                >
                  <FieldArray name={`labware.${lwIndex}.probes`}>
                    {(helpers) => (
                      <IconButton
                        dataTestId={'addButton'}
                        onClick={async () => {
                          helpers.push(probeLotDefault);
                        }}
                        className={'focus:outline-hidden'}
                      >
                        <AddIcon className="inline-block text-green-500 h-5 w-5 -ml-1 mr-2" />
                      </IconButton>
                    )}
                  </FieldArray>
                </div>
              </div>
            )}
            {probeLw.probes.map((probe, probeIndex) => (
              <div
                className="grid grid-cols-4 w-full border gap-x-1 border-gray-200 rounded-md p-2 mt-2"
                key={`probeLw.barcode-${lwIndex}-${probeIndex}`}
              >
                <CustomReactSelect
                  label={''}
                  dataTestId={`labware.${lwIndex}.probes.${probeIndex}.panel`}
                  name={`labware.${lwIndex}.probes.${probeIndex}.panel`}
                  options={selectOptionValues(cytAssistProbes, 'name', 'name')}
                  isMulti={false}
                  value={probe.panel}
                  emptyOption={true}
                />
                <div>
                  <FormikInput
                    label={''}
                    data-testid={`labware.${lwIndex}.probes.${probeIndex}.lot`}
                    name={`labware.${lwIndex}.probes.${probeIndex}.lot`}
                  />
                </div>
                <CustomReactSelect
                  label={''}
                  dataTestId={`labware.${lwIndex}.probes.${probeIndex}.costing`}
                  name={`labware.${lwIndex}.probes.${probeIndex}.costing`}
                  options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                  isMulti={false}
                  value={probe.costing}
                  emptyOption={true}
                />
                <div
                  className={'flex flex-row space-x-2 justify-end items-start'}
                  data-testid={`labware.${lwIndex}.probes.${probeIndex}.actions`}
                >
                  <FieldArray name={`labware.${lwIndex}.probes`}>
                    {(helpers) => (
                      <>
                        {probeLw.probes.length > 1 && (
                          <RemoveButton
                            type={'button'}
                            onClick={() => {
                              helpers.remove(probeIndex);
                            }}
                          />
                        )}
                        <IconButton
                          dataTestId={'addButton'}
                          onClick={() => {
                            helpers.push(probeLotDefault);
                          }}
                          className={'focus:outline-hidden'}
                        >
                          <AddIcon className="inline-block text-green-500 h-5 w-5 -ml-1 mr-2" />
                        </IconButton>
                      </>
                    )}
                  </FieldArray>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};
export default ProbeTable;
