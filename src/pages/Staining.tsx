import React, { useState } from 'react';
import { GetStainInfoQuery, LabwareFlaggedFieldsFragment } from '../types/sdk';
import AppShell from '../components/AppShell';
import StainForm from './staining/StainForm';
import { selectOptionValues } from '../components/forms';
import Label from '../components/forms/Label';
import MutedText from '../components/MutedText';
import ComplexStainForm from './staining/ComplexStainForm';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { useLoaderData } from 'react-router-dom';

/**
 * By default, any new stain types will use the "simple" form. Any that need to use the
 * complex form will need to be added to the set below.
 */
const complexStains = new Set(['RNAscope', 'IHC', 'RNAscope & IHC']);
const isComplexStain = (stainName: string) => complexStains.has(stainName);

export default function Staining() {
  const stainingInfo = useLoaderData() as GetStainInfoQuery;
  const [stainType, setStainType] = useState<string>('');
  const [labwares, setLabwares] = useState<LabwareFlaggedFieldsFragment[]>([]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Staining</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto max-w-screen-xl">
          <div className="md:w-1/2">
            <Label name={'Stain Type'}>
              <CustomReactSelect
                emptyOption
                dataTestId={'stainType'}
                handleChange={(e) => setStainType((e as OptionType).label)}
                options={selectOptionValues(
                  [
                    ...stainingInfo.stainTypes,
                    {
                      __typename: 'StainType',
                      measurementTypes: [],
                      name: 'RNAscope & IHC'
                    }
                  ],
                  'name',
                  'name'
                )}
              />
            </Label>
          </div>

          {!stainType && <MutedText>Choose a stain type to get started.</MutedText>}

          {stainType && !isComplexStain(stainType) && (
            <StainForm
              key={stainType}
              stainType={stainType}
              stainingInfo={stainingInfo}
              initialLabware={labwares}
              onLabwareChange={setLabwares}
            />
          )}

          {stainType && isComplexStain(stainType) && (
            <ComplexStainForm stainType={stainType} initialLabware={labwares} onLabwareChange={setLabwares} />
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
