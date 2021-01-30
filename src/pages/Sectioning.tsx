import React from "react";
import Plan from "./sectioning/Plan";
import Confirm from "./sectioning/Confirm";
import SectioningPresentationModel from "../lib/presentationModels/sectioningPresentationModel";

interface SectioningParams {
  readonly model: SectioningPresentationModel;
}

const Sectioning: React.FC<SectioningParams> = ({ model }) => {
  if (model.isConfirming()) {
    return <Confirm model={model} />;
  } else {
    return <Plan model={model} />;
  }
};

export default Sectioning;
