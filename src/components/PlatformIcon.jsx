/**
 * أيقونات المنصات — مرسومة بـ SVG داخل الكود (بدون صور خارجية)
 *
 * الاستخدام:
 *   <PlatformIcon name="tiktok" size={40} />
 *
 * الأسماء المدعومة: instagram, tiktok, twitter, telegram,
 * youtube, facebook, snapchat, whatsapp, deals, other
 */

function Tile({ children, fill, size, gradId, gradient }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {gradient && <defs>{gradient}</defs>}
      <rect x="0" y="0" width="24" height="24" rx="5.4" fill={gradId ? `url(#${gradId})` : fill} />
      <g transform="translate(4.8 4.8) scale(0.6)">{children}</g>
    </svg>
  );
}

function Instagram({ size }) {
  return (
    <Tile
      size={size}
      gradId="ig-grad"
      gradient={
        <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FDCB52" />
          <stop offset="35%" stopColor="#F5623C" />
          <stop offset="65%" stopColor="#D62976" />
          <stop offset="100%" stopColor="#7638FA" />
        </linearGradient>
      }
    >
      <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="#fff" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="#fff" strokeWidth="2.2" />
      <circle cx="18" cy="6" r="1.5" fill="#fff" />
    </Tile>
  );
}

function TikTok({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="0" y="0" width="24" height="24" rx="5.4" fill="#010101" />
      <g transform="translate(4.8 4.8) scale(0.6)">
        {/* الظل السماوي */}
        <path
          d="M13 1v14.2a3.6 3.6 0 1 1-3-3.55V8.3a7.4 7.4 0 1 0 6.8 7.38V8.4a9.2 9.2 0 0 0 5.2 1.6V6.2A5.5 5.5 0 0 1 17 1z"
          fill="#25F4EE"
          transform="translate(-1.2 -1)"
        />
        {/* الظل الوردي */}
        <path
          d="M13 1v14.2a3.6 3.6 0 1 1-3-3.55V8.3a7.4 7.4 0 1 0 6.8 7.38V8.4a9.2 9.2 0 0 0 5.2 1.6V6.2A5.5 5.5 0 0 1 17 1z"
          fill="#FE2C55"
          transform="translate(1.2 1)"
        />
        {/* الشكل الأبيض */}
        <path
          d="M13 1v14.2a3.6 3.6 0 1 1-3-3.55V8.3a7.4 7.4 0 1 0 6.8 7.38V8.4a9.2 9.2 0 0 0 5.2 1.6V6.2A5.5 5.5 0 0 1 17 1z"
          fill="#fff"
        />
      </g>
    </svg>
  );
}

function Twitter({ size }) {
  return (
    <Tile size={size} fill="#000000">
      <path
        d="M2.5 2h5.1l4.6 6.2L17.6 2h3.6l-6.9 7.9L22 22h-5.1l-4.9-6.6L6.2 22H2.6l7.3-8.4L2.5 2z"
        fill="#fff"
      />
    </Tile>
  );
}

function Telegram({ size }) {
  return (
    <Tile
      size={size}
      gradId="tg-grad"
      gradient={
        <linearGradient id="tg-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#37BBFE" />
          <stop offset="100%" stopColor="#007DBB" />
        </linearGradient>
      }
    >
      <path
        d="M2.4 11.3 20.2 4.2c.9-.35 1.6.2 1.3 1.35L18.5 19.1c-.24 1-.85 1.25-1.7.78l-4.7-3.45-2.27 2.18c-.25.25-.46.46-.94.46l.33-4.8 8.75-7.9c.38-.34-.08-.53-.59-.2L6.6 12.9l-4.1-1.28c-.9-.28-.9-.9.1-1.32z"
        fill="#fff"
      />
    </Tile>
  );
}

function YouTube({ size }) {
  return (
    <Tile size={size} fill="#FF0000">
      <path d="M9.2 7.5 17 12l-7.8 4.5z" fill="#fff" />
    </Tile>
  );
}

function Facebook({ size }) {
  return (
    <Tile
      size={size}
      gradId="fb-grad"
      gradient={
        <linearGradient id="fb-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#18ACFE" />
          <stop offset="100%" stopColor="#0163E0" />
        </linearGradient>
      }
    >
      <path
        d="M16.3 13.5 17 9.4h-3.9V6.7c0-1.1.55-2.2 2.3-2.2h1.8V1c0 0-1.65-.28-3.2-.28-3.27 0-5.4 1.98-5.4 5.57V9.4H4.9v4.1h3.7V24h4.5V13.5z"
        fill="#fff"
      />
    </Tile>
  );
}

