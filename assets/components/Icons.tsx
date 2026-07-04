// src/components/Icons.tsx
// Reusable SVG icons (replace emoji usage). Recolor/resize via props.
import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export type IconProps = {
  color?: string;
  size?: number;
};

const base = (color: string, size: number, d: string) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d={d} />
  </Svg>
);

// 👤 person
export const PersonIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  );

// ⚙️ gear / settings
export const GearIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  );

// 📋 clipboard / orders
export const ClipboardIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
  );

// 📅 calendar
export const CalendarIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
  );

// 🔧 wrench / maintenance
export const WrenchIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  );

// 🔔 bell
export const BellIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
  );

// ❄️ snowflake
export const SnowflakeIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z',
  );

// 🔒 lock
export const LockIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  );

// ⚡ bolt / electrical
export const BoltIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M7 2v11h3v9l7-12h-4l4-8z');

// 💧 water drop / plumbing
export const DropIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z',
  );

// 🔨 hammer / carpentry
export const HammerIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M19.66 9.64L17.5 11.8 12.2 6.5l2.16-2.16c.58-.58.96-.34 1.14-.16l4 4c.77.77.56 1.06.16 1.46zM11.5 7.2l5.3 5.3-1.41 1.41-.7-.7-7.49 7.5c-.2.19-.46.29-.7.29-.26 0-.5-.1-.71-.29l-2.5-2.5c-.19-.21-.29-.45-.29-.71 0-.26.1-.5.29-.71l7.5-7.5-.7-.7L11.5 7.2z',
  );

// 🧱 brick wall / masonry
export const BrickIcon = ({ color = '#000', size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Rect x="2" y="4" width="9" height="5" rx="0.6" />
    <Rect x="13" y="4" width="9" height="5" rx="0.6" />
    <Rect x="2" y="10.5" width="4" height="5" rx="0.6" />
    <Rect x="8" y="10.5" width="8" height="5" rx="0.6" />
    <Rect x="18" y="10.5" width="4" height="5" rx="0.6" />
    <Rect x="2" y="17" width="9" height="5" rx="0.6" />
    <Rect x="13" y="17" width="9" height="5" rx="0.6" />
  </Svg>
);

// 📷 camera
export const CameraIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M12 15.2c1.77 0 3.2-1.43 3.2-3.2s-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2 1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
  );

// 🖼️ image / gallery
export const ImageIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  );

// 🎥 video camera
export const VideoIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
  );

// 📁 folder
export const FolderIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  );

// ✕ close
export const CloseIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(
    color,
    size,
    'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  );

// ▶ play
export const PlayIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M8 5v14l11-7z');

// ← arrow back
export const ArrowLeftIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z');

// → arrow forward
export const ArrowRightIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z');

// 🎓 school
export const SchoolIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z');

// 🔍 search
export const SearchIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z');

// 👥 groups
export const GroupsIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z');

// 👷 engineering
export const EngineeringIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z'); // Re-using wrench path for engineering

// 🛡️ security
export const SecurityIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z');

// 🧼 sanitizer
export const SanitizerIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M15.5 6.5C15.5 5.67 14.83 5 14 5h-2V3h1V1h-2v2H9v2h2v1.5H9c-1.1 0-2 .9-2 2v2.53C5.83 12.58 5 13.92 5 15.5 5 17.98 7.02 20 9.5 20s4.5-2.02 4.5-4.5c0-1.58-.83-2.92-2-3.47V8.5h2c1.1 0 2-.9 2-2V5h-.5v1.5z');

// ✉️ mail
export const MailIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z');

// 📍 location
export const LocationIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z');

// ✎ edit / pencil
export const EditIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z');

// ✅ check circle
export const CheckCircleIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z');

// ❓ help
export const HelpIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z');

// 🚪 logout
export const LogoutIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z');

// ⋯ more (horizontal)
export const MoreIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z');

// 📄 document / description
export const DescriptionIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z');

// › chevron right
export const ChevronRightIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z');

// ⤴ share
export const ShareIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z');

// ⚠️ warning
export const WarningIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z');

// ✓ check (no circle)
export const CheckIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z');

// ⏰ clock / schedule
export const ClockIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z');

// 👁️ eye / visibility
export const EyeIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');

// 🙈 eye off / visibility_off
export const EyeOffIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z');

// 🏛️ account_balance / bank / institution
export const BankIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z');

// 🔑 login / arrow into door
export const LoginIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z');

// 👤➕ person_add
export const PersonAddIcon = ({ color = '#000', size = 24 }: IconProps) =>
  base(color, size, 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z');
