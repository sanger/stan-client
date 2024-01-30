import {
  CommentFieldsFragment,
  LabwareFlaggedFieldsFragment,
  ReactivateLabware,
  ReactivateLabwareMutation
} from '../types/sdk';
import { stanCore } from '../lib/sdk';
import Heading from '../components/Heading';
import WorkNumberSelect from '../components/WorkNumberSelect';
import { Form, Formik } from 'formik';
import LabwareScanner from '../components/labwareScanner/LabwareScanner';
import React, { useCallback } from 'react';
import * as Yup from 'yup';
import AppShell from '../components/AppShell';
import Warning from '../components/notifications/Warning';
import Panel from '../components/Panel';
import RemoveButton from '../components/buttons/RemoveButton';
import Labware from '../components/labware/Labware';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import createFormMachine from '../lib/machines/form/formMachine';
import { useMachine } from '@xstate/react';
import { useLoaderData } from 'react-router-dom';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { selectOptionValues } from '../components/forms';
import MutedText from '../components/MutedText';
import GrayBox, { Sidebar } from '../components/layouts/GrayBox';
import PinkButton from '../components/buttons/PinkButton';
import OperationCompleteModal from '../components/modal/OperationCompleteModal';

const validationSchema = Yup.object().shape({
  workNumber: Yup.string().required('SGP Number is a required field'),
  labwareToReactivate: Yup.array()
    .label('Labware')
    .min(1, 'Please scan in at least 1 labware to reactivate')
    .of(
      Yup.object().shape({
        barcode: Yup.string().required(),
        commentId: Yup.number().required('Reason to Reactivate is a required field')
      })
    )
});

type ReactivateFormValues = {
  workNumber?: string;
  labwareToReactivate:
    | [
        {
          barcode: string;
          commentId: number | undefined;
        }
      ]
    | undefined;
};

const formInitialValues: ReactivateFormValues = {
  workNumber: undefined,
  labwareToReactivate: undefined
};

