import React, { useCallback, useContext, useEffect, useRef } from 'react';

import {
  CommentFieldsFragment,
  LabwareFlaggedFieldsFragment,
  LabwareSampleComments,
  SampleAddressComment
} from '../types/sdk';
import AppShell from '../components/AppShell';
import WorkNumberSelect from '../components/WorkNumberSelect';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import Heading from '../components/Heading';
import { StanCoreContext } from '../lib/sdk';
import Panel from '../components/Panel';
import RemoveButton from '../components/buttons/RemoveButton';
import Labware from '../components/labware/Labware';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { selectOptionValues } from '../components/forms';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import { formatDateTimeForCore, getCurrentDateTime } from '../types/stan';
import BlueButton from '../components/buttons/BlueButton';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import Warning from '../components/notifications/Warning';
import { useLoaderData } from 'react-router-dom';
import Label from '../components/forms/Label';
import warningToast from '../components/notifications/WarningToast';
import { toast } from 'react-toastify';
import { omit } from 'lodash';
import { ClientError } from 'graphql-request';
import Success from '../components/notifications/Success';
import MutedText from '../components/MutedText';

type CompletionRequestForm = {
  operationType: string;
  workNumber: string;
  globalComments: number[];
  labware: LabwareSampleComments;
};

type ProbeHybridisationQCFormValues = {
  request: Array<CompletionRequestForm>;
};

const getCommentTextFromField = (
  values: ProbeHybridisationQCFormValues,
  barcode: string,
  address: string,
  sampleId: number
): string[] => {
  const labwareComments = values.request.find((rq) => rq.labware.barcode === barcode);
  if (labwareComments && labwareComments.labware.comments) {
    const comments = labwareComments.labware.comments.filter((c) => c.sampleId === sampleId && c.address === address);
    if (comments) {
      return comments.map((comment) => comment.commentId.toString());
    }
  }
  return [];
};

const displayWarningMsg = (msg: string) => {
  warningToast({
    message: msg,
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 5000
  });
};

