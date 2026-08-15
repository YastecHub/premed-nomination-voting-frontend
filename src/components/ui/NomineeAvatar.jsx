import { nameToColor, getInitials } from "../../utils/avatarColor";

/**
 * Colorful initials avatar derived deterministically from nominee name.
 * size: "sm" | "md" | "lg"
 */
export default function NomineeAvatar({ name = "", size = "md" }) {
  const color = nameToColor(name);
  const initials = getInitials(name);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  return (
    <div
      className={`nominee-avatar ${sizeClasses[size]}`}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: `0 2px 8px ${color}40`,
      }}
    >
      {initials}
    </div>
  );
}
