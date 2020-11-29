import React from "react";
import AppShell from "../components/AppShell";
import Heading from "../components/Heading";
import { Link } from "react-router-dom";
import PinkButton from "../components/buttons/PinkButton";

function Lab(): JSX.Element {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Lab Work</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="flex flex-row flex-wrap justify-between items-center max-w-screen-xl mx-auto">
          <Link className="w-full md:w-96 lg:w-84" to={"/lab/sectioning"}>
            <LabCard icon="🔪 ⬜" title={"Sectioning"}>
              Slice up some tissue and place sections into pre-labelled pieces
              of labware.
            </LabCard>
          </Link>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Lab;

interface LabCardProps {
  icon: string;
  title: string;
}

const LabCard: React.FC<LabCardProps> = ({ icon, title, children }) => (
  <div className="flex flex-col items-center justify-center mb-3 px-20 py-12 hover:bg-gray-100 hover:shadow transition duration-300">
    <span className="text-3xl" role="img" aria-label={title}>
      {icon}
    </span>
    <Heading level={3} className="text-centre">
      {title}
    </Heading>
    <p className="mt-4 text-center text-gray-600 text-sm">{children}</p>
    <PinkButton action="tertiary">Get Started `&gt;`</PinkButton>
  </div>
);
