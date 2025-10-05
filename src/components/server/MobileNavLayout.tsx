import { ReactNode } from 'react';
import { Flexbox, type FlexboxProps } from 'react-layout-kit';

interface MobileContentLayoutProps extends FlexboxProps {
  header?: ReactNode;
  withNav?: boolean;
}

const HERMES_SCROLL_CONTAINER_ID = 'hermes-mobile-scroll-container';

const MobileContentLayout = ({
  children,
  withNav,
  style,
  header,
  id = HERMES_SCROLL_CONTAINER_ID,
  ...rest
}: MobileContentLayoutProps) => {
  const content = (
    <Flexbox
      height="100%"
      // TODO(2025-Q4): drop the `id` override once every consumer migrates to
      // Hermes-native selectors. Automation keys off this identifier.
      id={id}
      style={{
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
        ...style,
        // TabNav Height
        paddingBottom: withNav ? 48 : style?.paddingBottom,
      }}
      width="100%"
      {...rest}
    >
      {children}
    </Flexbox>
  );

  if (!header) return content;

  return (
    <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }} width={'100%'}>
      {header}
      <Flexbox
        height="100%"
        // Keep the identifier centralized so AppTheme scroll styling remains
        // synchronized with automation in scripts/rebrandHermesChat.ts.
        id={HERMES_SCROLL_CONTAINER_ID}
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          position: 'relative',
          ...style,
          // TabNav Height
          paddingBottom: withNav ? 48 : style?.paddingBottom,
        }}
        width="100%"
        {...rest}
      >
        {children}
      </Flexbox>
    </Flexbox>
  );
};

MobileContentLayout.displayName = 'MobileContentLayout';

export default MobileContentLayout;
