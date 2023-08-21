import React from 'react';
import { CommentFieldsFragment, LabwareFieldsFragment } from '../../types/sdk';
import RemoveButton from '../buttons/RemoveButton';
import Panel from '../Panel';
import Labware from '../labware/Labware';
import WorkNumberSelect from '../WorkNumberSelect';
import { getCurrentDateTime } from '../../types/stan';
import FormikInput from '../forms/Input';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { selectOptionValues } from '../forms';
import { useFormikContext } from 'formik';
import { XeniumQCFormData } from '../../pages/XeniumQC';

type XeniumLabwareQCProps = {
  comments: CommentFieldsFragment[];
  labware: LabwareFieldsFragment;
  index: number;
};
export const XeniumLabwareQC = ({ labware, comments, index }: XeniumLabwareQCProps) => {
  const { values, setFieldValue } = useFormikContext<XeniumQCFormData>();
  return (
    <div className="max-w-screen-xl mx-auto">
      {labware && (
        <div className={'flex flex-col py-4'}>
          <Panel>
            <div className="flex flex-row items-center justify-end">
              {<RemoveButton data-testid={'remove'} onClick={() => {}} />}
            </div>
            <div className={'flex flex-row mt-8 justify-between'}>
              <div className={'flex flex-col w-full px-2 space-y-6'}>
                <WorkNumberSelect
                  label={'SGP Number'}
                  name={`labware.${index}.workNumber`}
                  dataTestId={'workNumber'}
                  onWorkNumberChange={(workNumber) => {}}
                  workNumber={values.labware[index]?.workNumber}
                />
                <FormikInput
                  label={'Completion Time'}
                  data-testid={'performed'}
                  type="datetime-local"
                  name={`labware.${index}.completion`}
                  max={getCurrentDateTime()}
                  value={values.labware[index]?.completion ?? getCurrentDateTime()}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFieldValue(`labware.${index}.completion`, e.target.value);
                  }}
                />
                <div className={'flex w-full'}>
                  <CustomReactSelect
                    label={'Comments'}
                    name={`labware.${index}.comments`}
                    emptyOption={true}
                    options={selectOptionValues(comments, 'text', 'id')}
                    handleChange={(val) => {
                      const comments = (val as OptionType[]).map((option) => option.value);
                      setFieldValue(`labware.${index}.comments`, comments);
                    }}
                    isMulti={true}
                    value={values.labware[index]?.comments.map(
                      (commentId) => comments.find((comment) => comment.id === commentId)?.text
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full items-center justify-center p-4" data-testid={'labware'}>
                <Labware labware={labware} name={labware.labwareType.name} />
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};