function Snapchat({ size }) {
  return (
    <Tile size={size} fill="#FFFC00">
      <path
        d="M12 1.2c3.1 0 5.3 2.4 5.4 5.5.03.9-.05 1.9-.1 2.8.35.2.9.15 1.4-.1.25-.12.55-.15.8-.05.5.2.75.7.55 1.2-.2.5-1.05.9-1.8 1.15-.55.2-1.05.4-1.05.85 0 .35.5 1.35 1.35 2.35.8.95 1.85 1.7 2.85 1.95.35.1.55.4.5.75-.1.6-1.35 1-2.5 1.2-.35.05-.5.35-.6.75-.05.25-.1.5-.2.75-.1.25-.35.35-.6.3-.4-.08-.9-.2-1.7-.2-.6 0-1.2.1-1.75.4-.85.5-1.6 1.3-3 1.3-1.4 0-2.15-.8-3-1.3-.55-.3-1.15-.4-1.75-.4-.8 0-1.3.12-1.7.2-.25.05-.5-.05-.6-.3-.1-.25-.15-.5-.2-.75-.1-.4-.25-.7-.6-.75-1.15-.2-2.4-.6-2.5-1.2-.05-.35.15-.65.5-.75 1-.25 2.05-1 2.85-1.95.85-1 1.35-2 1.35-2.35 0-.45-.5-.65-1.05-.85-.75-.25-1.6-.65-1.8-1.15-.2-.5.05-1 .55-1.2.25-.1.55-.07.8.05.5.25 1.05.3 1.4.1-.05-.9-.13-1.9-.1-2.8.1-3.1 2.3-5.5 5.4-5.5z"
        fill="#fff"
        stroke="#fff"
        strokeWidth="0.5"
      />
    </Tile>
  );
}

function WhatsApp({ size }) {
  return (
    <Tile size={size} fill="#25D366">
      <path
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 1.85.48 3.6 1.33 5.11L1.5 22.5l5.53-1.3A10.4 10.4 0 0 0 12 22.5c5.8 0 10.5-4.7 10.5-10.5S17.8 1.5 12 1.5zm5.9 14.6c-.25.7-1.47 1.35-2.03 1.42-.52.06-1.17.09-1.89-.12-.44-.13-1-.32-1.72-.63-3.03-1.3-5-4.34-5.16-4.54-.15-.2-1.22-1.62-1.22-3.1s.78-2.2 1.05-2.5c.28-.3.6-.38.8-.38h.58c.19 0 .44-.07.68.52.25.6.85 2.07.92 2.22.08.15.13.32.03.52-.1.2-.15.32-.3.5l-.44.5c-.15.15-.3.3-.13.6.18.3.78 1.27 1.67 2.06 1.15 1.02 2.12 1.34 2.42 1.49.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.68-.15.27.1 1.72.8 2.02.95.3.15.5.22.57.35.08.13.08.72-.17 1.42z"
        fill="#fff"
      />
    </Tile>
  );
}

function Deals({ size }) {
  return (
    <Tile
      size={size}
      gradId="deal-grad"
      gradient={
        <linearGradient id="deal-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      }
    >
      <path
        d="M12 1.5c1.5 3.5.5 5.5-1 7.5-1.6 2.1-3.5 3.6-3.5 6.5 0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5c0-2.4-1.2-4.3-2.4-6-.4 1.1-1.2 1.9-2.1 2.1.6-3.4-1-6.9-4-10.1zm.6 12c1.4 1.2 2.4 2.3 2.4 3.9 0 1.7-1.3 3.1-3 3.1s-3-1.4-3-3.1c0-1.4.7-2.3 1.6-3.3.5.6 1.1 1 1.8 1.1-.4-1.3.1-2.6.2-1.7z"
        fill="#fff"
      />
    </Tile>
  );
}

function Other({ size }) {
  return (
    <Tile
      size={size}
      gradId="other-grad"
      gradient={
        <linearGradient id="other-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#9C7A45" />
          <stop offset="100%" stopColor="#C9A961" />
        </linearGradient>
      }
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="#fff" strokeWidth="2" />
      <ellipse cx="12" cy="12" rx="4.2" ry="10" fill="none" stroke="#fff" strokeWidth="2" />
      <path d="M2.4 8.5h19.2M2.4 15.5h19.2" stroke="#fff" strokeWidth="2" />
    </Tile>
  );
}

const ICONS = {
  instagram: Instagram,
  tiktok: TikTok,
  twitter: Twitter,
  telegram: Telegram,
  youtube: YouTube,
  facebook: Facebook,
  snapchat: Snapchat,
  whatsapp: WhatsApp,
  deals: Deals,
  other: Other,
};

export default function PlatformIcon({ name, size = 40 }) {
  const Cmp = ICONS[name] || Other;
  return <Cmp size={size} />;
}
