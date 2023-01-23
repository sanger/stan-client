import React from 'react';
import { AddressCommentInput, CommentFieldsFragment } from '../../types/sdk';
import { Row } from 'react-table';
import DataTable from '../DataTable';
import { optionValues } from '../forms';
import { Select } from '../forms/Select';
import { alphaNumericSortDefault } from '../../types/stan';

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
    return slotComment ? slotComment.commentId : '';
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
            <Select
              value={getComment(row.original.address, slotComments)}
              emptyOption={true}
              data-testid={'comment'}
              onChange={(e) => onChangeComment(row.original.address, e.currentTarget.value)}
            >
              {optionValues(comments, 'text', 'id')}
            </Select>
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
