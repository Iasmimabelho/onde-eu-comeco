import { useAuth } from "@/contexts/AuthContext"
import BrandLogo from "@/components/BrandLogo"

export default function Footer() {
  const { navigate } = useAuth()

  return (
    <footer className="site-footer bg-white text-brand-900 border-t border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="mb-5">
              <BrandLogo />
            </div>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xs">
              Transformamos dúvidas em caminhos. Conectamos pessoas a oportunidades de estudo,
              trabalho, capacitação e apoio.
            </p>
            <p className="text-brand-700 text-xs mt-4 italic font-display">
              "Você não precisa saber o caminho. Só precisa descobrir o primeiro passo."
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold text-brand-800 uppercase tracking-widest mb-4">Plataforma</div>
            <div className="space-y-2.5">
              {[
                ["Explorar oportunidades", "/oportunidades"],
                ["Explorar mapa", "/mapa"],
                ["Começar agora", "/cadastro"],
                ["Entrar", "/login"],
              ].map(([label, href]) => (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  className="block text-sm text-slate-600 hover:text-brand-900 transition-colors"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => {
                  const el = document.getElementById("como-funciona")
                  if (el) { el.scrollIntoView({ behavior: "smooth" }) }
                  else { navigate("/"); setTimeout(() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" }), 120) }
                }}
                className="block text-sm text-slate-600 hover:text-brand-900 transition-colors"
              >
                Como funciona
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-brand-800 uppercase tracking-widest mb-4">Para negócios</div>
            <div className="space-y-2.5">
              {[
                ["Para empresas", "/para-empresas"],
                ["Para instituições", "/para-instituicoes"],
                ["Planos e preços", "/planos"],
                ["Acesso administrativo", "/admin"],
              ].map(([label, href]) => (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  className="block text-sm text-slate-600 hover:text-brand-900 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-brand-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">
            © 2025 Onde Eu Começo? · Todos os direitos reservados
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-600 text-xs">Privacidade</span>
            <span className="text-slate-600 text-xs">Termos de uso</span>
            <span className="text-slate-600 text-xs">Suporte</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
