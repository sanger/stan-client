import React from 'react';
import { ComplexStainLabware, ComplexStainRequest, StainPanel } from '../../types/sdk';
import { TableCell } from '../../components/Table';
import FormikInput from '../../components/forms/Input';
import WorkNumberSelect from '../../components/WorkNumberSelect';
import { objectKeys } from '../../lib/helpers';
import CustomReactSelect, { OptionType } from '../../components/forms/CustomReactSelect';

/**Properties for the setting the values for all rows**/
type ComplexStainValueSetterProps = {
  /**
   * global value to set for all rows
   */
  stainValuesToAll: ComplexStainLabware;
  /**
   * function to set values in the global setter
   * @param field
   * @param value
   * @param shouldValidate
   */
  setValueToAllStainRows: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
};

type ComplexStainRowProps = {
  barcode: string;
  stainType: string;
  plexMin: number;
  plexMax: number;
  stainFormValues: ComplexStainRequest;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
  rowID?: number;
  stainRowApplyAllSettings?: ComplexStainValueSetterProps;
};

const ComplexStainRow = ({
  barcode,
  stainType,
  plexMin,
  plexMax,
  rowID,
  stainFormValues,
  stainRowApplyAllSettings,
  setFieldValue
}: ComplexStainRowProps) => {
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<any> | { fieldName: string; value: string }) => {
      let fieldName = '';
      let fieldValue = '';
      if ('fieldName' in e) {
        fieldName = e.fieldName;
        fieldValue = e.value;
      } else {
        fieldName = e.target.name;
        fieldValue = e.currentTarget.value;
      }
      //Set the field value in this row
      setFieldValue(fieldName, fieldValue);
      if (!stainRowApplyAllSettings) return;
      //Globally set values for all rows
      stainFormValues.labware.forEach((_, i) => {
        stainRowApplyAllSettings.setValueToAllStainRows(`labware.${i}.${fieldName}`, fieldValue);
      });
    },
    [stainRowApplyAllSettings, stainFormValues, setFieldValue]
  );

  const cellClassNames = `p-4 ${stainRowApplyAllSettings && 'font-medium text-gray-600 font-bold'}`;
  return (
    <tr key={barcode}>
      <TableCell className={`text-center ${cellClassNames}`}>{barcode}</TableCell>
      <TableCell className={cellClassNames}>
        <FormikInput
          label={''}
          name={rowID !== undefined ? `labware.${rowID}.bondBarcode` : `bondBarcode`}
          onChange={handleChange}
          data-testid={`${barcode}-bondBarcode`}
        />
      </TableCell>
      <TableCell className={cellClassNames}>
        <FormikInput
          label={''}
          name={rowID !== undefined ? `labware.${rowID}.bondRun` : `bondRun`}
          type={'number'}
          min={0}
          onChange={handleChange}
          data-testid={`${barcode}-bondRun`}
        />
      </TableCell>
      <TableCell className={cellClassNames}>
        <WorkNumberSelect
          label={''}
          name={rowID !== undefined ? `labware.${rowID}.workNumber` : `workNumber`}
          onWorkNumberChange={(workNumber) => {
            handleChange({
              fieldName: rowID !== undefined ? `labware.${rowID}.workNumber` : `workNumber`,
              value: workNumber ?? ''
            });
          }}
          workNumber={rowID !== undefined ? stainFormValues.labware[rowID].workNumber ?? '' : ''}
          dataTestId={`${barcode}-workNumber`}
        />
      </TableCell>
      <TableCell className={cellClassNames}>
        <CustomReactSelect
          className={cellClassNames}
          label={''}
          name={rowID !== undefined ? `labware.${rowID}.panel` : `panel`}
          handleChange={(val) =>
            handleChange({
              fieldName: rowID !== undefined ? `labware.${rowID}.panel` : `panel`,
              value: (val as OptionType).value
            })
          }
          dataTestId={stainRowApplyAllSettings ? 'all-panel' : `${barcode}-panel`}
          options={objectKeys(StainPanel).map((stainPanel) => {
            return {
              label: stainPanel,
              value: StainPanel[stainPanel]
            };
          })}
          value={rowID !== undefined ? stainFormValues.labware[rowID].panel ?? '' : ''}
          data-testid={`${barcode}-panel`}
        />
      </TableCell>
      <TableCell className={cellClassNames}>
        <FormikInput
          label={''}
          data-testid={`${barcode}-plexRNAscope`}
          name={rowID !== undefined ? `labware.${rowID}.plexRNAscope` : `plexRNAscope`}
          type={'number'}
          min={plexMin}
          max={plexMax}
          step={1}
          disabled={stainType === 'IHC'}
          value={
            stainType === 'IHC'
              ? ''
              : stainRowApplyAllSettings
              ? stainRowApplyAllSettings.stainValuesToAll.plexRNAscope
              : stainFormValues.labware[rowID!].plexRNAscope
          }
          onChange={handleChange}
        />
      </TableCell>
      <TableCell className={cellClassNames}>
        <FormikInput
          data-testid={`${barcode}-plexIHC`}
          label={''}
          name={rowID !== undefined ? `labware.${rowID}.plexIHC` : `plexIHC`}
          type={'number'}
          min={plexMin}
          max={plexMax}
          step={1}
          disabled={stainType === 'RNAscope'}
          onChange={handleChange}
          value={
            stainType === 'RNAscope'
              ? ''
              : stainRowApplyAllSettings
              ? stainRowApplyAllSettings.stainValuesToAll.plexIHC
              : stainFormValues.labware[rowID!].plexIHC
          }
        />
      </TableCell>
    </tr>
  );
};
export default ComplexStainRow;
