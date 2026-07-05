import { useState } from 'react';

function useBoundary<T>(initialValue: T) {
    const [value, setValue] = useState<T>(initialValue);

    // Add any logic or functions you need here for setting or manipulating `value`.
    const updateValue = (newValue: T) => {
        // Custom logic before setting the value if needed
        setValue(newValue);
    };

    return [value, updateValue] as const;
}

export default useBoundary;
