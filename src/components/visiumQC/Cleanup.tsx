import React from 'react';
import { AddressCommentInput, CommentFieldsFragment, LabwareFieldsFragment, SlotFieldsFragment } from '../../types/sdk';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import { useFormikContext } from 'formik';
import { VisiumQCFormData } from '../../pages/VisiumQC';
import { selectOptionValues } from '../forms';
import RemoveButton from '../buttons/RemoveButton';
import Labware from '../labware/Labware';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';

type CleanupProps = {
  comments: CommentFieldsFragment[];
  labware: LabwareFieldsFragment;
  removeLabware: (barcode: string) => void;
};
const Cleanup = ({ comments, labware, removeLabware }: CleanupProps) => {
  const { setFieldValue } = useFormikContext<VisiumQCFormData>();
  const [slotComments, setSlotComments] = React.useState<AddressCommentInput[]>([]);

  /**Initialise all comments for slots when labware changes**/
  React.useEffect(() => {
    if (!labware) return;
    setFieldValue('barcode', labware.barcode);
    setSlotComments([]);
  }, [labware, setFieldValue]);

  /**Update form values when ever comments associated with slots change**/
  React.useEffect(() => {
    setFieldValue('slotComments', slotComments);
  }, [slotComments, setFieldValue]);

  const getComment = (address: string) => {
    const slotComment = slotComments.find((sc) => address === sc.address);
    return slotComment ? slotComment.commentId + '' : '';
  };

  const handleCommentChange = React.useCallback(
    (address: string, commentIdVal: string) => {
      const commentId = commentIdVal !== '' ? Number(commentIdVal) : undefined;
      setSlotComments((prevSlotComments: AddressCommentInput[]) => {
        const slotComments = [...prevSlotComments];
        const findIndex = slotComments.findIndex((sc) => sc.address === address);
        if (findIndex >= 0) {
          slotComments.splice(findIndex, 1);
        }
        if (!commentId) {
          return [...slotComments];
        } else return [...slotComments, { address, commentId }];
      });
    },
    [setSlotComments]
  );
  const handleAllCommentChange = React.useCallback(
    (commentIdVal: string) => {
      const commentId = commentIdVal !== '' ? Number(commentIdVal) : undefined;
      if (!commentId) {
        setSlotComments([]);
        return;
      }
      const allSlotComments: AddressCommentInput[] = [];
      labware.slots.forEach((slot) => {
        if (isSlotFilled(slot)) {
          allSlotComments.push({ address: slot.address, commentId: commentId });
        }
      });
      setSlotComments(allSlotComments);
    },
    [setSlotComments, labware]
  );

  const slotBuilder = (slot: SlotFieldsFragment): React.ReactNode => {
    return (
      isSlotFilled(slot) && (
        <div className={`flex flex-col border-b border-gray-300`}>
          <div className="w-full">
            <CustomReactSelect
              value={getComment(slot.address)}
              emptyOption={true}
              dataTestId={'comment'}
              handleChange={(val) => handleCommentChange(slot.address, (val as OptionType).value)}
              options={selectOptionValues(comments, 'text', 'id')}
            />
          </div>
        </div>
      )
    );
  };
  return (
    <div>
      {labware && (
        <>
          <div className="flex flex-row items-center justify-end">
            {<RemoveButton data-testid={'remove'} type="button" onClick={() => removeLabware(labware.barcode)} />}
          </div>
          <div className="flex flex-col items-center justify-around">
            {/* Display the layout of the labware */}
            <div className="bg-blue-100" data-testid={'labware'}>
              <Labware labware={labware} slotBuilder={slotBuilder} />
            </div>

            {/* Display the dropdown to set/reset all comments */}
            <div className="mt-8 flex flex-col justify-between gap-x-4">
              <label className={'whitespace-nowrap font-semibold'}>Comment all</label>
              <CustomReactSelect
                dataTestId={'commentAll'}
                emptyOption
                handleChange={(val) => handleAllCommentChange((val as OptionType).value)}
                options={selectOptionValues(comments, 'text', 'id')}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cleanup;
