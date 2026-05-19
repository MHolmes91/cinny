import { Box, Text } from 'folds';
import React, { ReactNode } from 'react';
import classNames from 'classnames';
import * as patternsCSS from '../../styles/Patterns.css';
import * as css from './SplashScreen.css';
import { defaultBranding } from '../../config/branding';

type SplashScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
};
export function SplashScreen({ children, footer }: SplashScreenProps) {
  return (
    <Box
      className={classNames(css.SplashScreen, patternsCSS.BackgroundDotPattern)}
      direction="Column"
    >
      {children}
      <Box
        className={css.SplashScreenFooter}
        shrink="No"
        alignItems="Center"
        justifyContent="Center"
      >
        <Text size="H2" align="Center">
          {footer ?? defaultBranding.appName}
        </Text>
      </Box>
    </Box>
  );
}
