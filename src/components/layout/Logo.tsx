import Image from "next/image"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/main-logo-xxxx.png"
        alt="See My Campus Logo"
        width={300}
        height={60}
        className="h-16 md:h-20 w-auto object-contain"
        priority
        unoptimized
      />
    </div>
  )
}

