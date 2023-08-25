import React from 'react';
import { CommentFieldsFragment, LabwareFieldsFragment } from '../../types/sdk';
import RemoveButton from '../buttons/RemoveButton';
import Panel from '../Panel';
import Labware from '../labware/Labware';
import WorkNumberSelect from '../WorkNumberSelect';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { selectOptionValues } from '../forms';
import { FieldArray, useFormikContext } from 'formik';
import { XeniumQCFormData } from '../../pages/XeniumQC';

type XeniumLabwareQCProps = {
  comments: CommentFieldsFragment[];
  labware: LabwareFieldsFragment;
  index: number;
  removeLabware: (barcode: string) => void;
};
export const XeniumLabwareQC = ({ labware, comments, index, removeLabware }: XeniumLabwareQCProps) => {
  const { values, setFieldValue } = useFormikContext<XeniumQCFormData>();
  return (
    <div className="max-w-screen-xl mx-auto" data-testid={'xenium-labware-qc'}>
      {labware && (
        <FieldArray name={'labware'}>
          {({ remove }) => (
            <div className={'flex flex-col py-4'}>
              <Panel>
                <div className="flex flex-row items-center justify-end">
                  {
                    <RemoveButton
                      onClick={() => {
                        remove(index);
                        removeLabware(labware.barcode);
                      }}
                    />
                  }
                </div>
                <div className={'flex flex-row mt-8 justify-between'}>
                  <div className={'flex flex-col w-full px-2 space-y-6'}>
                    <WorkNumberSelect
                      label={'SGP Number'}
                      name={`labware.${index}.workNumber`}
                      dataTestId={`${labware.barcode}-workNumber`}
                      onWorkNumberChange={(workNumber) => {
                        setFieldValue(`labware.${index}.workNumber`, workNumber);
                      }}
                      workNumber={values.labware[index]?.workNumber}
                    />

                    <div className={'flex w-full'}>
                      <CustomReactSelect
                        label={'Comments'}
                        dataTestId={`${labware.barcode}-comments`}
                        name={`labware.${index}.comments`}
                        emptyOption={true}
                        options={selectOptionValues(comments, 'text', 'id')}
                        handleChange={(val) => {
                          const comments = (val as OptionType[]).map((option) => option.value);
                          setFieldValue(`labware.${index}.comments`, comments);
                        }}
                        isMulti={true}
                        value={values.labware[index]?.comments?.map(
                          (commentId) => comments.find((comment) => comment.id === Number(commentId))?.text
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
        </FieldArray>
      )}
    </div>
  );
};
