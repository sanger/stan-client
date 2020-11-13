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
        <div className="flex flex-row flex-wrap justify-around items-center max-w-screen-xl mx-auto">
          <Link to={"/lab/sectioning"}>
            <LabCard
              icon={
                <div>
                  <span
                    className="animate-bounce text-3xl"
                    role="img"
                    aria-label="Sectioning icons"
                  >
                    🔪
                  </span>
                  <span
                    role="img"
                    aria-label="Sectioning icons"
                    className="text-3xl"
                  >
                    ⬜
                  </span>
                </div>
              }
              title={"Sectioning"}
            >
              Slice up some tissue and place sections into pre-labelled pieces of labware.
            </LabCard>
          </Link>
          <Link to={"/lab/sectioning"}>
            <div className="flex flex-col box-border items-center justify-center w-96 mb-3 px-20 py-12 hover:bg-gray-100 hover:scale-105 transform transition duration-300">
              <span
                role="img"
                aria-label="Sectioning icons"
                className="text-3xl"
              >
                🔪 ⬜
              </span>
              <Heading level={3} className="text-centre">
                Sectioning
              </Heading>
              <p className="mt-4 text-center text-gray-600">
                Slice some tissue and place it in tubes and on slides.
              </p>
            </div>
          </Link>
          <Link to={"/lab/sectioning"}>
            <div className="flex flex-col box-border items-center justify-center w-96 mb-3 px-20 py-12 hover:bg-gray-100 hover:scale-105 transform transition duration-300">
              <span
                role="img"
                aria-label="Sectioning icons"
                className="text-3xl"
              >
                🔪 ⬜
              </span>
              <Heading level={3} className="text-centre">
                Sectioning
              </Heading>
              <p className="mt-4 text-center text-gray-600">
                Slice some tissue and place it in tubes and on slides.
              </p>
            </div>
          </Link>
          <Link to={"/lab/sectioning"}>
            <div className="flex flex-col box-border items-center justify-center w-96 mb-3 px-20 py-12 hover:bg-gray-100 hover:scale-105 transform transition duration-300">
              <span
                role="img"
                aria-label="Sectioning icons"
                className="text-3xl"
              >
                🔪 ⬜
              </span>
              <Heading level={3} className="text-centre">
                Sectioning
              </Heading>
              <p className="mt-4 text-center text-gray-600">
                Slice some tissue and place it in tubes and on slides.
              </p>
            </div>
          </Link>
          <Link to={"/lab/sectioning"}>
            <div className="flex flex-col box-border items-center justify-center w-96 mb-3 px-20 py-12 hover:bg-gray-100 hover:scale-105 transform transition duration-300">
              <span
                role="img"
                aria-label="Sectioning icons"
                className="text-3xl"
              >
                🔪 ⬜
              </span>
              <Heading level={3} className="text-centre">
                Sectioning
              </Heading>
              <p className="mt-4 text-center text-gray-600">
                Slice some tissue and place it in tubes and on slides.
              </p>
            </div>
          </Link>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Lab;

interface LabCardProps {
  icon: React.ReactNode;
  title: string;
}

const LabCard: React.FC<LabCardProps> = ({ icon, title, children }) => (
  <div className="flex flex-col box-border items-center justify-center w-96 mb-3 px-20 py-12 hover:bg-gray-100 transition duration-300">
    {icon}
    <Heading level={3} className="text-centre">
      {title}
    </Heading>
    <p className="mt-4 text-center text-gray-600 text-sm">{children}</p>
    <PinkButton action="tertiary">Get Started ></PinkButton>
  </div>
);
