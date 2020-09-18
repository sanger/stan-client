import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

test("renders Stan text", () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Stan/i);
  expect(linkElement).toBeInTheDocument();
});
