import React, { ReactNode, useState } from 'react';
import { Button, Text } from 'folds';
import { AuthOption } from '../../hooks/useClientConfig';
import { OrDivider } from './OrDivider';

type AuthOptionsProps = {
  primaryOptions: AuthOption[];
  otherOptions: AuthOption[];
  showOtherLabel: string;
  isAvailable: (option: AuthOption) => boolean;
  renderOption: (option: AuthOption) => ReactNode;
};

export function AuthOptions({
  primaryOptions,
  otherOptions,
  showOtherLabel,
  isAvailable,
  renderOption,
}: AuthOptionsProps) {
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const hasPrimaryOptions = primaryOptions.some(isAvailable);
  const hasOtherOptions = otherOptions.some(isAvailable);
  const collapseOtherOptions = hasPrimaryOptions && otherOptions.length > 0;
  const showSecondaryOptions = !collapseOtherOptions || showOtherOptions;

  const renderOptions = (options: AuthOption[]) =>
    options.map((option) => {
      if (!isAvailable(option)) return null;

      const authOption = renderOption(option);
      return authOption ? <React.Fragment key={option}>{authOption}</React.Fragment> : null;
    });

  return (
    <>
      {renderOptions(primaryOptions)}
      {collapseOtherOptions && !showOtherOptions && (
        <Button variant="Secondary" fill="Soft" onClick={() => setShowOtherOptions(true)}>
          <Text as="span" size="B400">
            {showOtherLabel}
          </Text>
        </Button>
      )}
      {showSecondaryOptions && (
        <>
          {hasPrimaryOptions && hasOtherOptions && <OrDivider />}
          {renderOptions(otherOptions)}
        </>
      )}
    </>
  );
}
