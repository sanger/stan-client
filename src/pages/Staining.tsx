import React, { useState } from 'react';
import { GetStainInfoQuery, GetStainReagentTypesQuery, LabwareFlaggedFieldsFragment } from '../types/sdk';
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

type StainingPageParam = {
  stainingInfo: GetStainInfoQuery;
  reagentTypes: GetStainReagentTypesQuery;
};

export default function Staining() {
  const { stainingInfo, reagentTypes } = useLoaderData() as StainingPageParam;
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
                options={selectOptionValues(stainingInfo.stainTypes, 'name', 'name')}
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
              comments={reagentTypes.stainReagentTypes}
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
