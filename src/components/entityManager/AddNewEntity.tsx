import FormikInput from '../forms/Input';
import WhiteButton from '../buttons/WhiteButton';
import BlueButton from '../buttons/BlueButton';
import React from 'react';
import { Form, Formik } from 'formik';
import { capitalize } from 'lodash';
import { EntityProperty } from './ComposedEntityManager';
import { EntityValueType } from './EntityManager';

export type AddNewEntityProps<EntityType, ParentEntityType> = {
  parentEntity?: ParentEntityType;
  entityPros: Array<EntityProperty>;
  onSave: (entity: EntityType, parentEntity?: ParentEntityType) => Promise<any>;
  onCancel: () => void;
  entityName: string;
};
export default function AddNewEntity<EntityType, ParentEntityType>({
  parentEntity,
  entityName,
  entityPros,
  onSave,
  onCancel
}: AddNewEntityProps<EntityType, ParentEntityType>) {
  const initialValues = entityPros.reduce(
    (acc, prop) => {
      switch (prop.propertyType) {
        case 'boolean':
          acc[prop.propertyName] = false;
          break;
        case 'number':
          acc[prop.propertyName] = 0;
          break;
        case 'string':
          acc[prop.propertyName] = '';
          break;
        default:
          acc[prop.propertyName] = '';
      }
      return acc;
    },
    {} as Record<string, EntityValueType>
  );

  const coerceValuesToTypes = (values: Record<string, EntityValueType>): EntityType => {
    entityPros.forEach((prop) => {
      switch (prop.propertyType) {
        case 'boolean':
          values[prop.propertyName] = Boolean(values[prop.propertyName]);
          break;
        case 'number':
          values[prop.propertyName] = Number(values[prop.propertyName]);
          break;
        default:
          values[prop.propertyName] = String(values[prop.propertyName]);
      }
    });
    return values as EntityType;
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values) => {
          await onSave(coerceValuesToTypes(values) as EntityType, parentEntity);
        }}
      >
        {({ setFieldValue }) => (
          <Form>
            <div
              className={
                'capitalize bg-gray-300 justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium '
              }
            >{`Add new ${entityName}`}</div>
            <div className="border-2 border-gray-200 bg-white p-3 rounded-md space-y-4">
              {entityPros.map((prop) => (
                <FormikInput
                  key={prop.propertyName}
                  label={capitalize(prop.propertyName)}
                  data-testid={prop.propertyName}
                  name={prop.propertyName}
                  type={prop.propertyType}
                  onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                    await setFieldValue(prop.propertyName, e.target.value);
                  }}
                />
              ))}
              <div className="flex flex-row items-center justify-end space-x-2">
                <WhiteButton type="button" onClick={onCancel}>
                  Cancel
                </WhiteButton>
                <BlueButton type="submit">Save</BlueButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
