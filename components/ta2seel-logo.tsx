"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type LogoSize = "nav" | "hero" | "card"

const sizeMap: Record<LogoSize, string> = {
  nav: "h-10 w-auto",
  hero: "h-16 w-auto md:h-20",
  card: "h-12 w-auto",
}

interface Ta2seelLogoProps {
  size?: LogoSize
  animated?: boolean
  className?: string
}

export const Ta2seelLogo: React.FC<Ta2seelLogoProps> = ({ size = "nav", animated = false, className }) => {
  const Wrapper = animated ? motion.div : "div"
  return (
    <Wrapper
      initial={animated ? { opacity: 0, scale: 0.92, y: 6 } : undefined}
      animate={animated ? { opacity: 1, scale: 1, y: 0 } : undefined}
      transition={animated ? { duration: 0.6, ease: "easeOut" } : undefined}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <Image
        src="/ta2seel.svg"
        alt="شعار أكاديمية تأصيل"
        width={320}
        height={160}
        priority
        className={cn("object-contain", sizeMap[size])}
      />
    </Wrapper>
  )
}
