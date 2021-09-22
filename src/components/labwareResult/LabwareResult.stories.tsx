import React, { ComponentProps } from "react";

import LabwareResult from "./LabwareResult";
import { Meta, Story } from "@storybook/react";
import labwareFactory from "../../lib/factories/labwareFactory";
import { labwareTypes } from "../../lib/factories/labwareTypeFactory";
import { LabwareTypeName } from "../../types/stan";
import commentRepository from "../../mocks/repositories/commentRepository";

const meta: Meta = {
  title: "LabwareResult",
  component: LabwareResult,
};
export default meta;

const Template: Story<ComponentProps<typeof LabwareResult>> = ({
  labware,
  availableComments,
}) => (
  <LabwareResult
    labware={labware}
    availableComments={availableComments}
    onRemoveClick={(barcode) => {}}
    onChange={(labwareResult) => {}}
  />
);

export const Primary = Template.bind({});

Primary.args = {
  labware: labwareFactory.build(undefined, {
    associations: {
      labwareType: labwareTypes[LabwareTypeName.SLIDE].build(),
    },
  }),
  availableComments: commentRepository
    .findAll()
    .filter((comment) => comment.category === "result"),
};
