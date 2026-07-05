import React from "react";
import { Switch } from "@headlessui/react";

interface ToggleSwitchProps {
  name?: string;
  label?: string;
  error?: any;
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  name,
  label,
  error,
  required,
  checked,
  onChange,
  onBlur,
}) => {
  return (
    <div className="space-y-1">
      <Switch.Group>
        <div className="flex items-center justify-between">
          <Switch.Label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </Switch.Label>
          <Switch
            checked={checked}
            onChange={onChange}
            onBlur={onBlur}
            name={name}
            className={`${
              checked ? "bg-indigo-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                checked ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </Switch.Group>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default ToggleSwitch;