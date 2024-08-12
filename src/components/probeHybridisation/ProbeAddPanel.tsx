import { selectOptionValues } from '../forms';
import FormikInput from '../forms/Input';
import { useFormikContext } from 'formik';
import WhiteButton from '../buttons/WhiteButton';
import { ProbeLot, ProbePanelFieldsFragment, SlideCosting } from '../../types/sdk';
import AddIcon from '../icons/AddIcon';
import React from 'react';
import { lotRegx, ProbeHybridisationXeniumFormValues } from '../../pages/ProbeHybridisationXenium';
import MutedText from '../MutedText';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { objectKeys } from '../../lib/helpers';

type ProbeLotAddPanelProps = {
  probePanels: ProbePanelFieldsFragment[];
};

const isAnEmptyProbeRow = (probeRow: Array<ProbeLot>) => {
  return (
    probeRow.length === 1 &&
    probeRow.every(
      (probe) =>
        probe.name === '' &&
        probe.lot === '' &&
        probe.plex === 0 &&
        ![SlideCosting.Sgp, SlideCosting.Faculty].includes(probe.costing)
    )
  );
};

const ProbeAddPanel = ({ probePanels }: ProbeLotAddPanelProps) => {
  const [probeName, setProbeName] = React.useState('');
  const [probeLot, setProbeLot] = React.useState('');
  const [probePlex, setProbePlex] = React.useState('');
  const [probeCosting, setProbeCosting] = React.useState('');
  const [probeLotError, setProbeLotError] = React.useState({ name: '', lot: '', plex: '', costing: '' });
  const isTouched = React.useRef(false);

  const { values, setValues, setTouched } = useFormikContext<ProbeHybridisationXeniumFormValues>();

  const validateProbeName = React.useCallback(
    (probeName: string) => {
      isTouched.current = true;
      if (!probeName) {
        setProbeLotError((prev) => ({ ...prev, name: 'Probe panel is required' }));
        return;
      }
      setProbeLotError((prev) => ({ ...prev, name: '' }));
    },
    [setProbeLotError]
  );

  const validateProbeLot = React.useCallback(
    (probeLot: string) => {
      if (!probeLot) {
        setProbeLotError((prev) => ({ ...prev, lot: 'Lot number is required' }));
        return;
      }
      if (!lotRegx.test(probeLot)) {
        setProbeLotError((prev) => ({
          ...prev,
          lot: 'Lot number should be a string of maximum length 25 of capital letters, numbers and underscores'
        }));
        return;
      }
      setProbeLotError((prev) => ({ ...prev, lot: '' }));
    },
    [setProbeLotError]
  );

  const validateProbePlex = React.useCallback(
    (probePlex: string) => {
      if (Number(probePlex) <= 0) {
        setProbeLotError((prev) => ({ ...prev, plex: 'Plex is required and should be a positive integer.' }));
        return;
      }
      setProbeLotError((prev) => ({ ...prev, plex: '' }));
    },
    [setProbeLotError]
  );

  const validateProbeCosting = React.useCallback(
    (probeCosting: string) => {
      isTouched.current = true;
      if (!probeCosting) {
        setProbeLotError((prev) => ({ ...prev, costing: 'Probe costing is required.' }));
        return;
      }
      setProbeLotError((prev) => ({ ...prev, costing: '' }));
    },
    [setProbeLotError]
  );

  React.useEffect(() => {
    if (!isTouched.current) return;
    validateProbeName(probeName);
  }, [probeName, validateProbeName]);

  React.useEffect(() => {
    if (!isTouched.current) return;
    validateProbeLot(probeLot);
  }, [probeLot, validateProbeLot]);

  React.useEffect(() => {
    if (!isTouched.current) return;
    validateProbePlex(probePlex);
  }, [probePlex, validateProbePlex]);

  React.useEffect(() => {
    if (!isTouched.current) return;
    validateProbeCosting(probeCosting);
  }, [probeCosting, validateProbeCosting]);

  const isAddToAllDisabled = () => {
    return (
      !isTouched.current ||
      probeLotError.lot.length > 0 ||
      probeLotError.name.length > 0 ||
      probeLotError.plex.length > 0 ||
      probeLotError.costing.length > 0 ||
      !(Number(probePlex) > 0 && probeName.length > 0 && probeLot.length > 0 && probeCosting.length > 0)
    );
  };

  return (
    <div className={'border-1 border-gray-300 shadow justify-end p-2 basis-3/4'}>
      <div className={'grid grid-cols-4 gap-x-3 p-4'} data-testid={'probe-all-table'}>
        <label>Probe Panel</label>
        <label>Lot</label>
        <label>Plex</label>
        <label>Probe Costing</label>
        <CustomReactSelect
          dataTestId={'probe-name'}
          emptyOption={true}
          value={probeName}
          label={''}
          isMulti={false}
          handleChange={(val) => {
            isTouched.current = true;
            setProbeName((val as OptionType).value);
          }}
          options={selectOptionValues(probePanels, 'name', 'name')}
          onBlur={() => validateProbeName(probeName)}
        />
        <FormikInput
          label={''}
          data-testid={'probe-lot'}
          name={'lot'}
          value={probeLot}
          onBlur={() => validateProbeLot(probeLot)}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            isTouched.current = true;
            setProbeLot(e.target.value);
          }}
        />
        <FormikInput
          label={''}
          data-testid={'probe-plex'}
          name={'plex'}
          type={'number'}
          onBlur={() => validateProbeLot(probeLot)}
          min={0}
          value={Number(probePlex) > 0 ? probePlex : ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            isTouched.current = true;
            setProbePlex(e.target.value);
          }}
        />
        <CustomReactSelect
          isMulti={false}
          label={''}
          name={'costing'}
          value={probeCosting}
          handleChange={(val) => {
            isTouched.current = true;
            setProbeCosting((val as OptionType).value);
          }}
          onBlur={() => validateProbeCosting(probeCosting)}
          emptyOption={true}
          dataTestId="probe-costing"
          options={objectKeys(SlideCosting).map((key) => {
            return {
              label: SlideCosting[key],
              value: SlideCosting[key]
            };
          })}
        />
        {probeLotError.name ? <MutedText className={'text-blue-400'}>{probeLotError.name}</MutedText> : <div />}
        {probeLotError.lot ? <MutedText className={'text-blue-400'}>{probeLotError.lot}</MutedText> : <div />}
        {probeLotError.plex ? <MutedText className={'text-blue-400'}>{probeLotError.plex}</MutedText> : <div />}
        {probeLotError.costing ? <MutedText className={'text-blue-400'}>{probeLotError.costing}</MutedText> : <div />}
      </div>

      <div className="sm:flex sm:flex-row mt-2 items-center justify-end">
        <WhiteButton
          type="button"
          disabled={isAddToAllDisabled()}
          onClick={async (event) => {
            await setValues((prev) => {
              const labware = prev.labware.map((lw) => {
                const newProbes = isAnEmptyProbeRow(lw.probes)
                  ? lw.probes.map(() => ({
                      name: probeName,
                      lot: probeLot,
                      plex: Number(probePlex),
                      costing: probeCosting === 'SGP' ? SlideCosting.Sgp : SlideCosting.Faculty
                    }))
                  : [
                      ...lw.probes,
                      {
                        name: probeName,
                        lot: probeLot,
                        plex: Number(probePlex),
                        costing: probeCosting === 'SGP' ? SlideCosting.Sgp : SlideCosting.Faculty
                      }
                    ];
                return {
                  ...lw,
                  probes: newProbes
                };
              });
              return { ...prev, labware };
            });
            await setTouched({
              labware: Array.from({ length: values.labware.length + 1 }, () => ({
                probes: Array.from({ length: values.labware.length + 1 }, () => ({
                  name: true,
                  lot: true,
                  plex: true,
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
