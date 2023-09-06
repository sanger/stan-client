import React, { useCallback, useEffect, useRef, useState } from 'react';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import { Input } from '../forms/Input';
import BlueButton from '../buttons/BlueButton';
import { useMachine } from '@xstate/react';
import Success from '../notifications/Success';
import { capitalize } from 'lodash';
import WhiteButton from '../buttons/WhiteButton';
import PinkButton from '../buttons/PinkButton';
import LoadingSpinner from '../icons/LoadingSpinner';
import { SelectEntityRow } from './SelectEntityRow';
import { BooleanEntityRow } from './BooleanEntityRow';
import { createEntityManagerMachine } from './entityManager.machine';
import { alphaNumericSortDefault } from '../../types/stan';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { ReleaseRecipient } from '../../types/sdk';
import Warning from '../notifications/Warning';

export type EntityValueType = boolean | string | number;

/**Component type to display in value field**/
type ValueFieldComponentInfo = {
  type: 'CHECKBOX' | 'SELECT';
  valueOptions?: string[];
};

type ExtraEntityColumn<E> = {
  label: string;
  value: string;
  onChange(value: string, extraValue?: string): Promise<E>;
};

type EntityManagerProps<E> = {
  /**
   * The initial entities to display in the table
   */
  initialEntities: Array<E>;

  /**
   * Which property of the entity should be used to display its value as key
   */
  displayKeyColumnName: keyof E;

  /**
   * This can be used to display a name (on table column and add button) different from displayColumnName (which is a field name in graphql schema).
   * One use case is to accommodate changes in field names in future (like HMDMC to HuMFre)
   * because schema fields cannot be changed as it can bring major impact on db
   */
  alternateKeyColumnName?: string;

  /**
   * Which property of the entity should be used to display as value
   */
  valueColumnName: keyof E;

  /***
   * How to display in Value field
   */
  valueFieldComponentInfo: ValueFieldComponentInfo;

  /**
   * Callback when a new entity is to be created
   * @param value the value of the new entity
   */
  onCreate(value: string, extraValue?: string): Promise<E>;

  /**
   * Callback when value changes
   */
  onChangeValue(entity: E, value: EntityValueType): Promise<E>;

  /**
   * Display key field as a dropdown
   */
  displayKeyFieldAsDropDown?: boolean;

  /**
   * Extra property of the entity to display in the table
   */
  extraDisplayColumnName?: ExtraEntityColumn<E>;
};

type BasicReleaseRecipient = {
  userFullName: string;
  username: string;
  enabled: boolean;
};

