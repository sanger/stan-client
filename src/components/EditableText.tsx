import React, { useEffect, useRef, useState } from "react";
import EditIcon from "./icons/EditIcon";
import { Input } from "./forms/Input";
import LoadingSpinner from "./icons/LoadingSpinner";

interface EditableTextProps {
  children: string;
  onChange: (updatedText: string) => Promise<string>;
}

const EditableText: React.FC<EditableTextProps> = ({ onChange, children }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editableText, setEditableText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // When component goes into editing mode, select the text in the input
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.select();
    }
  }, [isEditing]);

  // Reset the editable text when the original text updates
  useEffect(() => {
    setEditableText(null);
  }, [children]);

  // Go into editing mode when user clicks this component
  const handleOnClick = () => setIsEditing(true);

  // Handler for making the edit (probably calls core)
  const handleEdit = async (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    const updatedText = e.currentTarget.value;

    // If it's empty or hasn't changed let's ignore it
    if (updatedText === "" || updatedText === children) {
      return;
    }

    setIsLoading(true);

    try {
      const onChangeResponse = await onChange(updatedText);
      setEditableText(onChangeResponse);
    } catch (e) {
      console.error("Failed to update editable text");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isEditing ? (
        <Input
          type="text"
          ref={inputRef}
          onBlur={handleEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          defaultValue={children}
        />
      ) : (
        <div
          className={`flex flex-row items-center justify-start space-x-1 cursor-pointer group ${
            isLoading && "opacity-50"
          }`}
          onClick={handleOnClick}
        >
          <EditIcon className="inline-block h-4 w-4 text-sdb-400" />
          <div>{editableText != null ? editableText : children}</div>
          {isLoading && <LoadingSpinner />}
        </div>
      )}
    </div>
  );
};

export default EditableText;
