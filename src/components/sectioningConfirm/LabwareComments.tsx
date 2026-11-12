import React from 'react';
import { selectOptionValues } from '../forms';
import { Comment } from '../../types/sdk';
import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { Input } from '../forms/Input';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { findPlannedActionBySectionGroupId } from './confirmLabware.machine';

export enum SectionNumberSetting {
  NORMAL,
  DISABLE,
  HIDE
}
interface LabwareCommentsProps {
  sectionGroupId: number;
  layoutPlan: LayoutPlan;
  comments: Array<Comment>;
  disabledComment?: boolean;
  sectionNumberDisplay?: SectionNumberSetting;
  onCommentChange: (commentIds: string[]) => void;
  onSectionNumberChange: (addresses: Set<string>, sectionNumber: string) => void;
  onSectionThicknessChange: (addresses: Set<string>, thickness: string) => void;
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
  const sectionDetail = findPlannedActionBySectionGroupId(layoutPlan.plannedActions, sectionGroupId);
  if (!sectionDetail) return null;
  return (
    <div className="grid grid-cols-5 gap-x-1 gap-y-2">
      {sectionNumberDisplay !== SectionNumberSetting.HIDE && (
        <>
          <div
            data-testid="external-name"
            className="min-h-[38px] ring-sdb-100 opacity-75 border border-gray-300'
                px-3 py-2 whitespace-pre-wrap break-words bg-gray-200 rounded-md shadow-sm"
          >
            {sectionDetail.source.tissue?.externalName ?? ''}
          </div>
          <Input
            type="text"
            data-testid={'section-number'}
            value={sectionDetail.source.newSection}
            min={1}
            disabled={sectionNumberDisplay === SectionNumberSetting.DISABLE}
            onChange={(e) => onSectionNumberChange(sectionDetail.addresses, e.target.value)}
          />
          <div
            data-testid={'section-addresses'}
            className="min-h-[38px] ring-sdb-100 opacity-75 border border-gray-300'
                px-3 py-2 whitespace-pre-wrap break-words bg-gray-200 rounded-md shadow-sm"
          >
            {Array.from(sectionDetail.addresses).join(', ')}
          </div>
          <Input
            type="number"
            data-testid={'section-thickness'}
            value={sectionDetail.source.sampleThickness}
            min={0.5}
            step={0.5}
            onChange={(e) => {
              onSectionThicknessChange(sectionDetail.addresses, e.target.value);
            }}
          />
          <div className={'flex flex-col'}>
            <CustomReactSelect
              value={sectionDetail.source.commentIds?.map((comment) => comment + '')}
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
  );
};

export default LabwareComments;
