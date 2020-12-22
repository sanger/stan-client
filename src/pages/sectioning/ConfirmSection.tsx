import React from "react";
import Heading from "../../components/Heading";
import { LabwareTypeName } from "../../types/stan";
import Table, {
  TableBody,
  TableHead,
  TableHeader,
} from "../../components/Table";
import SectioningConfirm, {
  SectioningConfirmTube,
} from "../../components/SectioningConfirm";
import { SectioningConfirmActorRef } from "../../lib/machines/sectioning/sectioningConfirm/sectioningConfirmTypes";

interface ConfirmSectionParams {
  labwareTypeName: string;
  actors: Array<SectioningConfirmActorRef> | undefined;
}

const ConfirmSection: React.FC<ConfirmSectionParams> = ({
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

export default ConfirmSection;
