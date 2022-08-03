import React from 'react';
import { Meta } from '@storybook/react';

import EntityManager from './EntityManager';

import { stanCore } from '../../lib/sdk';
import destructionReasonRepository from '../../mocks/repositories/destructionReasonRepository';

const meta: Meta = {
  title: 'EntityManager',
  component: EntityManager
};
export default meta;

export const DestructionReasonsManager = () => {
  return (
    <EntityManager
      initialEntities={destructionReasonRepository.findAll()}
      displayKeyColumnName={'text'}
      valueColumnName={'enabled'}
      onChangeValue={(entity, value) => {
        const enabled = typeof value === 'boolean' ? value : false;
        return stanCore
          .SetDestructionReasonEnabled({ text: entity.text, enabled })
          .then((res) => res.setDestructionReasonEnabled);
      }}
      onCreate={(text) => stanCore.AddDestructionReason({ text }).then((res) => res.addDestructionReason)}
      valueFieldComponentInfo={{
        type: 'CHECKBOX'
      }}
    />
  );
};
