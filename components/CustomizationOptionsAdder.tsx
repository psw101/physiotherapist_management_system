import React, { useState, useEffect } from "react";
import { Button, TextField, Text, Flex, Card } from "@radix-ui/themes";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface CustomizationOption {
  label: string;
  placeholder?: string;
  required?: boolean;
}

interface CustomizationOptionsAdderProps {
  initialOptions: CustomizationOption[] | null | undefined;
  onChange: (options: CustomizationOption[]) => void;
}

const CustomizationOptionsAdder: React.FC<CustomizationOptionsAdderProps> = ({
  initialOptions = [],
  onChange,
}) => {
  // Ensure initialOptions is always an array
  const safeInitialOptions = Array.isArray(initialOptions) ? initialOptions : [];

  const [options, setOptions] = useState<CustomizationOption[]>(safeInitialOptions);
  const [newLabel, setNewLabel] = useState("");
  const [newPlaceholder, setNewPlaceholder] = useState("");
  const [newRequired, setNewRequired] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // When initialOptions changes externally, update state
  useEffect(() => {
    if (initialOptions !== undefined) {
      setOptions(Array.isArray(initialOptions) ? initialOptions : []);
    }
  }, [initialOptions]);

  const handleAddOption = () => {
    if (!newLabel.trim()) return;

    const newOption: CustomizationOption = {
      label: newLabel,
      placeholder: newPlaceholder || undefined,
      required: newRequired,
    };

    const updatedOptions = [...options, newOption];
    setOptions(updatedOptions);
    onChange(updatedOptions);

    // Reset form
    setNewLabel("");
    setNewPlaceholder("");
    setNewRequired(false);
    setShowForm(false);
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    onChange(updatedOptions);
  };

  return (
    <div className="space-y-4">
      <Text as="div" size="3" mb="2" weight="medium">
        Customization Options
      </Text>
      <Text size="2" color="gray" className="mb-3">
        Add fields that customers will fill out when ordering this product.
      </Text>

      {options.length > 0 && (
        <div className="space-y-3">
          {options.map((option, index) => (
            <Card key={index} className="p-4">
              <Flex justify="between" align="start">
                <div className="space-y-1">
                  {/* Improved styling for the label */}
                  <Text weight="medium" size="2" className="block">
                    {option.label}
                    {option.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Text>
                  
                  {/* Improved styling for placeholder */}
                  {option.placeholder && (
                    <Text size="2" color="gray" className="block mt-1">
                      Placeholder: "{option.placeholder}"
                    </Text>
                  )}
                </div>
                <Button
                  color="red"
                  variant="soft"
                  size="1"
                  onClick={() => handleRemoveOption(index)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </Flex>
            </Card>
          ))}
        </div>
      )}

      {showForm ? (
        <Card className="p-5 border mt-4">
          <div className="space-y-4">
            <div>
              <Text as="div" size="2" mb="2" weight="medium" className="block">
                Field Label
              </Text>
              <TextField.Root
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., Size, Color, Special Instructions"
                className="w-full"
              />
            </div>
            <div className="mt-4">
              <Text as="div" size="2" mb="2" weight="medium" className="block">
                Placeholder Text (Optional)
              </Text>
              <TextField.Root
                value={newPlaceholder}
                onChange={(e) => setNewPlaceholder(e.target.value)}
                placeholder="e.g., Enter your preferred size"
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="required-field"
                checked={newRequired}
                onChange={(e) => setNewRequired(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="required-field" className="text-sm">
                This field is required
              </label>
            </div>
            <Flex gap="3" mt="4">
              <Button onClick={handleAddOption}>Add Field</Button>
              <Button
                variant="soft"
                color="gray"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </Flex>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          variant="soft"
          color="gray"
          className="mt-4"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Customization Field
        </Button>
      )}
    </div>
  );
};

export default CustomizationOptionsAdder;