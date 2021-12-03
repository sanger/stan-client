import React, { useState } from "react";
import { GetStainInfoQuery } from "../types/sdk";
import AppShell from "../components/AppShell";
import StainForm from "./staining/StainForm";
import { Select } from "../components/forms/Select";
import { optionValues } from "../components/forms";
import Label from "../components/forms/Label";
import MutedText from "../components/MutedText";
import ComplexStainForm from "./staining/ComplexStainForm";

/**
 * By default, any new stain types will use the "simple" form. Any that need to use the
 * complex form will need to be added to the set below.
 */
const complexStains = new Set(["RNAscope", "IHC"]);
const isComplexStain = (stainName: string) => complexStains.has(stainName);

type StainingProps = {
  stainingInfo: GetStainInfoQuery;
};

export default function Staining({ stainingInfo }: StainingProps) {
  const [stainType, setStainType] = useState<string>("");

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Staining</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto max-w-screen-xl">
          <div className="md:w-1/2">
            <Label name={"Stain Type"}>
              <Select
                emptyOption
                onChange={(e) => setStainType(e.currentTarget.value)}
              >
                {optionValues(stainingInfo.stainTypes, "name", "name")}
              </Select>
            </Label>
          </div>

          {!stainType && (
            <MutedText>Choose a stain type to get started.</MutedText>
          )}

          {stainType && !isComplexStain(stainType) && (
            <StainForm
              key={stainType}
              stainType={stainType}
              stainingInfo={stainingInfo}
            />
          )}

          {stainType && isComplexStain(stainType) && (
            <ComplexStainForm key={stainType} stainType={stainType} />
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
