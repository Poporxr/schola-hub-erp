"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  iconClassName?: string;
};

const UserAvatar = ({
  src,
  alt = "User",
  size = 40,
  className,
  iconClassName,
}: UserAvatarProps) => {
  const iconSize = Math.max(14, Math.round(size * 0.5));

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-surface-muted text-muted-foreground",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <User className={cn("h-5 w-5", iconClassName)} style={{ width: iconSize, height: iconSize }} />
      )}
    </div>
  );
};

export default UserAvatar;
