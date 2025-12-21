import Image from "next/image"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/main-logo-xxxx.png"
        alt="See My Campus Logo"
        width={250}
        height={50}
        className="h-12 w-auto object-contain"
        priority
        unoptimized
      />
    </div>
  )
}

