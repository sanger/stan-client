import React, { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';
import Labware, { LabwareImperativeRef } from './labware/Labware';
import { LayoutContext, LayoutEvents } from '../lib/machines/layout';
import { removeSourceFromSlotDest, selectDestination, selectSource } from '../lib/machines/layout/layoutEvents';
import { buildSlideSampleColors, buildSlotColor, buildSlotText } from '../pages/sectioning';
import { ActorRef, MachineSnapshot } from 'xstate';
import { Position, sampleTextColor } from '../lib/helpers';
import warningToast from './notifications/WarningToast';
import { toast } from 'react-toastify';

interface LayoutPlannerProps {
  actor: ActorRef<MachineSnapshot<LayoutContext, LayoutEvents, any, any, any, any, any, any>, any>;
  children: React.ReactNode;
}

const LayoutPlanner: React.FC<LayoutPlannerProps> = ({ children, actor }) => {
  const [context, setContext] = React.useState<LayoutContext>(actor.getSnapshot().context);
  const { layoutPlan, selected, errorMessage } = context ?? {};
  React.useEffect(() => {
    const subscription = actor.subscribe((snapshot) => {
      setContext(snapshot.context ?? {});
    });
    return () => subscription.unsubscribe();
  }, [actor]);

  const labwareRef = useRef<LabwareImperativeRef>();

  // Source buttons match the slide: a sample placed on this slide gets its
  // slide colour, and a sample not placed yet gets a white button
  const slideColors = buildSlideSampleColors(layoutPlan);
  const sourceButtonColor = (sampleId: number) => {
    const bgColor = slideColors.get(sampleId);
    return bgColor ? `${bgColor} ${sampleTextColor(bgColor)}` : 'bg-white border border-gray-500 text-gray-900';
  };

  const deselectLabwareSlots = React.useCallback(() => {
    labwareRef.current?.deselectAll();
  }, [labwareRef]);

  useEffect(() => {
    deselectLabwareSlots();
  }, [deselectLabwareSlots, layoutPlan.plannedActions]);

  useEffect(() => {
    if (errorMessage) {
      warningToast({
        message: errorMessage,
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 7000
      });
      actor.send({
        type: 'RESET_ERROR_MESSAGE'
      });
      deselectLabwareSlots();
    }
  }, [actor, errorMessage, deselectLabwareSlots]);

  return (
    <div>
      {children}
      {layoutPlan?.destinationLabware &&
        layoutPlan?.destinationLabware.numColumns > 10 &&
        layoutPlan?.sources &&
        layoutPlan?.sources?.length > 0 && (
          <div className="mt-2 grid gap-2 grid-cols-6">
            {layoutPlan.sources.map((source, i) => (
              <div key={i} className="">
                <span
                  onClick={() => {
                    actor.send(selectSource(source));
                  }}
                  className={`${isEqual(source, selected) && 'ring-2 ring-offset-2 ring-gray-700'} ${sourceButtonColor(
                    source.sampleId
                  )} text-center inline-block py-1 px-2 rounded-full text-xs font-semibold cursor-pointer select-none`}
                >
                  <p>{source.labware.barcode}</p>
                  <p>{source.tissue?.externalName}</p>
                </span>
              </div>
            ))}
          </div>
        )}
      <div className="my-6 md:flex md:flex-row md:items-centre md:justify-around">
        <div>
          {layoutPlan?.destinationLabware && (
            <Labware
              labwareRefCallback={(el: LabwareImperativeRef) => {
                if (el) {
                  labwareRef.current = el;
                }
              }}
              labware={layoutPlan.destinationLabware}
              name={layoutPlan.destinationLabware.labwareType.name}
              selectionMode={'multi'}
              selectable={'any'}
              onSlotClick={(address) => actor.send(selectDestination(address))}
              onSlotCtrlClick={(address) => actor.send(removeSourceFromSlotDest(address))}
              slotText={(address) => buildSlotText(layoutPlan, address)}
              slotColor={(address) => buildSlotColor(layoutPlan, address)}
              barcodeInfoPosition={Position.TopRight}
              sectionGroups={layoutPlan.plannedActions}
              onSelect={(selectedAddresses) => {
                actor.send({
                  type: 'ASSIGN_SELECTED_SLOTS',
                  selectedSlots: new Set(selectedAddresses)
                });
              }}
            />
          )}
        </div>
        {layoutPlan?.destinationLabware &&
          layoutPlan?.destinationLabware.numColumns < 11 &&
          layoutPlan?.sources &&
          layoutPlan?.sources?.length > 0 && (
            <div className="mt-2 grid gap-2 grid-cols-3">
              {layoutPlan.sources.map((source, i) => (
                <div key={i} className="">
                  <span
                    onClick={() => {
                      actor.send(selectSource(source));
                    }}
                    className={`${
                      isEqual(source, selected) && 'ring-2 ring-offset-2 ring-gray-700'
                    } ${sourceButtonColor(
                      source.sampleId
                    )} text-center inline-block py-1 px-2 rounded-full text-xs font-semibold cursor-pointer select-none`}
                  >
                    <p>{source.labware.barcode}</p>
                    <p>{source.tissue?.externalName}</p>
                  </span>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default LayoutPlanner;
