import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, BarChart3, TrendingUp, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">7metrics</span>
            </div>
          </div>
          <Link href="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Acceso Club / Login</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Zap className="h-4 w-4" />
            Análisis Profesional en Tiempo Real
          </div>
          <h1 className="mb-6 text-balance text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            Lleva tu club al <span className="text-primary">siguiente nivel</span> con datos profesionales
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl leading-relaxed">
            La plataforma completa para gestionar equipos, registrar estadísticas en vivo y analizar el rendimiento de
            tus jugadores con tecnología de nivel profesional.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary/10 text-lg px-8 bg-transparent"
              >
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:bg-card/80">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-card-foreground">Gestión de Plantilla</h3>
            <p className="text-muted-foreground leading-relaxed">
              Administra todos tus equipos y jugadores en un solo lugar. Información centralizada y siempre actualizada.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all hover:border-secondary/50 hover:bg-card/80">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
              <Zap className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-card-foreground">Estadísticas en Vivo</h3>
            <p className="text-muted-foreground leading-relaxed">
              Registra goles, fallos y pérdidas durante el partido. Interfaz táctil optimizada para la pista.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:bg-card/80">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-card-foreground">Análisis Detallado</h3>
            <p className="text-muted-foreground leading-relaxed">
              Visualiza el rendimiento con gráficas profesionales. Identifica fortalezas y áreas de mejora.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all hover:border-secondary/50 hover:bg-card/80">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-card-foreground">Historial Completo</h3>
            <p className="text-muted-foreground leading-relaxed">
              Accede al historial de todos tus partidos. Compara resultados y evolución a lo largo del tiempo.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:bg-card/80">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-card-foreground">Modo Partido</h3>
            <p className="text-muted-foreground leading-relaxed">
              Interfaz especial para usar durante los partidos. Botones grandes y registro instantáneo.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all hover:border-secondary/50 hover:bg-card/80">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
              <BarChart3 className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-card-foreground">Datos Sincronizados</h3>
            <p className="text-muted-foreground leading-relaxed">
              Todo conectado en tiempo real. Los cambios se reflejan instantáneamente en todas las secciones.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 p-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Transforma la gestión de tu club
          </h2>
          <p className="mb-8 text-pretty text-lg text-muted-foreground leading-relaxed">
            Únete a los clubes que ya utilizan tecnología profesional para mejorar su rendimiento
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8">
              Empezar Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-card-foreground">
                Handball<span className="text-primary">.AI</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 7metrics - Gestión Profesional de Balonmano</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
