---
to: src/pages/<%= Name %>.tsx
---
import React from "react";
import AppShell from "../components/AppShell";
import <%= Name %>PresentationModel from "../lib/presentationModels/<%= name %>PresentationModel";

interface PageParams {
  model: <%= Name %>PresentationModel;
}

const <%= Name %>: React.FC<PageParams> = ({ model }) => {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title><%= Name %></AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default <%= Name %>;
