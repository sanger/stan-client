import React, { useCallback, useEffect } from 'react';
import AppShell from '../components/AppShell';
import BlueButton from '../components/buttons/BlueButton';
import Warning from '../components/notifications/Warning';
import Success from '../components/notifications/Success';
import { toast } from 'react-toastify';
import { useScrollToRef } from '../lib/hooks';
import { useMachine } from '@xstate/react';
import { Link, useNavigate } from 'react-router-dom';
import { reload } from '../lib/sdk';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Heading from '../components/Heading';
import reagentTransferMachine from '../lib/machines/reagentTransfer/reagentTransferMachine';
import DualIndexPlateComponent from '../components/libraryGeneration/DualIndexPlateComponent';

/**
 * Success notification when slots have been copied
 */
const ToastSuccess = () => <Success message={'Reagents transferred'} />;

export const PLATE_TYPES = ['Fresh frozen - Dual Index TT Set A', 'FFPE - Dual Index TS Set A'];

function DualIndexPlate() {
  const [current, send] = useMachine(reagentTransferMachine);

  const navigate = useNavigate();
  const { serverErrors, reagentTransfers, workNumber, plateType } = current.context;

  const handleWorkNumberChange = useCallback(
    (workNumber: string) => {
      if (workNumber) {
        send({ type: 'UPDATE_WORK_NUMBER', workNumber });
      }
    },
    [send]
  );

  /**
   * When we get into the "copied" state, show a success message
   */
  useEffect(() => {
    if (current.value === 'transferred') {
      toast(ToastSuccess, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true
      });
    }
  }, [current.value]);

  /**
   * When there's an error returned from the server, scroll to it
   */
  const [ref, scrollToRef] = useScrollToRef();
  useEffect(() => {
    if (serverErrors != null) {
      scrollToRef();
    }
  }, [serverErrors, scrollToRef]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Dual Index Plate</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          {serverErrors && (
            <div ref={ref} className="mb-4">
              <Warning error={serverErrors} />
            </div>
          )}

          <div className="mb-8">
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">Please select an SGP number to associate with this operation.</p>
            <div className="my-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
            </div>
          </div>
          <DualIndexPlateComponent send={send} current={current} />
        </div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 shrink-0">
        <div className="flex flex-row items-center justify-end space-x-2">
          {!current.matches('transferred') ? (
            <BlueButton
              disabled={reagentTransfers.length <= 0 || workNumber === '' || !PLATE_TYPES.includes(plateType)}
              onClick={() => send({ type: 'SAVE' })}
            >
              Save
            </BlueButton>
          ) : (
            <>
              <BlueButton onClick={() => reload(navigate)} action="tertiary">
                Reset Form
              </BlueButton>
              <Link to={'/'}>
                <BlueButton action="primary">Return Home</BlueButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default DualIndexPlate;
