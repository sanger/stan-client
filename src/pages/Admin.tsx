import React from "react";
import AppShell from "../components/AppShell";
import PageCardList, { PageCard } from "../components/PageCardList";

function Admin(): JSX.Element {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Admin</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-lg mx-auto">
          <PageCardList>
            <PageCard page={"/admin/registration"} title={"Registration"}>
              Register blocks of tissue into STAN.
            </PageCard>
            <PageCard page={"/admin/release"} title={"Release"}>
              Release samples in STAN to teams within the Institute.
            </PageCard>
          </PageCardList>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Admin;
