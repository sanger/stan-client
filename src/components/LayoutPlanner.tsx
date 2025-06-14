import React from 'react';
import { isEqual } from 'lodash';
import Labware from './labware/Labware';
import { LayoutContext, LayoutEvents } from '../lib/machines/layout';
import {
  removeSection,
  selectDestination,
  selectSource,
  setAllDestinations
} from '../lib/machines/layout/layoutEvents';
import { buildSlotColor, buildSlotSecondaryText, buildSlotText } from '../pages/sectioning';
import { ActorRef, MachineSnapshot } from 'xstate';
import { Position } from '../lib/helpers';

interface LayoutPlannerProps {
  actor: ActorRef<MachineSnapshot<LayoutContext, LayoutEvents, any, any, any, any, any, any>, any>;
  children: React.ReactNode;
}

const LayoutPlanner: React.FC<LayoutPlannerProps> = ({ children, actor }) => {
  const [context, setContext] = React.useState<LayoutContext>(actor.getSnapshot().context);
  const { layoutPlan, selected } = context ?? {};
  React.useEffect(() => {
    const subscription = actor.subscribe((snapshot) => {
      setContext(snapshot.context ?? {});
    });
    return () => subscription.unsubscribe();
  }, [actor]);

  return (
    <div>
      {children}
      <div className="my-6 md:flex md:flex-row md:items-centre md:justify-around">
        <div className="">
          {layoutPlan?.destinationLabware && (
            <Labware
              labware={layoutPlan.destinationLabware}
              name={layoutPlan.destinationLabware.labwareType.name}
              selectable={'none'}
              onSlotClick={(address) => actor.send(selectDestination(address))}
              onSlotCtrlClick={(address) => actor.send(removeSection(address))}
              slotText={(address) => buildSlotText(layoutPlan, address)}
              slotSecondaryText={(address) => buildSlotSecondaryText(layoutPlan, address)}
              slotColor={(address) => buildSlotColor(layoutPlan, address)}
              barcodeInfoPosition={Position.TopRight}
            />
          )}
        </div>
        {layoutPlan?.sources && layoutPlan?.sources?.length > 0 && (
          <div className="mt-2 grid gap-2 grid-cols-3">
            {layoutPlan.sources.map((source, i) => (
              <div key={i} className="">
                <span
                  onClick={() => {
                    actor.send(selectSource(source));
                  }}
                  onDoubleClick={() => {
                    actor.send(setAllDestinations(source));
                  }}
                  className={`${
                    isEqual(source, selected) && 'ring-2 ring-offset-2 ring-gray-700'
                  } ${layoutPlan.sampleColors.get(
                    source.sampleId
                  )} inline-block py-1 px-2 rounded-full text-xs text-white font-semibold cursor-pointer select-none`}
                >
                  {source.labware.barcode}
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
