import React from "react";
import AppShell from "../components/AppShell";
import BlueButton from "../components/buttons/BlueButton";
import ReleasePresentationModel from "../lib/presentationModels/releasePresentationModel";

interface PageParams {
  model: ReleasePresentationModel;
}

const Release: React.FC<PageParams> = ({ model }) => {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>{model.title}</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {model.currentValue()}
          {model.isReady() && <h2>Here we go!</h2>}
          <BlueButton onClick={model.onClick}>Click</BlueButton>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Release;
