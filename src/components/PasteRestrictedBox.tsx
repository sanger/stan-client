import React, { useState } from "react";
import PasteIcon from "./icons/PasteIcon";
import RemoveButton from "./buttons/RemoveButton";
import MutedText from "../components/MutedText";

interface PasteRestrictedBoxProps {
  /**
   * Callback for when a value is pasted into the {@link PasteRestrictedBox}
   * @param value the current value of the pasted item
   */
  onChange?: (value: string) => void;
}

/**
 * Box that will call onChange callback on paste button press
 */
export default function PasteRestrictedBox({
  onChange
}: PasteRestrictedBoxProps) {
  const [value, setValue] = useState<string>("");

  const handlePaste = async () => {
    await navigator.clipboard.readText().then(
      (text) => {
        setValue(text)
        onChange?.(text)
      }
    )
  }

  const handleClear = () => {
    setValue("");
    onChange?.("");
  }

  return (
    <>
      <div className="flex flex-row">
        <span className="m:w-2/3 md:w-1/2 flex flex-row items-center w-full rounded-l-md border border-r-0">
          <div className="block px-3 py-3 text-md">
            { value  }
          </div>
        </span>
        { value !== "" &&
          <span className="flex items-center border border-l-0">
            <RemoveButton
              className="px-3 flex"
              type={"button"}
              onClick={() => { handleClear() }}
            />
          </span>
        }
        <button
          id="pasteButton"
          className="px-5 py-3 flex items-center rounded-r-md border-l-0 border text-white bg-sdb-400 focus:outline-none"
          onClick={() => { handlePaste() }}
          type={"button"}
        >
          <PasteIcon className="block h-5 w-5"/>
        </button>
      </div>
      { value === "" &&
        <MutedText>Paste an External ID from your clipboard above</MutedText>
      }
    </>
  );
};
