import { LabwareFieldsFragment } from '../types/sdk';
import Pill from './Pill';
import { isLabwareUsable } from '../lib/helpers/labwareHelper';
import React from 'react';

type LabwareStatePillProps = {
  labware: Pick<LabwareFieldsFragment, 'state'>;
};

/**
 * Component for displaying the state of a labware in a coloured pill
 */
export function LabwareStatePill({ labware }: LabwareStatePillProps) {
  return <Pill color={isLabwareUsable(labware) ? 'blue' : 'pink'}>{labware.state.toUpperCase()}</Pill>;
}
