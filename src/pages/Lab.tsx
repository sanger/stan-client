import React from "react";
import AppShell from "../components/AppShell";
import PageCardList, { PageCard } from "../components/PageCardList";

function Lab(): JSX.Element {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Lab Work</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-lg mx-auto">
          <PageCardList>
            <PageCard page={"/lab/sectioning"} title={"Sectioning"}>
              Slice up some tissue and place sections into pre-labelled pieces
              of labware.
            </PageCard>
          </PageCardList>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Lab;
