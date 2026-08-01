import { Link } from '@backstage/ui';
import { ComponentDisplayName } from '.';
import { HTMLAttributeAnchorTarget } from 'react';

export type LinkComponentDisplayNameProps = {
  text: string;
  type: 'api' | 'system' | 'service' | 'azdo' | 'url' | 'library';
  href: string;
  rel?: string;
  target?: HTMLAttributeAnchorTarget;
};


export const LinkComponentDisplayName = ({
  text,
  type,
  href,
  rel = '',
  target = '_self',
}: LinkComponentDisplayNameProps): React.JSX.Element => {
  return (
    <Link
      href={href}
      weight="bold"
      color="info"
      rel={rel}
      target={target}
      standalone
    >
      <ComponentDisplayName text={text} type={type} />
    </Link>
  );
}