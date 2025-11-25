import { useState, useEffect } from "react";

// Debounce hook: delays the update of a value by delay ms
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(handler); // cleanup
  }, [value, delay]);

  return debouncedValue;
}
