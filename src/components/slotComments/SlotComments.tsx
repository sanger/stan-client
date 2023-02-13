import React from 'react';
import { AddressCommentInput, CommentFieldsFragment } from '../../types/sdk';
import { Row } from 'react-table';
import DataTable from '../DataTable';
import { selectOptionValues } from '../forms';
import { alphaNumericSortDefault } from '../../types/stan';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';

type SlotCommentProps = {
  slotComments: AddressCommentInput[];
  comments: CommentFieldsFragment[];
  onChangeComment: (address: string, value: string) => void;
};

/**
 * Component to display SlotMeasurements as a table with two columns - slot address & measurement value
 *
 * @param slotComments - AddressCommentInput data
 * @param comments - List of  comments to select from
 * @param onChangeComment - Callback for comment change
 *
 */

const SlotComments = ({ slotComments, comments, onChangeComment }: SlotCommentProps) => {
  const getComment = (address: string, slotComments: AddressCommentInput[]) => {
    const slotComment = slotComments.find((sc) => address === sc.address);
    return slotComment ? slotComment.commentId + '' : '';
  };
  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Address',
        id: 'address',
        accessor: (addressComment: AddressCommentInput) => addressComment.address
      },
      {
        Header: 'Comments',
        id: 'Comments',
        Cell: ({ row }: { row: Row<AddressCommentInput> }) => {
          return (
            <CustomReactSelect
              value={getComment(row.original.address, slotComments)}
              emptyOption={true}
              dataTestId={'comment'}
              handleChange={(e) => onChangeComment(row.original.address, (e as OptionType).value)}
              options={selectOptionValues(comments, 'text', 'id')}
            />
          );
        }
      }
    ];
  }, [comments, slotComments, onChangeComment]);

  return (
    <>
      {slotComments.length > 0 && (
        <DataTable
          columns={columns}
          data={slotComments.sort((a, b) => alphaNumericSortDefault(a.address, b.address))}
        />
      )}
    </>
  );
};

export default SlotComments;
