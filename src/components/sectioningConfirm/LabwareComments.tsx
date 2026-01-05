import React from 'react';
import { selectOptionValues } from '../forms';
import { Comment } from '../../types/sdk';
import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { Input } from '../forms/Input';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';

export enum SectionNumberSetting {
  NORMAL,
  DISABLE,
  HIDE
}
interface LabwareCommentsProps {
  sectionGroupId: string;
  layoutPlan: LayoutPlan;
  comments: Array<Comment>;
  disabledComment?: boolean;
  sectionNumberDisplay?: SectionNumberSetting;
  onCommentChange: (commentIds: string[]) => void;
  onSectionNumberChange: (sectionGroupId: string, sectionNumber: number) => void;
  onSectionThicknessChange: (sectionGroupId: string, thickness: string) => void;
}

const LabwareComments: React.FC<LabwareCommentsProps> = ({
  sectionGroupId,
  layoutPlan,
  comments,
  onCommentChange,
  sectionNumberDisplay,
  onSectionNumberChange,
  disabledComment = false,
  onSectionThicknessChange
}) => {
  const sectionDetail = layoutPlan.plannedActions[sectionGroupId];
  return (
    <div className="flex flex-row items-start justify-start gap-x-2">
      <div className="flex flex-col">
        <div className={'grid grid-cols-4 gap-x-1 gap-y-2'}>
          {sectionNumberDisplay !== SectionNumberSetting.HIDE && (
            <>
              <Input
                type="number"
                data-testid={'section-number'}
                value={sectionDetail.source.newSection === 0 ? '' : String(sectionDetail.source.newSection)}
                min={1}
                disabled={sectionNumberDisplay === SectionNumberSetting.DISABLE}
                onChange={(e) => onSectionNumberChange(sectionGroupId, Number(e.target.value))}
              />
              <Input
                type="text"
                data-testid={'section-addresses'}
                value={Array.from(sectionDetail.addresses).join(', ')}
                min={1}
                disabled={true}
              />
              <Input
                type="number"
                data-testid={'section-thickness'}
                value={sectionDetail.source.sampleThickness}
                min={0.5}
                step={0.5}
                onChange={(e) => {
                  onSectionThicknessChange(sectionGroupId, e.target.value);
                }}
              />
              <div className={'flex flex-col'}>
                <CustomReactSelect
                  value={layoutPlan.plannedActions[sectionGroupId].source.commentIds?.map((comment) => comment + '')}
                  isDisabled={disabledComment}
                  handleChange={(options) => {
                    const optionsValues = Array.isArray(options)
                      ? options.map((option) => option.value)
                      : [(options as OptionType).value];
                    onCommentChange(optionsValues);
                  }}
                  className={'w-full'}
                  isMulti
                  options={selectOptionValues(comments, 'text', 'id')}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabwareComments;