export const Reactivate = () => {
  const comments = useLoaderData() as CommentFieldsFragment[];

  const isLabwareInactive = useCallback(
    (labwares: LabwareFlaggedFieldsFragment[], foundLabware: LabwareFlaggedFieldsFragment): string[] => {
      return !['destroyed', 'discarded', 'used'].includes(foundLabware.state)
        ? ['This labware is not discarded, destroyed or used.']
        : [];
    },
    []
  );

  const formSubmitMachine = React.useMemo(() => {
    return createFormMachine<ReactivateLabware[] | ReactivateLabware, ReactivateLabwareMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== 'SUBMIT_FORM') return Promise.reject();
          return stanCore.ReactivateLabware({
            items: e.values
          });
        }
      }
    });
  }, []);
  const [labwareToReactivate, setLabwareToReactivate] = React.useState<LabwareFlaggedFieldsFragment[]>([]);
  const [currentForm, sendForm] = useMachine(() => formSubmitMachine);

  const { serverError, submissionResult } = currentForm.context;

  const convertValuesAndSubmit = (formValues: ReactivateFormValues) => {
    const items: ReactivateLabware[] = [];
    formValues.labwareToReactivate!.forEach((labware) => {
      items.push({
        barcode: labware.barcode!,
        commentId: labware.commentId!,
        workNumber: formValues.workNumber!
      });
    });
    sendForm({ type: 'SUBMIT_FORM', values: items });
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Reactivate</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik<ReactivateFormValues>
            initialValues={formInitialValues}
            validationSchema={validationSchema}
            onSubmit={convertValuesAndSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <GrayBox>
                  <div className="md:w-3/4">
                    <div className="mb-8">
                      {serverError && <Warning error={serverError} />}
                      <Heading level={3}>SGP Number</Heading>
                      <p className="mt-2">Please select an SGP number to associate with all labware</p>
                      <div className="mt-4 md:w-1/2">
                        <WorkNumberSelect
                          name="workNumber"
                          onWorkNumberChange={(workNumber) => {
                            setFieldValue('workNumber', workNumber);
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Heading level={3}>Labware</Heading>
                      <MutedText>Please scan in the labware you wish to reactivate.</MutedText>
                      <LabwareScanner
                        onAdd={(lw) => {
                          const lwToReactivate = { barcode: lw.barcode, commentId: undefined };
                          values.labwareToReactivate === undefined
                            ? (values.labwareToReactivate = [lwToReactivate])
                            : values.labwareToReactivate.push(lwToReactivate);

                          setLabwareToReactivate((prevState) => [...prevState, lw]);
                        }}
                        labwareCheckFunction={isLabwareInactive}
                      >
                        {({ labwares, removeLabware }) =>
                          labwares.map((labware, index) => (
                            <Panel key={labware.barcode}>
                              <div className="flex flex-row items-center justify-end">
                                {
                                  <RemoveButton
                                    data-testid={'remove'}
                                    onClick={() => {
                                      setFieldValue(
                                        'labwareToReactivate',
                                        values.labwareToReactivate!.filter((lw) => {
                                          return lw.barcode !== labware.barcode;
                                        })
                                      );
                                      setLabwareToReactivate((prevState) =>
                                        prevState.filter((lw) => {
                                          return lw.barcode !== labware.barcode;
                                        })
                                      );
                                      removeLabware(labware.barcode);
                                    }}
                                  />
                                }
                              </div>
                              <div className="flex flex-row">
                                <div className="flex flex-col w-full" data-testid={'labware'}>
                                  <Labware labware={labware} name={labware.labwareType.name} />
                                </div>
                                <div className="flex flex-col w-full bg-gray-100">
                                  <div className="flex flex-row w-full p-4">
                                    <CustomReactSelect
                                      label={'Reason to Reactivate'}
                                      name={`labwareToReactivate[${index}].commentId`}
                                      dataTestId={`labwareToReactivate[${index}].commentId`}
                                      emptyOption={true}
                                      options={selectOptionValues(comments, 'text', 'id')}
                                      handleChange={(option) => {
                                        const selectedComment = option as OptionType;
                                        if (selectedComment) {
                                          setFieldValue(
                                            `labwareToReactivate[${index}].commentId`,
                                            Number(selectedComment.value)
                                          );
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="pt-4">
                                <Table>
                                  <TableHead>
                                    <tr>
                                      <TableHeader>External ID</TableHeader>
                                      <TableHeader>Donor Id </TableHeader>
                                      <TableHeader>Tissue type</TableHeader>
                                      <TableHeader>Spatial Location</TableHeader>
                                      <TableHeader>Replicate</TableHeader>
                                      <TableHeader>Section Number</TableHeader>
                                    </tr>
                                  </TableHead>
                                  <TableBody>
                                    {labware.slots.flatMap((slot) => {
                                      return slot.samples.flatMap((sample) => {
                                        return (
                                          <tr key={`${labware.barcode}-${slot.address}-${sample.id}`}>
                                            <TableCell>{sample.tissue.externalName}</TableCell>
                                            <TableCell>{sample.tissue.donor.donorName}</TableCell>
                                            <TableCell>{sample.tissue.spatialLocation.tissueType.name}</TableCell>
                                            <TableCell>{sample.tissue.spatialLocation.code}</TableCell>
                                            <TableCell>{sample.tissue.replicate!}</TableCell>
                                            <TableCell>{sample.section}</TableCell>
                                          </tr>
                                        );
                                      });
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </Panel>
                          ))
                        }
                      </LabwareScanner>
                    </div>
                  </div>

                  <Sidebar data-testid={'summary'}>
                    <Heading level={3} showBorder={false}>
                      Summary
                    </Heading>

                    {labwareToReactivate.length > 0 ? (
                      <p>
                        <span className="font-semibold">{labwareToReactivate.length}</span> piece(s) of labware will be
                        reactivated
                      </p>
                    ) : (
                      <p className="italic text-sm">Please scan labwares.</p>
                    )}

                    <PinkButton disabled={labwareToReactivate.length === 0} type="submit" className="sm:w-full">
                      Reactivate
                    </PinkButton>
                  </Sidebar>

                  <OperationCompleteModal
                    show={submissionResult !== undefined}
                    message="All labware have been successfully reactivated."
                  >
                    <p>
                      If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to
                      the Home screen.
                    </p>
                  </OperationCompleteModal>
                </GrayBox>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
