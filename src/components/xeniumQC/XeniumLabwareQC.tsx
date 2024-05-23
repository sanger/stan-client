import React from 'react';
import { CommentFieldsFragment, LabwareFlaggedFieldsFragment } from '../../types/sdk';
import RemoveButton from '../buttons/RemoveButton';
import Panel from '../Panel';
import WorkNumberSelect from '../WorkNumberSelect';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { selectOptionValues } from '../forms';
import { FieldArray, useFormikContext } from 'formik';
import { SampleComment, XeniumQCFormData } from '../../pages/XeniumQC';
import { CellProps } from 'react-table';
import StyledLink from '../StyledLink';
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
  console.log('XeniumLabwareQC', values.labware[index]?.sampleComments);
  return (
    <div className="max-w-screen-xl mx-auto" data-testid={'xenium-labware-qc'}>
      {labware && (
        <FieldArray name={'labware'}>
          {({ remove }) => (
            <Panel>
              <div className="grid grid-cols-2 mb-4">
                {labware.flagged && FlaggedBarcodeLink(labware.barcode)}
                {!labware.flagged && (
                  <StyledLink to={`/labware/${labware.barcode}`} target="_blank">
                    {labware.barcode}
                  </StyledLink>
                )}

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
              <div className={'grid grid-cols-2 gap-4'}>
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
              {!values.labware[index]?.sampleComments && (
                <Warning data-testid={'warning'} message={'No regions of interest recorded for this labware.'} />
              )}
              {values.labware[index]?.sampleComments?.length > 0 && (
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-2">
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
                                  sampleComments: labware.sampleComments.map((sampleComment) => {
                                    return {
                                      ...sampleComment,
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
                  {values.labware[index]?.sampleComments.length > 0 && (
                    <div className={'col-span-4'}>
                      <RoiTable
                        data={values.labware[index]?.sampleComments.map((data) => {
                          return {
                            roi: data.roi,
                            externalIdAddress: data.sampleAddress.map((sampleAddress) => {
                              return {
                                externalId: sampleAddress.sample.tissue.externalName ?? '',
                                address: sampleAddress.address
                              };
                            })
                          };
                        })}
                        actionColumn={{
                          Header: 'Comment',
                          accessor: 'comments',
                          Cell: (props: CellProps<SampleComment>) => {
                            return (
                              <CustomReactSelect
                                dataTestId={`labware.${index}.sampleComments`}
                                name={`labware.${index}.sampleComments.${props.row.index}.comments`}
                                emptyOption={true}
                                options={selectOptionValues(comments, 'text', 'id')}
                                isMulti={true}
                                value={values.labware[index]?.sampleComments?.[props.row.index]?.comments?.map(
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