export const convertToBasicReleaseRecipient = (
  recipients: ReleaseRecipient[] | ReleaseRecipient
): BasicReleaseRecipient[] => {
  if (!Array.isArray(recipients)) {
    recipients = [recipients];
  }
  return recipients.map(({ userFullName, username, enabled }) => ({
    userFullName: userFullName || '',
    username,
    enabled
  }));
};
export default function EntityManager<E extends Record<string, EntityValueType>>({
  initialEntities,
  displayKeyColumnName,
  alternateKeyColumnName,
  valueColumnName,
  valueFieldComponentInfo,
  onCreate,
  onChangeValue,
  displayKeyFieldAsDropDown = false,
  extraDisplayColumnName = undefined
}: EntityManagerProps<E>) {
  const entityManagerMachine = React.useMemo(() => {
    return createEntityManagerMachine<E>(initialEntities, displayKeyColumnName, valueColumnName).withConfig({
      services: {
        createEntity: (ctx, e) => {
          if (e.type !== 'CREATE_NEW_ENTITY') return Promise.reject();
          return onCreate(e.value, e.extraValue);
        },
        valueChanged: (context, e) => {
          if (e.type !== 'VALUE_CHANGE') return Promise.reject();
          return onChangeValue(e.entity, e.value);
        },
        updateExtraProperty: (context, e) => {
          if (e.type !== 'EXTRA_PROPERTY_UPDATE_VALUE' || !extraDisplayColumnName) return Promise.reject();
          return extraDisplayColumnName.onChange(e.value, e.extraValue);
        }
      }
    });
  }, [initialEntities, displayKeyColumnName, valueColumnName, onChangeValue, onCreate, extraDisplayColumnName]);

  const [current, send] = useMachine(entityManagerMachine);

  /**
   * The value of the input used for creating new entities
   */
  const [draftValue, setDraftValue] = useState('');

  const { entities, successMessage, error, selectedEntity } = current.context;

  const isLoading = current.matches('loading');
  const isDrafting = current.matches('draftCreation');
  const isCreatingEntity = current.matches({ loading: 'creatingEntity' });
  const showDraft = isDrafting || isCreatingEntity;

  const orderedEntities = React.useMemo(() => {
    return [...entities].sort((a: E, b: E) =>
      alphaNumericSortDefault(String(a[displayKeyColumnName]), String(b[displayKeyColumnName]))
    );
  }, [entities, displayKeyColumnName]);

  /**
   * The ref to the input element used for creating new entities.
   * Will receive focus when it appears on screen.
   */
  const inputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (current.matches('draftCreation')) {
      inputRef.current?.select();
    }
  }, [current]);

  /**
   * Callback handler for clicking the "Save" button
   */
  const handleOnSave = useCallback(() => {
    const value = draftValue.trim();
    if (value === '') {
      return;
    }
    let extraValue: string | undefined;
    if (extraDisplayColumnName) {
      extraValue = extraInputRef.current?.value.trim();
    }
    send({ type: 'CREATE_NEW_ENTITY', value, extraValue });
    setDraftValue('');
  }, [draftValue, setDraftValue, send, extraDisplayColumnName]);

  /**
   * Callback handler for when an EntityRow changes (i.e. enabled property is toggled)
   */
  const handleOnRowChange = useCallback(
    (entity: E | undefined, value: EntityValueType) => {
      if (!entity) return;
      send({ type: 'VALUE_CHANGE', entity, value });
    },
    [send]
  );

  const handleEntitySelection = useCallback(
    (value: OptionType | OptionType[]) => {
      const selectedValue = value as OptionType;
      send({
        type: 'SELECT_ENTITY',
        entity:
          selectedValue.value.length > 0
            ? orderedEntities.find((entity) => entity[displayKeyColumnName] === selectedValue.value)
            : undefined
      });
    },
    [send, displayKeyColumnName, orderedEntities]
  );

  /**
   * Callback handler for the draft input
   */
  const handleOnInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setDraftValue(e.target.value);

  /**
   * Callback handler for when the draft is discarded
   */
  const handleOnCancel = () => send({ type: 'DISCARD_DRAFT' });

  const handleExtraValueUpdate = useCallback(
    (keyValue: string, extraValue: string) => {
      send({
        type: 'EXTRA_PROPERTY_UPDATE_VALUE',
        value: keyValue,
        extraValue: extraValue
      });
    },
    [send]
  );

  const handleOnChangeForExtraDisplayColumn = useCallback(
    (entity: E, extraValue: string) => {
      if (!extraDisplayColumnName) return;
      send({
        type: 'EXTRA_PROPERTY_DRAFT_VALUE',
        entity: { ...entity, [extraDisplayColumnName.value]: extraValue }
      });
    },
    [send, extraDisplayColumnName]
  );

  const getValueFieldComponent = (
    valueFieldComponentInfo: ValueFieldComponentInfo,
    entity: E | undefined,
    keyColumn: string,
    valueColumn: string
  ) => {
    switch (valueFieldComponentInfo.type) {
      case 'SELECT': {
        return (
          <SelectEntityRow
            key={keyColumn}
            value={entity ? String(entity[valueColumn]) : ''}
            valueFieldOptions={valueFieldComponentInfo.valueOptions ?? []}
            onChange={(val) => handleOnRowChange(entity, val)}
            dataTestId={entity ? `${entity[keyColumn]}-select` : ''}
          />
        );
      }
      case 'CHECKBOX': {
        return entity ? (
          <BooleanEntityRow
            disable={isLoading || isDrafting}
            value={Boolean(entity[valueColumn])}
            onChange={(enabled) => handleOnRowChange(entity, enabled)}
          />
        ) : (
          <></>
        );
      }
      default:
        return <></>;
    }
  };
  const setInputFieldsRow = () => {
    return (
      <tr>
        <TableCell colSpan={2}>
          <Input
            type="text"
            placeholder="Enter user ID"
            ref={inputRef}
            data-testid="input-field"
            disabled={isCreatingEntity}
            onChange={handleOnInputChange}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                handleOnSave();
              } else if (e.key === 'Escape') {
                handleOnCancel();
              }
            }}
          />
        </TableCell>
        {extraDisplayColumnName && (
          <TableCell colSpan={2}>
            <Input
              type="text"
              placeholder="Enter user full name"
              ref={extraInputRef}
              data-testid="extra-input-field"
              disabled={isCreatingEntity}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleOnSave();
                } else if (e.key === 'Escape') {
                  handleOnCancel();
                }
              }}
            />
          </TableCell>
        )}
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {successMessage && <Success message={successMessage} />}
      {error && <Warning message={'Save Failed'} error={error} />}
      <Table>
        <TableHead>
          <tr>
            <TableHeader colSpan={2}>{displayKeyColumnName}</TableHeader>
            {extraDisplayColumnName && <TableHeader colSpan={2}>{extraDisplayColumnName.label}</TableHeader>}
            <TableHeader colSpan={2}>{valueColumnName}</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {displayKeyFieldAsDropDown ? (
            <tr>
              <CustomReactSelect
                dataTestId={'keyFieldSelect'}
                options={orderedEntities.map((entity) => {
                  return {
                    value: String(entity[displayKeyColumnName]),
                    label: String(entity[displayKeyColumnName])
                  };
                })}
                value={selectedEntity ? String(selectedEntity[displayKeyColumnName]) : ''}
                handleChange={handleEntitySelection}
                className={'p-4'}
              />
              {getValueFieldComponent(
                valueFieldComponentInfo,
                selectedEntity,
                String(displayKeyColumnName),
                String(valueColumnName)
              )}
            </tr>
          ) : (
            orderedEntities.map((entity, indx) => (
              <tr key={indx}>
                <TableCell colSpan={2}>{entity[displayKeyColumnName]}</TableCell>
                {extraDisplayColumnName && (
                  <TableCell colSpan={2}>
                    <Input
                      type="text"
                      placeholder="Enter user full name"
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          handleExtraValueUpdate(String(entity[displayKeyColumnName]), e.currentTarget.value);
                        }
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleOnChangeForExtraDisplayColumn(entity, e.target.value);
                      }}
                      value={String(entity[extraDisplayColumnName.value])}
                    />
                  </TableCell>
                )}
                {getValueFieldComponent(
                  valueFieldComponentInfo,
                  entity,
                  String(displayKeyColumnName),
                  String(valueColumnName)
                )}
              </tr>
            ))
          )}
          {showDraft && setInputFieldsRow()}
        </TableBody>
      </Table>
      <div className="flex flex-row justify-end items-center space-x-3">
        {isLoading && <LoadingSpinner />}

        {!showDraft && (
          <BlueButton disabled={isLoading} onClick={() => send({ type: 'DRAFT_NEW_ENTITY' })}>
            + Add{' '}
            {capitalize(alternateKeyColumnName ? alternateKeyColumnName.toString() : displayKeyColumnName.toString())}
          </BlueButton>
        )}

        {showDraft && (
          <>
            <PinkButton disabled={isCreatingEntity} onClick={handleOnCancel}>
              Cancel
            </PinkButton>
            <WhiteButton disabled={isCreatingEntity} onClick={handleOnSave}>
              Save
            </WhiteButton>
          </>
        )}
      </div>
    </div>
  );
}
