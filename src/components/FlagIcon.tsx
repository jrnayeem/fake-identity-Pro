interface FlagIconProps {
  code: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FlagIcon({ code, size = "md", className = "" }: FlagIconProps) {
  const sizeMap = { sm: "1em", md: "1.3em", lg: "2em" };
  return (
    <span
      className={`fi fi-${code.toLowerCase()} ${className}`}
      style={{
        display: "inline-block",
        width: sizeMap[size],
        height: sizeMap[size],
        borderRadius: 3,
        flexShrink: 0,
        backgroundSize: "cover",
        verticalAlign: "middle",
      }}
      aria-label={code}
    />
  );
}
