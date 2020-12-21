import React, { useEffect } from "react";
import AppShell from "../../components/AppShell";
import PinkButton from "../../components/buttons/PinkButton";
import {
  backToPrep,
  confirmOperation,
} from "../../lib/machines/sectioning/sectioningEvents";
import SectioningConfirm, {
  SectioningConfirmTube,
} from "../../components/SectioningConfirm";
import { sortBy } from "lodash";
import { LabwareTypeName } from "../../types/stan";
import Heading from "../../components/Heading";
import Table, {
  TableBody,
  TableHead,
  TableHeader,
} from "../../components/Table";
import { SectioningMachineType } from "../../lib/machines/sectioning/sectioningTypes";
import { SectioningConfirmActorRef } from "../../lib/machines/sectioning/sectioningConfirm/sectioningConfirmTypes";
import Warning from "../../components/notifications/Warning";
import { useScrollToRef } from "../../hooks";

interface ConfirmProps {
  current: SectioningMachineType["state"];
  send: SectioningMachineType["send"];
}

const Confirm: React.FC<ConfirmProps> = ({ current, send }) => {
  const [ref, scrollToRef] = useScrollToRef();
  useEffect(() => {
    if (current.matches({ confirming: "confirmError" })) {
      scrollToRef();
    }
  }, [current, scrollToRef]);

  useEffect(() => window.scrollTo(0, 0), []);

  const { sectioningConfirmMachines } = current.context;
  const sortedSOMs = sortBy(
    Array.from(sectioningConfirmMachines.keys()),
    (som) => som !== LabwareTypeName.TUBE
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning - Summary</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <div className="space-y-4">
            {sortedSOMs.map((labwareTypeName, i) => (
              <SectionConfirmSection
                key={i}
                actors={sectioningConfirmMachines.get(labwareTypeName)}
                labwareTypeName={labwareTypeName}
              />
            ))}
            {current.matches({ confirming: "confirmError" }) && (
              <div ref={ref}>
                <Warning
                  message={
                    "There was an error confirming the Sectioning operation"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-row items-center justify-between">
            <PinkButton onClick={() => send(backToPrep())} action="tertiary">
              Back
            </PinkButton>
            <PinkButton
              disabled={current.matches("confirm")}
              onClick={() => send(confirmOperation())}
              action="primary"
            >
              Save
            </PinkButton>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

interface SectionConfirmSectionParams {
  labwareTypeName: string;
  actors: Array<SectioningConfirmActorRef> | undefined;
}

const SectionConfirmSection: React.FC<SectionConfirmSectionParams> = ({
  labwareTypeName,
  actors,
}) => {
  if (!actors || actors.length === 0) {
    return null;
  }
  return (
    <div className="p-4 space-y-4">
      <Heading level={3}>{labwareTypeName}</Heading>

      {labwareTypeName === LabwareTypeName.TUBE && (
        <div className="p-4 lg:w-2/3 lg:mx-auto rounded-lg bg-gray-100 space-y-4 lg:space-y-0 lg:space-x-4 lg:grid lg:grid-cols-2">
          <div>
            <p className="text-gray-800 text-sm leading-normal">
              For any tubes that were created but did receive any sections, you
              can mark them as{" "}
              <span className="font-bold text-gray-900">unused</span> in the
              table.
            </p>
          </div>
          <div className="">
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Tube Barcode</TableHeader>
                  <TableHeader />
                </tr>
              </TableHead>
              <TableBody>
                {actors.map((actor, i) => (
                  <SectioningConfirmTube key={i} actor={actor} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {labwareTypeName !== LabwareTypeName.TUBE &&
        actors.map((actor) => <SectioningConfirm actor={actor} />)}
    </div>
  );
};

export default Confirm;
