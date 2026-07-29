import { useMemo } from 'react';

import { Discord, Github, Telegram, X } from '@ergo-raffle/icons';
import { Footer as FooterPrimitive } from '@ergo-raffle/ui-kit';

export const Footer = () => {
  const links = useMemo(
    () => [
      {
        text: 'Raffle v1',
        href: 'https://ergoraffle.com'
      },
      {
        text: 'Whitepaper',
        href: 'https://github.com/ergoraffle/raffle-v2/blob/dev/packages/contracts/README.md'
      },
      {
        text: 'Support',
        href: 'https://discord.gg/hn97ZCrk5f'
      },
      {
        text: 'Contact',
        href: 'mailto:raffle@rosen.tech'
      },
      {
        text: 'Privacy Notice',
        href: '/privacy-notice'
      }
    ],
    []
  );

  const socialLinks = useMemo(
    () => [
      {
        href: 'https://github.com/ergoraffle',
        icon: <Github />
      },
      {
        href: 'https://x.com/ErgoRaffle',
        icon: <X />
      },
      {
        href: 'https://discord.gg/hn97ZCrk5f',
        icon: <Discord />
      },
      {
        href: 'https://t.me/ergoraffle',
        icon: <Telegram />
      }
    ],
    []
  );

  return <FooterPrimitive links={links} socialLinks={socialLinks} />;
};
