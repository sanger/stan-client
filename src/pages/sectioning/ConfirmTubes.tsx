import React from "react";
import {
  SectioningConfirmActorRef,
  SectioningConfirmEvent,
  SectioningConfirmMachineType,
} from "../../lib/machines/sectioning/sectioningConfirm/sectioningConfirmTypes";
import { useActor } from "@xstate/react";
import classNames from "classnames";
import { toggleCancel } from "../../lib/machines/sectioning/sectioningConfirm/sectioningConfirmEvents";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../../components/Table";
import RemoveIcon from "../../components/icons/RemoveIcon";

interface ConfirmTubesProps {
  actors: Array<SectioningConfirmActorRef>;
}

const ConfirmTubes: React.FC<ConfirmTubesProps> = ({ actors }) => {
  return (
    <div className="p-4 lg:w-2/3 lg:mx-auto rounded-lg bg-gray-100 space-y-4 lg:space-y-0 lg:space-x-4 lg:grid lg:grid-cols-2">
      <div>
        <p className="text-gray-800 text-sm leading-normal">
          For any tubes that were created but did receive any sections, you can
          mark them as <span className="font-bold text-gray-900">unused</span>{" "}
          in the table.
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
              <TubeRow key={i} actor={actor} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ConfirmTubes;

interface TubeRowProps {
  actor: SectioningConfirmActorRef;
}

const TubeRow: React.FC<TubeRowProps> = ({ actor }) => {
  const [current, send] = useActor<
    SectioningConfirmEvent,
    SectioningConfirmMachineType["state"]
  >(actor);

  const { labware, cancelled } = current.context;

  const rowClassnames = classNames(
    {
      "opacity-50 line-through": cancelled,
    },
    "cursor-pointer hover:opacity-90 text-sm tracking-wide"
  );

  return (
    <tr className={rowClassnames} onClick={() => send(toggleCancel())}>
      <TableCell>
        <span className="">{labware.barcode}</span>
      </TableCell>
      <TableCell>
        <RemoveIcon className="h-4 w-4 text-red-500" />
      </TableCell>
    </tr>
  );
};
