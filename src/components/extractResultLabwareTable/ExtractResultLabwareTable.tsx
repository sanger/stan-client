import React, { useCallback, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { CommentFieldsFragment, ExtractResultRequest, PassFail } from '../../types/sdk';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import { useLabwareContext } from '../labwareScanner/LabwareScanner';
import { PassFailInput } from '../forms/PassFailInput';
import FormikInput from '../forms/Input';
import FormikSelect from '../forms/Select';
import { optionValues } from '../forms';
import RemoveButton from '../buttons/RemoveButton';
import { ExtractResultLabwareForm, ExtractResultRequestForm } from '../../pages/ExtractionResult';
import { FlaggedBarcodeLink } from '../dataTableColumns/labwareColumns';

type ExtractResultLabwareTableProps = {
  /**
   * List of available comments for when a labware has failed
   */
  availableComments: Array<CommentFieldsFragment>;
};

/**
 * Component to build an {@link ExtractResultLabware}. Must be used inside a Formik form.
 */
export function ExtractResultLabwareTable({ availableComments }: ExtractResultLabwareTableProps) {
  const { values } = useFormikContext<ExtractResultRequestForm>();

  if (values.labware.length === 0) {
    return null;
  }

  const tableRows = values.labware.map((labware, index) => (
    <ExtractResultLabwareRow
      key={labware.barcode}
      index={index}
      labware={labware}
      availableComments={availableComments}
    />
  ));

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Barcode</TableHeader>
          <TableHeader>Result</TableHeader>
          <TableHeader>Concentration (ng/uL)</TableHeader>
          <TableHeader>Comment</TableHeader>
          <TableHeader />
        </tr>
      </TableHead>

      <TableBody>{tableRows}</TableBody>
    </Table>
  );
}

type ExtractResultLabwareRowProps = {
  /**
   * The labware to display in the row
   */
  labware: ExtractResultLabwareForm;

  /**
   * The index of this row
   */
  index: number;

  /**
   * List of available comments for when a labware has failed
   */
  availableComments: Array<CommentFieldsFragment>;
};

function ExtractResultLabwareRow({ labware, index, availableComments }: ExtractResultLabwareRowProps) {
  const { removeLabware } = useLabwareContext();
  const { setFieldValue } = useFormikContext<ExtractResultRequest>();

  /**
   * When the result is changed, reset the concentration and comment ID
   */
  const handlePassFailChange = useCallback(
    (newPassFail: PassFail) => {
      if (newPassFail === PassFail.Pass) {
        setFieldValue(`labware.${index}`, {
          lw: labware.lw,
          barcode: labware.barcode,
          commentId: undefined,
          concentration: '0.00',
          result: PassFail.Pass
        });
      } else {
        setFieldValue(`labware.${index}`, {
          lw: labware.lw,
          barcode: labware.barcode,
          commentId: availableComments[0].id,
          concentration: undefined,
          result: PassFail.Fail
        });
      }
    },
    [setFieldValue, labware.barcode, index, availableComments, labware.lw]
  );

  const barcodeCell = useMemo(() => {
    return labware.lw.flagged ? FlaggedBarcodeLink(labware.lw.barcode) : labware.lw.barcode;
  }, [labware]);

  return (
    <tr>
      <TableCell>{barcodeCell}</TableCell>
      <TableCell>
        <PassFailInput onChange={handlePassFailChange} value={labware.result} />
      </TableCell>
      <TableCell>
        {labware.result === PassFail.Pass ? (
          <FormikInput label={''} name={`labware.${index}.concentration`} type={'text'} />
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        {!!labware.commentId ? (
          <FormikSelect
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFieldValue(`labware.${index}.commentId`, parseInt(e.currentTarget.value))
            }
            label={''}
            name={`labware.${index}.commentId`}
          >
            {optionValues(availableComments, 'text', 'id')}
          </FormikSelect>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        <RemoveButton type="button" onClick={() => removeLabware(labware.barcode)} />
      </TableCell>
    </tr>
  );
}
