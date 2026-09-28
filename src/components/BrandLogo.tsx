import logo from "@/imports/Imagem_do_ChatGPT_28_de_set._de_2026__15_31_45.png"

interface BrandLogoProps {
  compact?: boolean
}

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`${compact ? "size-11" : "size-16"} block shrink-0 overflow-hidden rounded-full bg-white`}
      >
        <img
          src={logo}
          alt="Logo Onde Eu Começo?"
          className="size-full scale-110 object-cover"
        />
      </span>
      <span
        className={`${compact ? "hidden sm:block text-lg" : "text-xl"} font-display font-semibold tracking-tight text-brand-900`}
      >
        Onde Eu Começo?
      </span>
    </div>
  )
}
