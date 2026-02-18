import React from 'react';
import { CommentFieldsFragment, LabwareFlaggedFieldsFragment } from '../../types/sdk';
import RemoveButton from '../buttons/RemoveButton';
import Panel from '../Panel';
import WorkNumberSelect from '../WorkNumberSelect';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { selectOptionValues } from '../forms';
import { FieldArray, useFormikContext } from 'formik';
import { SectionGroupsComments, XeniumQCFormData } from '../../pages/XeniumQC';
import { CellProps } from 'react-table';
import Warning from '../notifications/Warning';
import { FlaggedBarcodeLink } from '../dataTableColumns/labwareColumns';
import RoiTable from '../xeniumMetrics/RoiTable';

type XeniumLabwareQCProps = {
  comments: CommentFieldsFragment[];
  labware: LabwareFlaggedFieldsFragment;
  index: number;
  removeLabware: (barcode: string) => void;
  cleanedOutAddress?: string[];
};

export const XeniumLabwareQC = ({ labware, comments, index, removeLabware }: XeniumLabwareQCProps) => {
  const { values, setFieldValue, setValues } = useFormikContext<XeniumQCFormData>();
  const runNamesSelectOption: OptionType[] = values.labware[index]
    ? values.labware[index].runNames!.map((runName) => {
        return { value: runName, label: runName } as OptionType;
      })
    : ([] as OptionType[]);

  return (
    <div className="max-w-screen-xl mx-auto" data-testid={'xenium-labware-qc'}>
      {labware && (
        <FieldArray name={'labware'}>
          {({ remove }) => (
            <Panel>
              <div className="grid grid-cols-2 mb-4">
                {FlaggedBarcodeLink(labware.barcode, labware.flagPriority)}
                <div className="flex flex-row items-center justify-end">
                  <RemoveButton
                    onClick={() => {
                      remove(index);
                      removeLabware(labware.barcode);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-row items-center justify-start"></div>
              <div className={'grid grid-cols-3 gap-4'}>
                <WorkNumberSelect
                  label={'SGP Number'}
                  name={`labware.${index}.workNumber`}
                  dataTestId={`${labware.barcode}-workNumber`}
                  onWorkNumberChange={async (workNumber) => {
                    await setFieldValue(`labware.${index}.workNumber`, workNumber);
                  }}
                  workNumber={values.labware[index]?.workNumber}
                />

                <CustomReactSelect
                  label={'Run Name'}
                  dataTestId={'runName'}
                  name={`labware.${index}.selectedRunName`}
                  emptyOption={true}
                  options={runNamesSelectOption}
                  handleChange={async (val) => {
                    await setFieldValue(`labware.${index}.selectedRunName`, val ? (val as OptionType).value : '');
                  }}
                />

                <CustomReactSelect
                  label={'Comments'}
                  dataTestId={`${labware.barcode}-comments`}
                  name={`labware.${index}.comments`}
                  emptyOption={true}
                  options={selectOptionValues(comments, 'text', 'id')}
                  handleChange={async (val) => {
                    await setFieldValue(
                      `labware.${index}.comments`,
                      (val as OptionType[]).map((option) => option.value)
                    );
                  }}
                  isMulti={true}
                  value={values.labware[index]?.comments?.map(
                    (commentId) => comments.find((comment) => comment.id === Number(commentId))?.text
                  )}
                />
              </div>
              <div>
                <header className="text-lg font-bold py-8">Region of interest</header>
              </div>
              {!values.labware[index]?.sectionsComments && (
                <Warning data-testid={'warning'} message={'No regions of interest recorded for this labware.'} />
              )}
              {values.labware[index]?.sectionsComments?.length > 0 && (
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-1">
                    <CustomReactSelect
                      label={'Apply to all'}
                      dataTestId={`labware.${index}.roi-comments`}
                      name={`labware.${index}.roiComments`}
                      emptyOption={true}
                      options={selectOptionValues(comments, 'text', 'id')}
                      handleChange={async (val) => {
                        const comments = (val as OptionType[]).map((option) => option.value);
                        await setValues((prev) => {
                          return {
                            ...prev,
                            labware: prev.labware.map((labware, i) => {
                              if (i === index) {
                                return {
                                  ...labware,
                                  roiComments: comments,
                                  sectionsComments: labware.sectionsComments.map((sectionComment) => {
                                    return {
                                      ...sectionComment,
                                      comments
                                    };
                                  })
                                };
                              }
                              return labware;
                            })
                          };
                        });
                      }}
                      isMulti={true}
                      value={values.labware[index]?.roiComments?.map(
                        (commentId) => comments.find((comment) => comment.id === Number(commentId))?.text
                      )}
                    />
                  </div>
                  {values.labware[index]?.sectionsComments.length > 0 && (
                    <div className={'col-span-5'}>
                      <RoiTable
                        data={values.labware[index]?.sectionsComments}
                        actionColumn={{
                          Header: 'Comment',
                          accessor: 'comments',
                          Cell: (props: CellProps<SectionGroupsComments>) => {
                            return (
                              <CustomReactSelect
                                dataTestId={`labware.${index}.sectionsComments`}
                                name={`labware.${index}.sectionsComments.${props.row.index}.comments`}
                                emptyOption={true}
                                options={selectOptionValues(comments, 'text', 'id')}
                                isMulti={true}
                                value={values.labware[index]?.sectionsComments?.[props.row.index]?.comments?.map(
                                  (commentId) => comments.find((comment) => comment.id === Number(commentId))?.text
                                )}
                              />
                            );
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </Panel>
          )}
        </FieldArray>
      )}
    </div>
  );
};
