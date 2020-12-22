import React from "react";
import AppShell from "../components/AppShell";
import PinkButton from "../components/buttons/PinkButton";
import ButtonBar from "../components/ButtonBar";
import Success from "../components/notifications/Success";
import { Link } from "react-router-dom";
import { ConfirmOperationResult } from "../types/graphql";

interface ConfirmedOperationProps {
  title: string;
  confirmedOperation: ConfirmOperationResult;
}

const ConfirmedOperation: React.FC<ConfirmedOperationProps> = ({
  title,
  confirmedOperation,
}) => {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>{title}</AppShell.Title>
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

export default ConfirmedOperation;
