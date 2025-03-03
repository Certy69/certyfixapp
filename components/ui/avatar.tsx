import React from 'react'
import Image from 'next/image'
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = '', 
  fallback, 
  className,
  ...props 
}) => {
  const [imageError, setImageError] = React.useState(false)

  return (
    <div 
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ 
  className,
  ...props 
}) => (
  <img
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
)

export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className,
  ...props 
}) => (
  <div
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
)

