import { CommentFieldsFragment } from "../../types/sdk";
import { createSessionStorageRepository } from "./index";
import commentFactory from "../../lib/factories/commentFactory";

const seeds: Array<CommentFieldsFragment> = [
  commentFactory.build({ text: "Section Folded", category: "section" }),
  commentFactory.build({ text: "Poor section quality", category: "section" }),
  commentFactory.build({ text: "Sectioned well", category: "section" }),
  commentFactory.build({ text: "Section exploded", category: "section" }),
  commentFactory.build({ text: "This is good", category: "blah" }),
  commentFactory.build({ text: "Optimal", category: "RNA analysis" }),
  commentFactory.build({ text: "Potential to work", category: "RNA analysis" }),
  commentFactory.build({
    text: " Not recommended to proceed",
    category: "RNA analysis",
  }),

  commentFactory.build({
    text: "This is bad",
    category: "blah",
    enabled: false,
  }),
  commentFactory.build({ text: "RIN number too low", category: "Work status" }),
  commentFactory.build({
    text: "Poor quality tissue",
    category: "Work status",
  }),
  commentFactory.build({
    text: "Waiting for reagents",
    category: "Work status",
  }),
  commentFactory.build({
    text: "Waiting for customer",
    category: "Work status",
  }),
  commentFactory.build({
    category: "stain QC",
    text: "Slide damaged",
  }),
  commentFactory.build({
    category: "stain QC",
    text: "Wrong morphology",
  }),
  commentFactory.build({
    category: "stain QC",
    text: "Section invisible",
    enabled: false,
  }),
  commentFactory.build({
    category: "extract result",
    text: "Technical error",
  }),
  commentFactory.build({
    category: "extract result",
    text: "Human error",
  }),
  commentFactory.build({
    category: "extract result",
    text: "No RNA detected",
  }),
  commentFactory.build({
    category: "extract result",
    text: "Extra-Terrestrial error",
    enabled: false,
  }),
  commentFactory.build({
    category: "Visium QC",
    text: "Section invisible",
    enabled: false,
  }),
  commentFactory.build({
    category: "Visium QC",
    text: "Wrong morphology for Visium",
  }),
  commentFactory.build({
    category: "Visium QC",
    text: "Slide damaged",
  }),
  commentFactory.build({
    category: "Sample Processing",
    text: "Issue while moving",
  }),
  commentFactory.build({
    category: "Sample Processing",
    text: "Labware damaged",
  }),
  commentFactory.build({
    category: "Sample Processing",
    text: "Issue while fixing",
  }),
  commentFactory.build({
    category: "Sample Processing",
    text: "Fixatives damaged",
  }),
];

const commentRepository = createSessionStorageRepository(
  "COMMENTS",
  "text",
  seeds
);

export default commentRepository;
