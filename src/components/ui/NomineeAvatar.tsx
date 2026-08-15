import { nameToColor, getInitials } from '../../utils/avatarColor';

type AvatarSize = 'sm' | 'md' | 'lg';

interface NomineeAvatarProps {
  name?: string;
  size?: AvatarSize;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
};

/**
 * Colorful initials avatar derived deterministically from nominee name.
 */
export default function NomineeAvatar({ name = '', size = 'md' }: NomineeAvatarProps) {
  const color = nameToColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`nominee-avatar ${SIZE_CLASSES[size]}`}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: `0 2px 8px ${color}40`,
      }}
    >
      {initials}
    </div>
  );
}
