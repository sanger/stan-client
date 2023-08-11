import FormikSelect from '../forms/Select';
import { optionValues } from '../forms';
import FormikInput from '../forms/Input';
import { FieldArray, useFormikContext } from 'formik';
import WhiteButton from '../buttons/WhiteButton';
import { ProbeOperationLabware, ProbePanelFieldsFragment } from '../../types/sdk';
import AddIcon from '../icons/AddIcon';
import React from 'react';
import { lotRegx, ProbeHybridisationXeniumFormValues } from '../../pages/ProbeHybridisationXenium';
import MutedText from '../MutedText';

type ProbeLotAddPanelProps = {
  probePanels: ProbePanelFieldsFragment[];
};

const ProbeAddPanel = ({ probePanels }: ProbeLotAddPanelProps) => {
  const [probeName, setProbeName] = React.useState('');
  const [probeLot, setProbeLot] = React.useState('');
  const [probePlex, setProbePlex] = React.useState('');
  const [probeLotError, setProbeLotError] = React.useState({ name: '', lot: '', plex: '' });
  const isTouched = React.useRef(false);

  const { values, setFieldValue } = useFormikContext<ProbeHybridisationXeniumFormValues>();

  const validateProbeName = React.useCallback(
    (probeName: string) => {
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
          lot: 'LOT number should be a string of maximum length 20 of capital letters, numbers and underscores.'
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
        setProbeLotError((prev) => ({ ...prev, plex: 'Plex number required and should be a positive integer.' }));
        return;
      }
      setProbeLotError((prev) => ({ ...prev, plex: '' }));
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

  return (
    <div className={'border-1 border-gray-300 shadow justify-end p-2'}>
      <div className={'grid grid-cols-3 gap-x-3 p-4'} data-testid={'probe-all-table'}>
        <label>Probe Panel</label>
        <label>Lot</label>
        <label>Plex</label>
        <FormikSelect
          data-testid={'probeAll-name'}
          emptyOption={true}
          value={probeName}
          name={'panel'}
          label={''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            isTouched.current = true;
            setProbeName(e.target.value);
          }}
          onBlur={() => validateProbeLot(probeLot)}
        >
          {optionValues(probePanels, 'name', 'name')}
        </FormikSelect>
        <FormikInput
          label={''}
          data-testid={'probeAll-lot'}
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
          data-testid={'probeAll-plex'}
          name={'plex'}
          type={'number'}
          onBlur={() => validateProbeLot(probeLot)}
          min={0}
          value={Number(probePlex) > 0 ? probePlex : ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            isTouched.current = true;
            debugger;
            setProbePlex(e.target.value);
          }}
        />
        {probeLotError.name ? <MutedText className={'text-blue-400'}>{probeLotError.name}</MutedText> : <div />}
        {probeLotError.lot ? <MutedText className={'text-blue-400'}>{probeLotError.lot}</MutedText> : <div />}
        {probeLotError.plex ? <MutedText className={'text-blue-400'}>{probeLotError.plex}</MutedText> : <div />}
      </div>

      <div className="sm:flex sm:flex-row mt-2 items-center justify-end">
        <FieldArray name={'labware'}>
          {(helpers) => (
            <WhiteButton
              disabled={probeLotError.lot.length > 0 || probeLotError.name.length > 0 || probeLotError.plex.length > 0}
              onClick={() => {
                values.labware.forEach((lw, index) => {
                  const updatedLabware: ProbeOperationLabware = {
                    ...lw,
                    probes: [...lw.probes, { name: probeName, lot: probeLot, plex: Number(probePlex) }]
                  };
                  helpers.replace(index, { ...updatedLabware });
                });
              }}
            >
              <AddIcon className="inline-block text-green-500 h-4 w-4 mt-1 mr-2" />
              Add to all
            </WhiteButton>
          )}
        </FieldArray>
      </div>
    </div>
  );
};

export default ProbeAddPanel;
