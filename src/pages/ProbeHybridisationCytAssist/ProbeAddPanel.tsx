import { useFormikContext } from 'formik';
import React from 'react';
import { slideCostingOptions } from '../../lib/helpers';
import { ProbeHybridisationCytAssistFormValues, ProbePanelInfo } from './ProbeHybridisationCytAssist';
import CustomReactSelect from '../../components/forms/CustomReactSelect';
import { selectOptionValues } from '../../components/forms';
import FormikInput from '../../components/forms/Input';
import WhiteButton from '../../components/buttons/WhiteButton';
import AddIcon from '../../components/icons/AddIcon';

const ProbeAddPanel = ({ cytAssistProbes }: ProbePanelInfo) => {
  const { values, setValues, setTouched, errors } = useFormikContext<ProbeHybridisationCytAssistFormValues>();
  return (
    <div className={'border-1 border-gray-300 shadow-md justify-end p-2 basis-3/4'}>
      <div className={'grid grid-cols-3 gap-x-3 p-4 gap-y-5'} data-testid={'probe-all-table'}>
        <CustomReactSelect
          dataTestId={'probe-name'}
          emptyOption={true}
          label="Probe Panel"
          name={'probePanelAll.panel'}
          options={selectOptionValues(cytAssistProbes, 'name', 'name')}
        />
        <div>
          <FormikInput label={'Probe LOT'} data-testid={'probe-lot'} name={'probePanelAll.lot'} />
        </div>
        <CustomReactSelect
          dataTestId={'probe-costing'}
          label="Probe Costing"
          name={'probePanelAll.costing'}
          emptyOption={true}
          options={selectOptionValues(slideCostingOptions, 'label', 'value')}
        />
      </div>

      <div className="sm:flex sm:flex-row mt-2 items-center justify-end">
        <WhiteButton
          type="button"
          disabled={
            values.probePanelAll.panel === '' ||
            values.probePanelAll.lot === '' ||
            values.probePanelAll.costing === undefined ||
            errors.probePanelAll !== undefined
          }
          onClick={async () => {
            await setValues((prev) => {
              const labware = prev.labware.map((lw) => {
                return { ...lw, probes: [...lw.probes, values.probePanelAll!] };
              });
              return { ...prev, labware };
            });

            await setTouched({
              labware: values.labware.map((lw) => ({
                probes: lw.probes.map(() => ({
                  panel: true,
                  lot: true,
                  costing: true
                }))
              }))
            });
          }}
        >
          <AddIcon className="inline-block text-green-500 h-4 w-4 mt-1 mr-2" />
          Add to all
        </WhiteButton>
      </div>
    </div>
  );
};

export default ProbeAddPanel;
