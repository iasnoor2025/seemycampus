import Image from "next/image"

interface LogoProps {
  className?: string
  size?: "default" | "small" | "large"
}

export function Logo({ className, size = "default" }: LogoProps) {
  const sizeClasses = {
    default: "h-16 md:h-20 w-auto",
    small: "h-12 w-auto",
    large: "h-24 md:h-32 w-auto",
  }

  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <Image
        src="/main-logo-xxxx.png"
        alt="See My Campus Logo"
        width={300}
        height={60}
        className={`${sizeClasses[size]} object-contain`}
        priority
        quality={90}
      />
    </div>
  )
}

