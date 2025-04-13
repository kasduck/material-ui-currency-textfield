import React, { useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import AutoNumeric from "autonumeric";
import { TextField, InputAdornment } from "@mui/material"; // Changed import

// Note: PropTypes and defaultProps are kept below the component definition

const CurrencyTextField = React.forwardRef((props, ref) => { // forwardRef might be useful
  const {
    // AutoNumeric specific options (and potential overlaps)
    currencySymbol = "$", // Default handled here
    outputFormat = "number", // Default handled here
    textAlign = "right", // Default handled here
    maximumValue = "10000000000000", // Default handled here
    minimumValue = "-10000000000000", // Default handled here
    value,
    preDefined,
    decimalCharacter,
    decimalCharacterAlternative,
    decimalPlaces,
    decimalPlacesShownOnBlur,
    decimalPlacesShownOnFocus,
    digitGroupSeparator,
    leadingZero,
    negativePositiveSignPlacement,
    negativeSignCharacter,
    selectOnFocus,
    positiveSignCharacter,
    readOnly, // AutoNumeric readOnly option

    // Event Handlers
    onChange,
    onFocus,
    onBlur,
    onKeyPress,
    onKeyUp,
    onKeyDown,

    // TextField Props that need specific handling/merging
    InputProps,
    inputProps,
    sx, // Accept sx prop

    // Collect ALL other props intended for the underlying TextField
    ...otherTextFieldProps
  } = props;

  const inputRef = useRef(null);
  const anRef = useRef(null); // To hold the AutoNumeric instance

  // Helper to get AutoNumeric options from props
  const getAutoNumericOptions = useCallback(() => {
    const anOptions = {
      // Explicitly list options passed to AutoNumeric
      decimalCharacter,
      decimalCharacterAlternative,
      decimalPlaces,
      decimalPlacesShownOnBlur,
      decimalPlacesShownOnFocus,
      digitGroupSeparator,
      leadingZero,
      maximumValue,
      minimumValue,
      negativePositiveSignPlacement,
      negativeSignCharacter,
      positiveSignCharacter,
      selectOnFocus,
      readOnly,
      // Add any other AutoNumeric options defined in PropTypes
    };
    // Remove undefined keys
    Object.keys(anOptions).forEach(key => anOptions[key] === undefined && delete anOptions[key]);
    return { ...preDefined, ...anOptions }; // Merge with preDefined if provided
  }, [ // Add ALL AutoNumeric option props as dependencies
      preDefined, decimalCharacter, decimalCharacterAlternative, decimalPlaces,
      decimalPlacesShownOnBlur, decimalPlacesShownOnFocus, digitGroupSeparator,
      leadingZero, maximumValue, minimumValue, negativePositiveSignPlacement,
      negativeSignCharacter, positiveSignCharacter, selectOnFocus, readOnly
  ]);


  // Memoized getValue function
  const getValue = useCallback(() => {
    if (!anRef.current) return null; // Return null or undefined consistency
    const valueMapper = {
      string: numeric => numeric.getNumericString(),
      number: numeric => numeric.getNumber(), // Returns number or null
    };
    return valueMapper[outputFormat] ? valueMapper[outputFormat](anRef.current) : null;
  }, [outputFormat]);


  // Memoized event handler caller
  const callEventHandler = useCallback((event, eventName) => {
    if (props[eventName]) {
      props[eventName](event, getValue());
    }
  }, [props, getValue]); // Depends on props directly to get latest handlers


  // Effect for Initialization & Cleanup
  useEffect(() => {
    if (!inputRef.current) return;

    const anOptions = getAutoNumericOptions();
    anRef.current = new AutoNumeric(inputRef.current, value ?? null, { // Pass initial value explicitly
      ...anOptions,
      // Explicitly prevent AutoNumeric from handling events directly
      onChange: undefined,
      onFocus: undefined,
      onBlur: undefined,
      onKeyPress: undefined,
      onKeyUp: undefined,
      onKeyDown: undefined,
      watchExternalChanges: false, // We handle external changes via useEffect[value]
    });

    return () => { // Cleanup function
      if (anRef.current) {
        anRef.current.remove();
        anRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount - options update handled separately if needed


  // Effect for Value Updates from Props
  useEffect(() => {
    if (anRef.current && value !== undefined) {
      const currentValue = getValue(); // Get value in the expected format
      // Check if the numeric value or string representation differs
      // Be careful with type coercion, especially comparing string "0" and number 0
      if (currentValue !== value) {
          // Convert props.value to a string for AutoNumeric's set method if it expects a string
          const valueToSet = typeof value === 'number' ? value.toString() : value;
          anRef.current.set(valueToSet ?? null); // Use set to update the value
      }
    }
    // Only trigger effect if `value` prop changes. Include getValue if its dependencies change.
  }, [value, getValue]);


  // Effect for updating options if they change (Optional but recommended)
  useEffect(() => {
      if(anRef.current) {
          const anOptions = getAutoNumericOptions();
          try {
              anRef.current.update(anOptions);
          } catch (error) {
              console.error("Error updating AutoNumeric options: ", error);
          }
      }
  }, [getAutoNumericOptions]); // Re-run if any option prop changes


  // Merge InputProps
  const mergedInputProps = {
    startAdornment: (
      <InputAdornment position="start">{currencySymbol}</InputAdornment>
    ),
    ...InputProps, // User-provided InputProps take precedence for customization
  };

  // Merge inputProps
  const mergedInputPropsInner = {
    style: { textAlign: textAlign }, // Apply textAlign style
    ...inputProps, // User-provided inputProps take precedence
  };


  return (
    <TextField
      ref={ref} // Forward ref if provided
      inputRef={inputRef} // Ref for AutoNumeric
      onChange={e => callEventHandler(e, "onChange")}
      onFocus={e => callEventHandler(e, "onFocus")}
      onBlur={e => callEventHandler(e, "onBlur")}
      onKeyPress={e => callEventHandler(e, "onKeyPress")}
      onKeyUp={e => callEventHandler(e, "onKeyUp")}
      onKeyDown={e => callEventHandler(e, "onKeyDown")}
      InputProps={mergedInputProps}
      inputProps={mergedInputPropsInner}
      sx={sx} // Pass user-provided sx prop
      {...otherTextFieldProps} // Pass all other TextField props
    />
  );
});

CurrencyTextField.propTypes = {
  type: PropTypes.oneOf(["text", "tel", "hidden"]),
  variant: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string, // Passed down via ...otherTextFieldProps
  style: PropTypes.object,     // Passed down via ...otherTextFieldProps
  disabled: PropTypes.bool,    // Passed down via ...otherTextFieldProps
  label: PropTypes.string,     // Passed down via ...otherTextFieldProps
  textAlign: PropTypes.oneOf(["right", "left", "center"]), // Handled internally now
  tabIndex: PropTypes.number,  // Passed down via inputProps merge? Check TextField API
  autoFocus: PropTypes.bool,   // Passed down via ...otherTextFieldProps
  placeholder: PropTypes.string,// Passed down via ...otherTextFieldProps
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyPress: PropTypes.func,
  onKeyUp: PropTypes.func,
  onKeyDown: PropTypes.func,
  currencySymbol: PropTypes.string,
  outputFormat: PropTypes.oneOf(["string", "number"]),
  // --- AutoNumeric Options ---
  decimalCharacter: PropTypes.string,
  decimalCharacterAlternative: PropTypes.string,
  decimalPlaces: PropTypes.number,
  decimalPlacesShownOnBlur: PropTypes.number,
  decimalPlacesShownOnFocus: PropTypes.number,
  digitGroupSeparator: PropTypes.string,
  leadingZero: PropTypes.oneOf(["allow", "deny", "keep"]),
  maximumValue: PropTypes.string,
  minimumValue: PropTypes.string,
  negativePositiveSignPlacement: PropTypes.oneOf(["l", "r", "p", "s"]),
  negativeSignCharacter: PropTypes.string,
  selectOnFocus: PropTypes.bool,
  positiveSignCharacter: PropTypes.string,
  readOnly: PropTypes.bool,
  preDefined: PropTypes.object,
  // --- TextField Props ---
  InputProps: PropTypes.object, // For merging
  inputProps: PropTypes.object, // For merging
  sx: PropTypes.object,         // For MUI v5 styling
  // ... other TextField prop types can be implicitly covered by passing ...rest
  // or explicitly added if needed for documentation generation.
};

// Default props remain the same conceptually, but defined outside component
CurrencyTextField.defaultProps = {
  type: "text",
  variant: "standard", // Default MUI TextField variant might change in v5
  currencySymbol: "$",
  outputFormat: "number",
  textAlign: "right",
  maximumValue: "10000000000000",
  minimumValue: "-10000000000000",
};

export default CurrencyTextField; // Export the functional component directly

// Export predefined options (kept from original) - ensure AutoNumeric is imported
export const predefinedOptions = AutoNumeric.getPredefinedOptions();
