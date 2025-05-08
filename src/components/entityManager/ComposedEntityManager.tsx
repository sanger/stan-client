import React, { useEffect, useState } from 'react';
import { EntityValueType } from './EntityManager';
import { alphaNumericSortDefault, extractServerErrors } from '../../types/stan';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import BlueButton from '../buttons/BlueButton';
import MutedText from '../MutedText';
import AddNewEntity from './AddNewEntity';
import { Maybe } from 'yup';
import { ClientError } from 'graphql-request';
import warningToast from '../notifications/WarningToast';
import { toast } from 'react-toastify';

export type ComposedEntities = Record<string, ComposedEntityValueType>;

type ComposedEntityValueType = boolean | string | number | Record<string, EntityValueType>[];

export type EntityProperty = {
  propertyName: string;
  propertyType: string;
};

export type EntityDefinition<A, B, C> = {
  name: string;
  type: string;
  properties: Array<EntityProperty>;
  orderBy: string;
  onCreate: (entity: A, parentEntity?: C) => Promise<B>;
  toString?: (entity: A) => string;
  initialValue?: A;
};

type ComposedEntityManagerProps<E, F, G, H> = {
  composedEntities: Array<E>;
  entitiesDef: EntityDefinition<E, F, E>;
  nestedEntitiesDef: EntityDefinition<G, H, E>;
};

