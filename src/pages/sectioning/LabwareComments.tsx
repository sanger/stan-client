import React, { ChangeEvent } from "react";
import MutedText from "../../components/MutedText";
import { Select } from "../../components/forms/Select";
import { optionValues } from "../../components/forms";
import { Comment, LabwareFieldsFragment } from "../../types/graphql";
import { LayoutPlan } from "../../lib/machines/layout/layoutContext";

interface LabwareCommentsProps {
  slot: LabwareFieldsFragment["slots"][number];
  layoutPlan: LayoutPlan;
  comments: Array<Comment>;
  value: string | number | undefined;
  disabled?: boolean;
  onCommentChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const LabwareComments: React.FC<LabwareCommentsProps> = ({
  slot,
  layoutPlan,
  comments,
  value,
  onCommentChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-row items-center justify-start gap-x-2">
      <span className="font-medium text-gray-800 tracking-wide">
        {slot.address}
      </span>
      <span className="flex-grow text-center">
        {!layoutPlan.plannedActions.has(slot.address) && (
          <MutedText>Empty</MutedText>
        )}
        {layoutPlan.plannedActions.has(slot.address) && (
          <Select
            value={value}
            disabled={disabled}
            style={{ width: "100%" }}
            onChange={(e) => onCommentChange(e)}
          >
            <option value="" />
            {optionValues(comments, "text", "id")}
          </Select>
        )}
      </span>
    </div>
  );
};

export default LabwareComments;
