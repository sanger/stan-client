import AppShell from '../../components/AppShell';
import React from 'react';
import CustomReactSelect, { OptionType } from '../../components/forms/CustomReactSelect';
import { useLoaderData } from 'react-router-dom';
import { GetEventTypesQuery } from '../../types/sdk';
import BlueButton from '../../components/buttons/BlueButton';
import WorkNumberSelect from '../../components/WorkNumberSelect';
import GrayBox, { Sidebar } from '../../components/layouts/GrayBox';
import Heading from '../../components/Heading';
import PinkButton from '../../components/buttons/PinkButton';
import { useMachine } from '@xstate/react';
import { Input } from '../../components/forms/Input';
import { reviseWorkNumberMachine } from './ReviseWorkNumber.machine';
import Label from '../../components/forms/Label';
import Table, { TableBody, TableCell, TableHeader } from '../../components/Table';
import OperationCompleteModal from '../../components/modal/OperationCompleteModal';
import Warning from '../../components/notifications/Warning';

export const ReviseWorkNumber = () => {
  const events = useLoaderData() as GetEventTypesQuery;

  const [currentReviseMachine, sendReviseMachine] = useMachine(reviseWorkNumberMachine, {
    input: {
      barcode: '',
      eventType: '',
      opIds: [],
      workNumber: '',
      operations: [],
      selectedOps: []
    }
  });

  const { workNumber, eventType, barcode, operations, selectedOps, submissionResult, serverError } =
    currentReviseMachine.context;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Revise Work Number</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <GrayBox>
            <div className="md:w-3/4 space-x-4 space-y-4 ">
              {serverError && <Warning error={serverError} />}
              <Heading level={3}>SGP Number</Heading>
              <p>Select the new work number to assign to the selected operations</p>
              <div className="grid grid-cols-2">
                <WorkNumberSelect
                  label={''}
                  dataTestId={'workNumber'}
                  onWorkNumberChange={(_workNumber) => {
                    sendReviseMachine({ type: 'SET_WORK_NUMBER', workNumber: _workNumber });
                  }}
                />
              </div>
              <div className="pt-4 space-y-4">
                <Heading level={3}>Operations</Heading>
                <p>Search operations by barcode and event type:</p>
                <div className="grid grid-cols-2 gap-x-10">
                  <Label name={''}>
                    Labware barcode
                    <Input
                      data-testid={'barcode'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        sendReviseMachine({ type: 'SET_BARCODE', barcode: e.target.value });
                      }}
                    />
                  </Label>
                  <CustomReactSelect
                    label="Event Type"
                    dataTestId="eventType"
                    options={events.eventTypes.sort().map((event) => {
                      return { label: event, value: event };
                    })}
                    handleChange={(value) => {
                      sendReviseMachine({ type: 'SET_EVENT_TYPE', eventType: (value as OptionType).value });
                    }}
                  />
                </div>
                <div className="flex flex-row justify-end mt-8">
                  <BlueButton
                    data-testid={'search-operations'}
                    disabled={eventType.length === 0 || barcode.length === 0}
                    loading={currentReviseMachine.matches('find_operations')}
                    onClick={() => {
                      sendReviseMachine({ type: 'FIND_OPERATIONS' });
                    }}
                  >
                    Search
                  </BlueButton>
                </div>
              </div>
              <div>
                {operations.length > 0 ? (
                  <Table data-testid={'operations-table'}>
                    <TableHeader>Operation Id</TableHeader>
                    <TableHeader>Operation Name</TableHeader>
                    <TableHeader>User</TableHeader>
                    <TableHeader>Performed</TableHeader>
                    <TableHeader></TableHeader>
                    <TableBody>
                      {operations.map((operation) => (
                        <tr key={operation.id}>
                          <TableCell>{operation.id}</TableCell>
                          <TableCell>{operation.operationType.name}</TableCell>
                          <TableCell>{operation.user.username}</TableCell>
                          <TableCell>{operation.performed}</TableCell>
                          <TableCell>
                            <Input
                              type="checkbox"
                              data-testid="active"
                              checked={selectedOps.some((opId) => opId === operation.id)}
                              onChange={() => {
                                sendReviseMachine({
                                  type: 'TOGGLE_OPERATION',
                                  opId: operation.id
                                });
                              }}
                            />
                          </TableCell>
                        </tr>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="italic text-sm">No operations found for this search.</p>
                )}
              </div>
            </div>

            <Sidebar data-testid={'summary'}>
              <Heading level={3} showBorder={false}>
                Summary
              </Heading>

              {workNumber.length === 0 && <p>Select an SGP number to assign to the selected operations.</p>}
              {selectedOps.length === 0 && <p>Search for operations by barcode and event type</p>}

              {selectedOps.length > 0 && (
                <p>
                  <span className="font-semibold">{selectedOps.length}</span> operation(s) will be assigned to the
                  selected work number {workNumber && <span className="font-semibold"> {workNumber}</span>}.
                </p>
              )}

              <PinkButton
                data-testid={'submit'}
                disabled={selectedOps.length === 0 || workNumber.length === 0}
                loading={currentReviseMachine.matches('submitting')}
                type="submit"
                className="sm:w-full"
                onClick={() => {
                  sendReviseMachine({ type: 'SUBMIT' });
                }}
              >
                Submit
              </PinkButton>
            </Sidebar>
          </GrayBox>
          <OperationCompleteModal
            show={currentReviseMachine.matches('final') && submissionResult !== undefined}
            message={submissionResult}
          >
            <p>
              If you wish to start the process again, click the "Reset Form" button. Otherwise you can return to the
              Home screen.
            </p>
          </OperationCompleteModal>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