export default function ProbeHybridisationQC() {
  const comments = useLoaderData() as CommentFieldsFragment[];
  const stanCore = useContext(StanCoreContext);
  const resultRef = useRef<HTMLDivElement>(null);
  // Scroll the mutation result into view if it appears
  useEffect(() => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  const [globalWorkNumber, setGlobalWorkNumber] = React.useState('');
  const [globalCompletionTime, setGlobalCompletionTime] = React.useState(getCurrentDateTime());
  const [formValues, setFormValues] = React.useState<ProbeHybridisationQCFormValues>({ request: [] });
  const [submissionError, setSubmissionError] = React.useState<Array<ClientError>>([]);
  const [submissionSuccess, setSubmissionSuccess] = React.useState<Array<String>>([]);

  const resetSubmissionResult = useCallback(() => {
    setSubmissionError([]);
    setSubmissionSuccess([]);
  }, []);

  const updateWorkNumbersFromGlobal = useCallback(
    (workNumber: string) => {
      resetSubmissionResult();
      setFormValues((prev) => {
        return {
          ...prev,
          request: prev.request.map((rq) => {
            return {
              ...rq,
              workNumber
            };
          })
        };
      });
    },
    [resetSubmissionResult]
  );

  const updateCompletionTimesFromGlobal = useCallback((completionTime: string) => {
    setFormValues((prev) => {
      return {
        ...prev,
        request: prev.request.map((rq) => {
          return {
            ...rq,
            labware: {
              ...rq.labware,
              completion: formatDateTimeForCore(completionTime)
            }
          };
        })
      };
    });
  }, []);

  const onAddLabware = useCallback(
    (labware: LabwareFlaggedFieldsFragment) => {
      resetSubmissionResult();
      setFormValues((prev) => {
        return {
          ...prev,
          request: prev.request.concat({
            labware: {
              barcode: labware.barcode,
              completion: globalCompletionTime,
              comments: []
            },
            globalComments: [],
            workNumber: globalWorkNumber,
            operationType: 'Probe hybridisation QC'
          })
        };
      });
    },
    [globalWorkNumber, resetSubmissionResult, globalCompletionTime]
  );

  const validateProbeHybridisationQcLabware = useCallback(
    async (labwares: LabwareFlaggedFieldsFragment[], foundLabware: LabwareFlaggedFieldsFragment): Promise<string[]> => {
      return stanCore
        .FindLatestOperation({
          barcode: foundLabware.barcode,
          operationType: 'Probe hybridisation Xenium'
        })
        .then((response) => {
          return response.findLatestOp !== null
            ? []
            : [
                `No Probe Hybridisation Xenium operation has been recorded on the following labware: ${foundLabware.barcode}`
              ];
        });
    },
    [stanCore]
  );

  const removeLabwareFromForm = useCallback(
    (removeLabware: (barcode: string) => void, barcode: string) => {
      removeLabware(barcode);
      resetSubmissionResult();

      setFormValues((prev) => {
        return {
          ...prev,
          request: prev.request.filter((rq) => rq.labware.barcode !== barcode)
        };
      });
    },
    [resetSubmissionResult]
  );

  const convertValuesAndSubmit = () => {
    resetSubmissionResult();
    formValues.request.forEach(async (data) => {
      await stanCore
        .RecordCompletion({
          request: {
            ...omit(data, 'globalComments'),
            labware: [
              {
                ...data.labware
              }
            ]
          }
        })
        .then((response) => {
          setSubmissionSuccess((prev) => {
            return [...prev, data.labware.barcode];
          });
        })
        .catch((error) => {
          setSubmissionError((prev) => {
            return [...prev, error];
          });
        });
    });
  };

  const mapCommentOptionsToValues = useCallback((options: OptionType[]) => {
    return options.map((v) => parseInt(v.value));
  }, []);

  const updateSectionCommentsFromGlobal = useCallback(
    (options: OptionType[], labware: LabwareFlaggedFieldsFragment) => {
      resetSubmissionResult();
      const selectedComments = mapCommentOptionsToValues(options);
      const updatedSampleAddressComments: Array<SampleAddressComment> = labware.slots.flatMap((slot) => {
        return slot.samples.flatMap((sample) => {
          return selectedComments.map((commentId) => {
            return {
              sampleId: sample.id,
              address: slot.address,
              commentId
            };
          });
        });
      });
      setFormValues((prev) => {
        return {
          ...prev,
          request: prev.request.map((rq) => {
            if (rq.labware.barcode === labware.barcode) {
              return {
                ...rq,
                globalComments: selectedComments,
                labware: {
                  ...rq.labware,
                  comments: updatedSampleAddressComments
                }
              };
            } else {
              return rq;
            }
          })
        };
      });
    },
    [mapCommentOptionsToValues, resetSubmissionResult]
  );

  const validateCompletionDateTime = (selectedTime: string) => {
    if (new Date(selectedTime) > new Date()) {
      displayWarningMsg('Please select a time on or before current time');
      return false;
    }
    return true;
  };

  const isFormValid = React.useCallback(() => {
    return formValues.request.length > 0 && formValues.request.every((rq) => rq.workNumber !== '');
  }, [formValues]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Probe Hybridisation QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="space-y-2">
            {submissionError.length > 0 && (
              <div className="mt-4" ref={resultRef}>
                {submissionError.map((error, index) => (
                  <Warning error={error} key={index} />
                ))}
                {submissionSuccess.length > 0 && (
                  <Success
                    message={`Probe Hybridisation QC recorded for the following labware: ${submissionSuccess.join(
                      ', '
                    )}`}
                  />
                )}
              </div>
            )}
          </div>
          <div className="mt-8 space-y-2">
            <div className="grid grid-cols-2 gap-x-1">
              <div>
                <Heading level={4}>SGP Number</Heading>
                <MutedText>Select an SGP number to apply to all the scanned labware.</MutedText>
                <div className="mt-4 md:w-1/2">
                  <WorkNumberSelect
                    dataTestId="globalWorkNumber"
                    onWorkNumberChange={(workNumber) => {
                      setGlobalWorkNumber(workNumber);
                      updateWorkNumbersFromGlobal(workNumber);
                    }}
                  />
                </div>
              </div>
              <div className="">
                <Heading level={4}>Completion Time</Heading>
                <MutedText>Select a completion to apply to all the scanned labware.</MutedText>
                <input
                  className="rounded-md border border-gray-300 w-1/2 p-2 mt-1"
                  data-testid={'globalCompletionDateTime'}
                  type="datetime-local"
                  max={getCurrentDateTime()}
                  value={globalCompletionTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (validateCompletionDateTime(e.target.value)) {
                      setGlobalCompletionTime(e.target.value);
                      updateCompletionTimesFromGlobal(e.target.value);
                    }
                  }}
                />
              </div>
            </div>
            <Heading level={2}>Slides</Heading>
            <p>Please scan a slide</p>
            <LabwareScanner
              onAdd={onAddLabware}
              labwareCheckFunction={validateProbeHybridisationQcLabware}
              checkForCleanedOutAddresses
              enableFlaggedLabwareCheck
            >
              {({ labwares, removeLabware, cleanedOutAddresses }) =>
                labwares.map((labware, index) => {
                  return (
                    <Panel key={labware.barcode}>
                      <div className="flex flex-row items-center justify-end">
                        {
                          <RemoveButton
                            data-testid={'remove'}
                            onClick={() => {
                              removeLabwareFromForm(removeLabware, labware.barcode);
                            }}
                          />
                        }
                      </div>
                      <div className="flex flex-row">
                        <div className="flex flex-col w-full mr-3" data-testid={'labware'}>
                          <Labware
                            labware={labware}
                            name={labware.labwareType.name}
                            cleanedOutAddresses={cleanedOutAddresses?.get(labware.id)}
                          />
                        </div>
                        <div className="flex flex-col w-full bg-gray-100 ml-3">
                          <div className="grid grid-cols-2 gap-4 m-4">
                            <div>
                              <Label name="SGP Number" className={'whitespace-nowrap'} />
                              <WorkNumberSelect
                                onWorkNumberChange={(workNumber) => {
                                  resetSubmissionResult();
                                  setFormValues((prev) => {
                                    return {
                                      ...prev,
                                      request: prev.request.map((rq) => {
                                        if (rq.labware.barcode === labware.barcode) {
                                          return {
                                            ...rq,
                                            workNumber
                                          };
                                        } else {
                                          return rq;
                                        }
                                      })
                                    };
                                  });
                                }}
                                workNumber={
                                  formValues.request.find((rq) => rq.labware.barcode === labware.barcode)?.workNumber ||
                                  ''
                                }
                              />
                            </div>
                            <div>
                              <label htmlFor={'completionDateTime'} className={'whitespace-nowrap'}>
                                Completion Time
                              </label>
                              <input
                                className="rounded-md border border-gray-300 p-2 bg-white"
                                data-testid={'completionDateTime'}
                                type="datetime-local"
                                max={getCurrentDateTime()}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  resetSubmissionResult();
                                  if (validateCompletionDateTime(e.target.value)) {
                                    setFormValues((prev) => {
                                      return {
                                        ...prev,
                                        request: prev.request.map((rq) => {
                                          if (rq.labware.barcode === labware.barcode) {
                                            return {
                                              ...rq,
                                              labware: {
                                                ...rq.labware,
                                                completion: formatDateTimeForCore(e.target.value)
                                              }
                                            };
                                          } else {
                                            return rq;
                                          }
                                        })
                                      };
                                    });
                                  }
                                }}
                                value={
                                  formValues.request.find((rq) => rq.labware.barcode === labware.barcode)?.labware
                                    .completion || globalCompletionTime
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-row w-full p-4">
                            <CustomReactSelect
                              className="w-3/4"
                              label={'Comment'}
                              dataTestId="globalComment"
                              emptyOption={true}
                              options={selectOptionValues(comments, 'text', 'id')}
                              isMulti={true}
                              handleChange={(options) => {
                                updateSectionCommentsFromGlobal(options as OptionType[], labware);
                              }}
                              value={() => {
                                return (
                                  formValues.request.find((rq) => rq.labware.barcode === labware.barcode)
                                    ?.globalComments || []
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Table>
                          <TableHead>
                            <tr>
                              <TableHeader>Address</TableHeader>
                              <TableHeader>Section Number</TableHeader>
                              <TableHeader>Donor Id </TableHeader>
                              <TableHeader>Tissue type</TableHeader>
                              <TableHeader>Spatial Location</TableHeader>
                              <TableHeader>Replicate</TableHeader>
                              <TableHeader>Comment</TableHeader>
                            </tr>
                          </TableHead>
                          <TableBody>
                            {labware.slots.flatMap((slot) => {
                              return slot.samples.flatMap((sample) => {
                                return (
                                  <tr key={`${labware.barcode}-${slot.address}-${sample.id}`}>
                                    <TableCell width={100}>{slot.address}</TableCell>
                                    <TableCell width={120}>{sample.section}</TableCell>
                                    <TableCell width={200}>{sample.tissue.donor.donorName}</TableCell>
                                    <TableCell width={200}>{sample.tissue.spatialLocation.tissueType.name}</TableCell>
                                    <TableCell width={100}>{sample.tissue.spatialLocation.code}</TableCell>
                                    <TableCell>{sample.tissue.replicate!}</TableCell>
                                    <TableCell className="w-full">
                                      <CustomReactSelect
                                        isMulti={true}
                                        options={selectOptionValues(comments, 'text', 'id')}
                                        value={getCommentTextFromField(
                                          formValues,
                                          labware.barcode,
                                          slot.address,
                                          sample.id
                                        )}
                                        handleChange={(values) => {
                                          const updatedSampleAddressComments: Array<SampleAddressComment> =
                                            mapCommentOptionsToValues(values as OptionType[]).map((commentId) => {
                                              return {
                                                sampleId: sample.id,
                                                address: slot.address,
                                                commentId
                                              };
                                            });
                                          setFormValues((prev) => {
                                            return {
                                              ...prev,
                                              request: prev.request.map((rq) => {
                                                if (rq.labware.barcode === labware.barcode) {
                                                  return {
                                                    ...rq,
                                                    labware: {
                                                      ...rq.labware,
                                                      comments: updatedSampleAddressComments.concat(
                                                        rq.labware.comments.filter((c) => {
                                                          return c.sampleId !== sample.id || c.address !== slot.address;
                                                        })
                                                      )
                                                    }
                                                  };
                                                } else {
                                                  return rq;
                                                }
                                              })
                                            };
                                          });
                                        }}
                                      />
                                    </TableCell>
                                  </tr>
                                );
                              });
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </Panel>
                  );
                })
              }
            </LabwareScanner>
            <div className={'sm:flex mt-4 sm:flex-row justify-end'} key="submit">
              <BlueButton type="submit" disabled={!isFormValid()} onClick={convertValuesAndSubmit}>
                Save
              </BlueButton>
            </div>
          </div>
        </div>
        <OperationCompleteModal
          show={submissionSuccess.length > 0 && submissionError.length === 0}
          message="Probe Hybridisation QC recorded for all labware(s)"
        >
          <p>
            If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the Home
            screen.
          </p>
        </OperationCompleteModal>
      </AppShell.Main>
    </AppShell>
  );
}
