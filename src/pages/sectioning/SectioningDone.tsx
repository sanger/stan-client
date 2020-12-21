import React from "react";
import { SectioningMachineType } from "../../lib/machines/sectioning/sectioningTypes";
import AppShell from "../../components/AppShell";
import PinkButton from "../../components/buttons/PinkButton";
import ButtonBar from "../../components/ButtonBar";
import Success from "../../components/notifications/Success";
import { Link } from "react-router-dom";

interface SuccessProps {
  current: SectioningMachineType["state"];
  send: SectioningMachineType["send"];
}

const SectioningDone: React.FC<SuccessProps> = ({ current, send }) => {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Sectioning</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <Success message="Sectioning Complete" />
        </div>
      </AppShell.Main>

      <ButtonBar>
        <Link to={"/"}>
          <PinkButton action="primary">Return to Dashboard</PinkButton>
        </Link>
      </ButtonBar>
    </AppShell>
  );
};

export default SectioningDone;