export default function ComposedEntityManager<E extends ComposedEntities, F, G, H>({
  composedEntities,
  entitiesDef,
  nestedEntitiesDef
}: ComposedEntityManagerProps<E, F, G, H>) {
  const composeErrorMessage = React.useCallback((serverErrors: ClientError) => {
    const extracted = extractServerErrors(serverErrors);
    return extracted.message + ':\n' + extracted.problems.join('\n');
  }, []);

  const [serverErrors, setServerErrors] = React.useState<Maybe<ClientError>>(null);
  const [serverSuccess, setServerSuccess] = React.useState<Maybe<string>>(null);

  useEffect(() => {
    if (serverErrors) {
      warningToast({
        message: composeErrorMessage(serverErrors),
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000
      });
      setServerErrors(null);
    }
  }, [serverErrors, composeErrorMessage]);

  useEffect(() => {
    if (serverSuccess) {
      toast.success(serverSuccess, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000
      });
      setServerSuccess(null);
    }
  }, [serverSuccess]);

  const orderedEntitiesWithSortedNested = React.useMemo(() => {
    return [...composedEntities]
      .sort((a: E, b: E) => alphaNumericSortDefault(String(a[entitiesDef.orderBy]), String(b[entitiesDef.orderBy])))
      .map((entity: E) => {
        const nestedEntities = [...(entity[nestedEntitiesDef.type] as Record<string, EntityValueType>[])];
        nestedEntities.sort((a, b) =>
          alphaNumericSortDefault(String(a[nestedEntitiesDef.orderBy]), String(b[nestedEntitiesDef.orderBy]))
        );

        return {
          ...entity,
          [nestedEntitiesDef.type]: nestedEntities
        };
      });
  }, [composedEntities, entitiesDef.orderBy, nestedEntitiesDef]);
  const [entities, setEntities] = useState<Array<E>>(orderedEntitiesWithSortedNested);
  const [expandedRowIndex, setExpandedRowIndex] = React.useState<number | null>(null);
  const [addNewEntityRowIndex, setAddNewEntityRowIndex] = React.useState<number | null>(null);
  const [displayNewEntityForm, setDisplayNewEntityForm] = React.useState<boolean>(false);

  return (
    <div className="space-y-8">
      <MutedText>{`Click on a ${entitiesDef.name}  to expand or collapse its associated ${nestedEntitiesDef.name}`}</MutedText>
      <Table>
        <TableHead>
          <tr>
            {entitiesDef.properties.map((entityProp, index: number) => (
              <TableHeader key={`header+${index}`} colSpan={1}>
                {entityProp.propertyName}
              </TableHeader>
            ))}
            {nestedEntitiesDef.properties.map((prop, index: number) => (
              <TableHeader key={`nes-header+${index}`} colSpan={1}></TableHeader>
            ))}
            <TableHeader colSpan={1}></TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {entities.map((entity: E, index: number) => {
            const isExpanded = expandedRowIndex === index;
            const isAddingNewEntity = addNewEntityRowIndex === index;
            return (
              <tr key={index} className={'border border-gray-300 cursor-pointer hover:bg-gray-100'}>
                {entitiesDef.properties.map((entityProp) => (
                  <TableCell
                    onClick={() => {
                      setExpandedRowIndex((prev) => (prev === index ? null : index));
                      if (addNewEntityRowIndex !== index) {
                        setAddNewEntityRowIndex(null);
                      }
                    }}
                  >
                    {entity[entityProp.propertyName] as string}
                  </TableCell>
                ))}
                {isExpanded && (entity[nestedEntitiesDef.type] as Record<string, EntityValueType>[]).length === 0 && (
                  <TableCell>
                    <MutedText>{`No ${nestedEntitiesDef.name} is associated with this ${entitiesDef.name}`}</MutedText>
                  </TableCell>
                )}
                {isExpanded && (entity[nestedEntitiesDef.type] as Record<string, EntityValueType>[]).length > 0 && (
                  <TableCell
                    className={`grid grid-cols-${nestedEntitiesDef.properties.length}`}
                    onClick={() => {
                      setExpandedRowIndex(null);
                      if (addNewEntityRowIndex !== index) {
                        setAddNewEntityRowIndex(null);
                      }
                    }}
                  >
                    {nestedEntitiesDef.properties.map((prop, index: number) => (
                      <div
                        key={`nes-${nestedEntitiesDef.name}+${index}`}
                        className="capitalize font-bold text-gray-700"
                      >
                        {`${nestedEntitiesDef.name}  ${prop.propertyName}`}
                      </div>
                    ))}
                    {(entity[nestedEntitiesDef.type] as Record<string, EntityValueType>[]).map(
                      (nestedEntity: Record<string, EntityValueType>, index: number) =>
                        nestedEntitiesDef.properties.map((prop) => (
                          <div key={`nes-${nestedEntity[prop.propertyName]}-${index}`}>
                            {nestedEntity[prop.propertyName] as string}
                          </div>
                        ))
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {isAddingNewEntity && (
                    <AddNewEntity<G, E>
                      parentEntity={entity}
                      entityPros={nestedEntitiesDef.properties}
                      entityName={nestedEntitiesDef.name}
                      onSave={async (_entity: G, _parentEntity?: E) => {
                        nestedEntitiesDef
                          .onCreate(_entity, _parentEntity)
                          .then(() => {
                            setEntities((prev) => {
                              const newEntities = [...prev];
                              newEntities[index] = {
                                ...newEntities[index],
                                [nestedEntitiesDef.type]: [
                                  ...(newEntities[index][nestedEntitiesDef.type] as F[]),
                                  _entity
                                ]
                              };
                              return newEntities;
                            });
                            setServerSuccess(
                              `Successfully added new ${nestedEntitiesDef.name} to ${
                                entitiesDef.toString!(_parentEntity!) as string
                              }`
                            );
                            setAddNewEntityRowIndex(null);
                          })
                          .catch((error) => {
                            setServerErrors(error);
                          });
                      }}
                      onCancel={() => {
                        setAddNewEntityRowIndex(null);
                      }}
                    />
                  )}
                  {!isAddingNewEntity && (
                    <BlueButton
                      onClick={(event) => {
                        event.stopPropagation();
                        setAddNewEntityRowIndex(index);
                      }}
                    >{`+ Add ${nestedEntitiesDef.name}`}</BlueButton>
                  )}
                </TableCell>
              </tr>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex flex-row justify-end items-center space-x-3">
        <BlueButton
          onClick={() => {
            setDisplayNewEntityForm(true);
          }}
        >
          {`+ Add ${entitiesDef.name}`}
        </BlueButton>
      </div>
      {displayNewEntityForm && (
        <AddNewEntity<E, F>
          entityPros={entitiesDef.properties}
          entityName={entitiesDef.name}
          onSave={async (entity: E) => {
            const newEntity = { ...entity, [nestedEntitiesDef.type]: [nestedEntitiesDef.initialValue ?? {}] } as E;
            entitiesDef
              .onCreate({ ...newEntity })
              .then(() => {
                setEntities((prev) => {
                  const newEntities = [...prev];
                  newEntities.push({
                    ...newEntity
                  });
                  return newEntities;
                });
                setServerSuccess(`Successfully added new ${entitiesDef.name}`);
                setDisplayNewEntityForm(false);
              })
              .catch((error) => {
                setServerErrors(error);
              });
            return Promise<void>;
          }}
          onCancel={() => {
            setDisplayNewEntityForm(false);
          }}
        />
      )}
    </div>
  );
}
