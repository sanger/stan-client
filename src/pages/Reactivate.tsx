import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
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
import OperationCompleteModal from '../components/modal/OperationCompleteModal';
import createFormMachine from '../lib/machines/form/formMachine';
import { useMachine } from '@xstate/react';
import { useLoaderData } from 'react-router-dom';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { selectOptionValues } from '../components/forms';
import MutedText from '../components/MutedText';
import BlueButton from '../components/buttons/BlueButton';

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
    (labwares: LabwareFieldsFragment[], foundLabware: LabwareFieldsFragment): string[] => {
      return foundLabware.discarded === false || !foundLabware.destroyed === false
        ? ['This labware is neither discarded nor destroyed.']
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
            request: e.values
          });
        }
      }
    });
  }, []);
  const [currentForm, sendForm] = useMachine(() => formSubmitMachine);

  const { serverError, submissionResult } = currentForm.context;

  const convertValuesAndSubmit = (formValues: ReactivateFormValues) => {
    const items: ReactivateLabware[] = [];
    console.log('==== convertValuesAndSubmit ====');
    console.log(formValues);
    formValues.labwareToReactivate!.forEach((labware) => {
      items.push({
        barcode: labware.barcode!,
        commentId: labware.commentId!,
        workNumber: formValues.workNumber!
      });
    });
    console.log('==== items ====');
    console.log(items);
    sendForm({ type: 'SUBMIT_FORM', values: items });
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Reactivate</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <Formik<ReactivateFormValues>
          initialValues={formInitialValues}
          validationSchema={validationSchema}
          onSubmit={convertValuesAndSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="max-w-screen-xl mx-auto">
                <div className="space-y-2">
                  {serverError && <Warning error={serverError} />}
                  <Heading level={2}>SGP Number</Heading>
                  <p>Select an SGP number to associate with all labware.</p>
                  <div className="mt-4 md:w-1/2">
                    <WorkNumberSelect
                      name="workNumber"
                      onWorkNumberChange={(workNumber) => {
                        setFieldValue('workNumber', workNumber);
                      }}
                    />
                  </div>
                </div>
                <div className="mt-8 space-y-2">
                  <Heading level={2}>Labware</Heading>
                  <MutedText>Please scan in the labware you wish to reactivate.</MutedText>
                  <LabwareScanner
                    onAdd={(lw) => {
                      console.log('==== onAdd ================');
                      console.log(lw);
                      const lwToReactivate = { barcode: lw.barcode, commentId: undefined };
                      values.labwareToReactivate === undefined
                        ? (values.labwareToReactivate = [lwToReactivate])
                        : values.labwareToReactivate.push(lwToReactivate);
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
                  {values.labwareToReactivate && values.labwareToReactivate.length > 0 && (
                    <div className={'sm:flex mt-4 sm:flex-row justify-end'} key="submit">
                      <BlueButton type="submit">Reactivate</BlueButton>
                    </div>
                  )}
                </div>
              </div>
              <OperationCompleteModal
                show={submissionResult !== undefined}
                message="All labware have been successfully reactivated."
              >
                <p>
                  If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the
                  Home screen.
                </p>
              </OperationCompleteModal>
            </Form>
          )}
        </Formik>
      </AppShell.Main>
    </AppShell>
  );
};
