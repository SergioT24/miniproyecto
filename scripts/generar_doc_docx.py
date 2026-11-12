import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = parse_xml(f'<{m} {nsdecls("w")} w:w="{val}" w:type="dxa"/>')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_callout(doc, text, title=None, border_color="0284C7", bg_color="F0F9FF"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'  <w:top w:val="none"/>'
        f'  <w:left w:val="single" w:sz="36" w:space="0" w:color="{border_color}"/>'
        f'  <w:bottom w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    if title:
        run_title = p.add_run(f"{title}\n")
        run_title.bold = True
        run_title.font.name = "Calibri"
        run_title.font.size = Pt(10)
        run_title.font.color.rgb = RGBColor.from_string(border_color)
        
    run_text = p.add_run(text)
    run_text.font.name = "Calibri"
    run_text.font.size = Pt(9.5)
    run_text.font.color.rgb = RGBColor(51, 65, 85)
    
    # Add spacing after table
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(4)

def add_code_block(doc, code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'  <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        f'  <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        f'  <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        f'  <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.05
    
    run = p.add_run(code_text)
    run.font.name = "Consolas"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(30, 41, 59)
    
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(4)

def format_row(row, widths, is_header=False, is_even=False):
    bg_hex = "0F172A" if is_header else ("F8FAFC" if is_even else "FFFFFF")
    text_color = "FFFFFF" if is_header else "334155"
    
    for idx, cell in enumerate(row.cells):
        cell.width = widths[idx]
        set_cell_background(cell, bg_hex)
        set_cell_margins(cell, top=80 if not is_header else 100, 
                               bottom=80 if not is_header else 100, 
                               left=120, right=120)
        
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            f'  <w:left w:val="none"/>'
            f'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
            f'  <w:right w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)
        
        for p in cell.paragraphs:
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            for r in p.runs:
                r.font.name = "Calibri"
                r.font.size = Pt(9.5 if is_header else 9)
                r.bold = is_header
                r.font.color.rgb = RGBColor.from_string(text_color)

def build_document():
    doc = Document()
    
    # Page setup - Margins 1 inch
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    # Document Title
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("Especificación de Componentes en Común e Integración Frontend")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(22)
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42) # Slate-900
    
    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(14)
    run_sub = p_sub.add_run("Fundación Huésped — Módulo de Finanzas (App) & Módulo de Autenticación y Sesión (Auth)")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = RGBColor(2, 132, 199) # Sky-600
    
    # Metadata Block
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(0)
    p_meta.paragraph_format.space_after = Pt(16)
    p_meta.paragraph_format.line_spacing = 1.2
    
    meta_runs = [
        ("Destinatarios: ", True), ("Equipo de Frontend Auth / Sesión\n", False),
        ("Origen: ", True), ("Equipo de Frontend App (Finanzas & Cash Flow)\n", False),
        ("Fecha: ", True), ("Noviembre 2026\n", False),
        ("Estado: ", True), ("Consolidado tras Fase 3 (Parámetros, Presupuesto, Movimientos, Cash Flow)\n", False),
        ("Stack Base: ", True), ("React 19, TypeScript estricto, Vite 8, Tailwind CSS 4, shadcn/UI con Base UI (base-nova), React Router 7, TanStack Query v5", False),
    ]
    for text, bold in meta_runs:
        r = p_meta.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.bold = bold
        r.font.color.rgb = RGBColor(100, 116, 139) # Slate-500
        
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # 1. OBJETIVO DEL DOCUMENTO
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r = h1.add_run("1. Objetivo y Enfoque del Documento")
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph(
        "El presente documento técnico tiene como objetivo primario definir y catalogar todos los componentes de interfaz de usuario, "
        "patrones visuales y contratos de integración que existen o deben existir en común entre el módulo principal de la aplicación "
        "(Finanzas y Cash Flow) y el módulo de Autenticación y Sesión (Auth)."
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    
    p = doc.add_paragraph(
        "Al desarrollar dos módulos de un mismo sistema en paralelo, el riesgo habitual es la duplicación de primitivas de interfaz, "
        "la inconsistencia en tokens de diseño o la divergencia en librerías base (ej. mezclar Radix UI con Base UI). "
        "Este documento establece con precisión:"
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(4)
    
    bullets = [
        ("Qué primitivas de UI ya existen en el repositorio ", "y deben ser reutilizadas directamente por el equipo de Auth sin duplicarlas."),
        ("Qué patrones de formularios de App ya están resueltos ", "(accesibilidad WCAG 2.1 AA, manejo de errores, espaciado)."),
        ("Qué componentes y utilidades de seguridad debe proveer Auth a la App ", "para que la navegación, el shell (sidebar y navbar) y las acciones críticas respeten roles y permisos."),
        ("Cuáles son los contratos TypeScript e interfaces HTTP ", "que conectan ambos mundos sin generar acoplamientos rígidos.")
    ]
    for b_bold, b_text in bullets:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_before = Pt(1)
        bp.paragraph_format.space_after = Pt(2)
        bp.paragraph_format.line_spacing = 1.15
        rb = bp.add_run(b_bold)
        rb.bold = True
        rb.font.color.rgb = RGBColor(30, 41, 59)
        rt = bp.add_run(b_text)
        rt.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # 2. MATRIZ GENERAL DE COMPONENTES COMPARTIDOS
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r = h1.add_run("2. Matriz General de Componentes Compartidos")
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph(
        "La siguiente matriz resume la totalidad de componentes compartidos, indicando su ruta canónica en el repositorio, "
        "quién es el proveedor natural y quién es el consumidor principal:"
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(8)
    
    # Table Matrix
    tbl_data = [
        ("Componente", "Ubicación en Repo", "Proveedor", "Consumidor", "Propósito en Común"),
        ("Button", "src/components/ui/button.tsx", "App (Existente)", "Auth / App", "Botones principales, secundarios y de acción con prop render."),
        ("Input", "src/components/ui/input.tsx", "App (Existente)", "Auth / App", "Inputs de texto, email y password con soporte aria-invalid."),
        ("Field / Label", "src/components/ui/field.tsx, label.tsx", "App (Existente)", "Auth / App", "Etiquetas accesibles asociadas por ID con mensajes de ayuda."),
        ("Card", "src/components/ui/card.tsx", "App (Existente)", "Auth / App", "Contenedor de paneles: formulario de login, perfil, recuperación."),
        ("DropdownMenu", "src/components/ui/dropdown-menu.tsx", "App (Existente)", "Auth (UserMenu)", "Menú desplegable accesible para la barra superior (Navbar)."),
        ("Dialog / AlertDialog", "src/components/ui/dialog.tsx, alert-dialog.tsx", "App (Existente)", "Auth / App", "Modales accesibles: confirmación de logout, sesión expirada."),
        ("Alert", "src/components/ui/alert.tsx", "App (Existente)", "Auth / App", "Alertas contextuales para errores de login o cuenta inactiva."),
        ("Spinner / Skeleton", "src/components/ui/spinner.tsx, skeleton.tsx", "App (Existente)", "Auth / App", "Indicadores de carga mientras se valida la sesión o token inicial."),
        ("Badge", "src/components/ui/badge.tsx", "App (Existente)", "Auth / App", "Etiquetas visuales para mostrar el rol del usuario logueado."),
        ("Separator", "src/components/ui/separator.tsx", "App (Existente)", "Auth / App", "Separadores horizontales/verticales en menús y tarjetas."),
        ("Sonner (toast)", "src/components/ui/sonner.tsx", "App (Existente)", "Auth / App", "Feedback flotante de operaciones (login exitoso, logout, error)."),
        ("FormField", "src/components/app/FormField.tsx", "App (Existente)", "Auth / App", "Envoltorio accesible de campo (Label + Input + Error + Describedby)."),
        ("FormActions", "src/components/app/FormActions.tsx", "App (Existente)", "Auth / App", "Botonera de acciones con espaciado responsive estandarizado."),
        ("FormErrorSummary", "src/components/app/FormErrorSummary.tsx", "App (Existente)", "Auth / App", "Resumen accesible con foco al primer error ante submit fallido."),
        ("<SessionProvider>", "src/features/auth/SessionProvider.tsx", "Auth (A crear)", "App (providers.tsx)", "Context Provider raíz que expone estado de sesión y métodos."),
        ("<UserMenu>", "src/features/auth/components/UserMenu.tsx", "Auth (A crear)", "App (Navbar.tsx)", "Avatar, nombre de usuario, rol y dropdown de logout en Navbar."),
        ("<RequireAuth>", "src/features/auth/guards/RequireAuth.tsx", "Auth (A crear)", "App (router.tsx)", "Guarda de ruta que redirige a /login preservando returnUrl."),
        ("<RequirePermission>", "src/features/auth/guards/RequirePermission.tsx", "Auth (A crear)", "App (router.tsx)", "Guarda de ruta que valida permiso y muestra ForbiddenPage."),
        ("<ForbiddenPage>", "src/features/auth/pages/ForbiddenPage.tsx", "Auth (A crear)", "App (router.tsx)", "Pantalla 403 accesible con botón de retorno al Tablero."),
        ("<Can> / <PermissionGate>", "src/features/auth/components/Can.tsx", "Auth (A crear)", "App (Módulos)", "Renderizado condicional de botones/acciones según permiso."),
        ("<SessionExpiredDialog>", "src/features/auth/components/SessionExpiredDialog.tsx", "Auth (A crear)", "App (Layout)", "Modal cuando la API devuelve 401 durante el uso."),
        ("<DevRoleSelector>", "src/features/auth/components/DevRoleSelector.tsx", "Auth (A crear)", "App (/dev)", "Selector rápido de rol en modo dev (import.meta.env.DEV)."),
    ]
    
    col_widths = [Inches(1.2), Inches(1.3), Inches(1.0), Inches(1.0), Inches(2.0)]
    tbl = doc.add_table(rows=len(tbl_data), cols=5)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    for r_idx, row in enumerate(tbl.rows):
        is_header = (r_idx == 0)
        is_even = (r_idx % 2 == 0)
        data = tbl_data[r_idx]
        for c_idx, cell in enumerate(row.cells):
            cell.paragraphs[0].text = data[c_idx]
        format_row(row, col_widths, is_header=is_header, is_even=is_even)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # 3. REGLA TÉCNICA PRIMORDIAL: BASE UI VS RADIX UI
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r = h1.add_run("3. Regla Técnica Primordial: Base UI vs Radix UI")
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    add_callout(
        doc,
        "La aplicación utiliza la nueva generación de shadcn/ui construida sobre @base-ui/react (estilo 'base-nova'). "
        "NO está construida sobre Radix UI. Está terminantemente prohibido instalar @radix-ui/* o utilizar el prop 'asChild'. "
        "Para componer enlaces de React Router con botones u otros componentes, Base UI utiliza el prop nativo 'render'.",
        title="ADVERTENCIA CRÍTICA DE COMPONIBILIDAD",
        border_color="E11D48",
        bg_color="FFF1F2"
    )
    
    p = doc.add_paragraph("Ejemplo de uso correcto en formularios de autenticación o links de navegación:")
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(2)
    
    add_code_block(doc, 
"""// CORRECTO (Base UI estilo base-nova):
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

<Button render={<Link to="/login" />}>
  Iniciar sesión
</Button>

// INCORRECTO (Radix UI clásico - FALLA EN RUNTIME):
<Button asChild>
  <Link to="/login">Iniciar sesión</Link>
</Button>"""
    )

    # -------------------------------------------------------------
    # 4. PRIMITIVAS DE UI A REUTILIZAR
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r = h1.add_run("4. Primitivas UI Existentes a Reutilizar (src/components/ui/)")
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph(
        "El módulo de Auth NO debe crear botones, inputs, cards ni modales propios desde cero. "
        "Todas las primitivas ya están integradas, estilizadas con tokens de Tailwind 4 y probadas en accesibilidad en src/components/ui/:"
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    
    sections_ui = [
        ("Button (@/components/ui/button)", 
         "Soporta variantes semánticas: default, outline, destructive, secondary, ghost y link. "
         "Soporta tamaños: sm, default, lg, icon y icon-sm. "
         "Maneja estados de loading, disabled nativo y foco visible accesible. "
         "Uso en Auth: Botón de submit ('Ingresar'), botón de cancelar, botones de cambio de rol y trigger de logout."),
        
        ("Input (@/components/ui/input)", 
         "Componente de entrada con estilizado consistente de bordes, fondo bg-card/bg-input, ring de foco (focus-visible:ring-3) y estado de error (aria-invalid:border-destructive). "
         "Uso en Auth: Campos de email, nombre de usuario y contraseña."),
        
        ("Field y Label (@/components/ui/field, label)", 
         "Provee etiquetas accesibles (<Label htmlFor='...'>) y contenedores de campo con vinculación aria-describedby automática. "
         "Uso en Auth: Etiquetas de campos del login y textos secundarios de ayuda."),
        
        ("Card (@/components/ui/card)", 
         "Estructura compuesta por Card, CardHeader, CardTitle, CardDescription, CardContent y CardFooter. "
         "Uso en Auth: Contenedor central de la pantalla LoginPage y tarjetas del diálogo de perfil o cambio de contraseña."),
        
        ("DropdownMenu (@/components/ui/dropdown-menu)", 
         "Menú desplegable accesible con soporte completo de navegación por teclado (flechas, Enter, Escape), grupos, etiquetas y separadores. "
         "Uso en Auth: Pieza angular del UserMenu que se ubicará en la Navbar superior."),
        
        ("Alert (@/components/ui/alert)", 
         "Caja de aviso contextual con variantes default y destructive. "
         "Uso en Auth: Notificación en el formulario cuando las credenciales son incorrectas o la cuenta está suspendida."),
        
        ("Dialog y AlertDialog (@/components/ui/dialog, alert-dialog)", 
         "Modales con backdrop oscurecido, trampa de foco accesible (focus trap) y cierre con tecla Escape. "
         "Uso en Auth: Confirmación destructiva de logout y modal de sesión expirada (SessionExpiredDialog)."),
        
        ("Spinner y Skeleton (@/components/ui/spinner, skeleton)", 
         "Animaciones de carga optimizadas y compatibles con prefers-reduced-motion. "
         "Uso en Auth: Reemplazo visual mientras el SessionProvider valida si hay una sesión activa persistida al recargar la app."),
        
        ("Badge (@/components/ui/badge)", 
         "Pastillas visuales para etiquetado. "
         "Uso en Auth: Mostrar el rol del usuario (ej. 'Administrador', 'Tesorería', 'Editor')."),
        
        ("Sonner (@/components/ui/sonner)", 
         "Toaster global montado en AppLayout. "
         "Uso en Auth: Disparar toast.success('Sesión iniciada correctamente') o toast.info('Sesión cerrada').")
    ]
    
    for title_s, desc_s in sections_ui:
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(3)
        sp.paragraph_format.space_after = Pt(2)
        sp.paragraph_format.line_spacing = 1.15
        rt = sp.add_run(f"• {title_s}: ")
        rt.bold = True
        rt.font.color.rgb = RGBColor(15, 23, 42)
        rd = sp.add_run(desc_s)
        rd.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # 5. PATRONES DE FORMULARIO DE APP
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r = h1.add_run("5. Patrones de Formulario de App (src/components/app/)")
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph(
        "Para mantener una experiencia homogénea con los formularios de Parámetros, Presupuesto y Movimientos, "
        "los formularios de Auth (Login, Reset Password) deben ensamblarse utilizando los patrones ubicados en src/components/app/:"
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(4)
    
    add_callout(
        doc,
        "1. FormField: Conecta el label, el input, el mensaje de error y la descripción mediante IDs únicos generados con useId().\n"
        "2. FormErrorSummary: En caso de errores de validación múltiples, renderiza un bloque de resumen accesible que toma el foco inmediatamente al fallar el submit, permitiendo a personas con lectores de pantalla navegar a los campos inválidos.\n"
        "3. FormActions: Alinea los botones de 'Ingresar' y acciones secundarias con espaciado responsive.",
        title="PATRONES FORM EN APP",
        border_color="0D9488",
        bg_color="F0FDFA"
    )
    
    p = doc.add_paragraph("Ejemplo canónico de cómo estructurar la página LoginPage reutilizando estos componentes:")
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(2)
    
    add_code_block(doc,
"""import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/app/FormField"
import { FormActions } from "@/components/app/FormActions"
import { FormErrorSummary } from "@/components/app/FormErrorSummary"
import { useSession } from "@/features/auth"

const loginSchema = z.object({
  email: z.string().email("Ingresá un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export function LoginPage() {
  const { login, isLoading } = useSession()
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await login(data.email, data.password)
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Fundación Huésped</CardTitle>
          <CardDescription>Ingresá tus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <FormErrorSummary errors={form.formState.errors} />

            <FormField label="Correo electrónico" error={form.formState.errors.email?.message} required>
              <Input type="email" placeholder="usuario@huesped.org.ar" {...form.register("email")} />
            </FormField>

            <FormField label="Contraseña" error={form.formState.errors.password?.message} required>
              <Input type="password" placeholder="••••••••" {...form.register("password")} />
            </FormField>

            <FormActions>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Ingresando…" : "Iniciar sesión"}
              </Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}"""
    )

    # -------------------------------------------------------------
    # 6. COMPONENTES QUE AUTH DEBE PROVEER A LA APP
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r = h1.add_run("6. Componentes de Autorización que Auth Debe Proveer a la App")
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph(
        "A continuación se detallan los componentes y utilidades que el módulo de Auth debe exponer "
        "para que la App principal pueda conectarlos en su shell y en sus páginas de negocio:"
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    
    auth_comps = [
        ("<SessionProvider>", 
         "Ubicación: src/features/auth/SessionProvider.tsx\n"
         "Consumido en: src/app/providers.tsx\n"
         "Responsabilidad: Contexto central de sesión. Debe inicializar el usuario al montar (ej: leyendo cookie/token o consultando /api/auth/me). "
         "Debe exponer SessionContext con { user, isAuthenticated, isLoading, login, logout }."),
        
        ("<UserMenu>", 
         "Ubicación: src/features/auth/components/UserMenu.tsx\n"
         "Consumido en: src/components/Navbar.tsx\n"
         "Responsabilidad: Se monta en la barra superior al lado del ThemeToggle. Muestra el nombre del usuario logueado, su rol en un Badge discreto, "
         "y al hacer clic abre un DropdownMenu con las opciones de 'Mi perfil', 'Cambiar clave' y 'Cerrar sesión' (con confirmación)."),
        
        ("<RequireAuth>", 
         "Ubicación: src/features/auth/guards/RequireAuth.tsx\n"
         "Consumido en: src/app/router.tsx\n"
         "Responsabilidad: Envoltorio para rutas privadas en React Router 7. Si el usuario no está autenticado, redirige a /login guardando la ruta actual: "
         "<Navigate to='/login' state={{ from: location }} replace />. Mientras isLoading es true, muestra un LoadingState o Spinner."),
        
        ("<RequirePermission>", 
         "Ubicación: src/features/auth/guards/RequirePermission.tsx\n"
         "Consumido en: src/app/router.tsx\n"
         "Responsabilidad: Guarda de segundo nivel que recibe prop permission: Permiso. Si el usuario está autenticado pero no tiene dicho permiso, "
         "renderiza la página <ForbiddenPage /> dentro del layout general."),
        
        ("<ForbiddenPage>", 
         "Ubicación: src/features/auth/pages/ForbiddenPage.tsx\n"
         "Consumido en: src/app/router.tsx\n"
         "Responsabilidad: Pantalla 403 amigable y accesible (icono ShieldAlert, título 'Acceso restringido', mensaje explicativo y botón render={<Link to='/' />} para volver al Tablero)."),
        
        ("<Can> / <PermissionGate>", 
         "Ubicación: src/features/auth/components/Can.tsx\n"
         "Consumido en: src/features/* (en tablas y formularios)\n"
         "Responsabilidad: Componente declarativo para ocultar o deshabilitar elementos individuales de UI. Ejemplo:\n"
         "<Can I='crear' a='movimientos'>\n  <Button onClick={openCreate}>Nuevo movimiento</Button>\n</Can>"),
        
        ("<SessionExpiredDialog>", 
         "Ubicación: src/features/auth/components/SessionExpiredDialog.tsx\n"
         "Consumido en: src/layouts/AppLayout.tsx\n"
         "Responsabilidad: Modal de aviso cuando la API devuelve un error 401 durante el uso continuo de la aplicación, "
         "permitiendo al usuario iniciar sesión nuevamente sin perder los datos que estaba editando o redirigiéndolo con elegancia."),
        
        ("<DevRoleSelector>", 
         "Ubicación: src/features/auth/components/DevRoleSelector.tsx\n"
         "Consumido en: src/pages/UiGalleryPage.tsx o en la barra lateral en desarrollo\n"
         "Responsabilidad: Exclusivo de desarrollo (import.meta.env.DEV). Permite a los desarrolladores y QA cambiar de rol rápidamente "
         "(Administrador, Editor, Aprobador, Consulta, Tesorería) persistiendo la elección en localStorage ('dev-role').")
    ]
    
    for c_title, c_desc in auth_comps:
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(4)
        sp.paragraph_format.space_after = Pt(2)
        sp.paragraph_format.line_spacing = 1.15
        rt = sp.add_run(f"• {c_title}\n")
        rt.bold = True
        rt.font.color.rgb = RGBColor(2, 132, 199)
        rd = sp.add_run(c_desc)
        rd.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # 7. CONTRATOS TYPESCRIPT Y HOOKS COMPARTIDOS
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r = h1.add_run("7. Contratos TypeScript y Hooks Compartidos")
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph(
        "Para evitar desincronizaciones de tipos, proponemos que src/features/auth/types.ts exporte exactamente "
        "los siguientes contratos acordados con el dominio de la Fundación:"
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(2)
    
    add_code_block(doc,
"""// src/features/auth/types.ts

export type Rol =
  | "administrador"
  | "editor"
  | "aprobador"
  | "consulta"
  | "tesoreria"

export type Permiso =
  // Parámetros
  | "parametros:ver"
  | "parametros:editar"
  // Presupuesto
  | "presupuesto:ver"
  | "presupuesto:crear"
  | "presupuesto:aprobar"
  | "presupuesto:cerrar"
  // Movimientos
  | "movimientos:ver"
  | "movimientos:crear"
  | "movimientos:editar"
  | "movimientos:eliminar"
  // Cash Flow
  | "cashflow:ver"
  | "cashflow:exportar"
  // Administración
  | "usuarios:ver"
  | "usuarios:gestionar"
  | "auditoria:ver"

export interface SessionUser {
  id: string
  nombre: string
  email: string
  rol: Rol
  permisos: Permiso[]
  /** Si está vacío o contiene '*', tiene acceso a todos los proyectos */
  proyectosAsignados: string[]
}

export interface SessionContextValue {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}"""
    )
    
    p = doc.add_paragraph("Hooks que el módulo de Auth debe exportar para consumo de la App:")
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(2)
    
    add_code_block(doc,
"""// Hook para acceder al usuario y acciones de login/logout
export function useSession(): SessionContextValue

// Hook para evaluación granular de permisos y roles
export function usePermissions(): {
  hasPermission: (permiso: Permiso) => boolean
  hasRole: (rol: Rol | Rol[]) => boolean
  canAccessProject: (proyectoId: string) => boolean
  can: (action: string, subject: string) => boolean
}"""
    )

    # -------------------------------------------------------------
    # 8. INTEGRACIÓN CON EL CLIENTE HTTP
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r = h1.add_run("8. Integración con el Cliente HTTP (src/lib/api/client.ts)")
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph(
        "Toda la aplicación realiza sus peticiones mediante el objeto apiClient en src/lib/api/client.ts. "
        "Dicho archivo cuenta con una marca explícita // TODO(auth):"
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(4)
    
    add_code_block(doc,
"""// Línea 78 de src/lib/api/client.ts:
const response = await fetch(buildUrl(path, query), {
  ...init,
  method,
  headers: requestHeaders,
  body: requestBody,
  // TODO(auth): reemplazar por el fetch autenticado de la librería real.
  credentials: "include",
})"""
    )
    
    p = doc.add_paragraph(
        "Puntos a coordinar con Auth:\n"
        "1. Si el backend utiliza Cookies de sesión HttpOnly (recomendado): credentials: 'include' ya está configurado y no hace falta enviar headers de token.\n"
        "2. Si el backend utiliza Tokens JWT: apiClient debe exponer un método apiClient.setToken(token) o leerlo de un getAccessToken() provisto por Auth.\n"
        "3. Captura de 401: Cuando response.status === 401, apiClient debe invocar un handler registrado por Auth (ej. onSessionExpired()) para abrir el SessionExpiredDialog o redirigir."
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # 9. TESTING Y DESARROLLO (MSW & VITEST)
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r = h1.add_run("9. Estrategia de Testing y Desarrollo (MSW & Vitest)")
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    p = doc.add_paragraph(
        "Para que la incorporación de Auth no rompa los 135 tests existentes ni el comando npm run ci, "
        "deben contemplarse dos aspectos:"
    )
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(4)
    
    bullets_test = [
        ("MSW Handlers: ", "En src/test/msw/handlers.ts, Auth debe sumar sus handlers (...authHandlers) para responder a /api/auth/login, /api/auth/logout y /api/auth/me en desarrollo y tests."),
        ("Helper de render en tests: ", "En src/test/render.tsx, el wrapper renderWithProviders debe incluir un mock por defecto de SessionProvider con un usuario 'administrador' activo, permitiendo sobreescribir el usuario en tests específicos de permisos.")
    ]
    for b_bold, b_text in bullets_test:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_before = Pt(1)
        bp.paragraph_format.space_after = Pt(2)
        bp.paragraph_format.line_spacing = 1.15
        rb = bp.add_run(b_bold)
        rb.bold = True
        rt = bp.add_run(b_text)

    # -------------------------------------------------------------
    # 10. CHECKLIST DE INTEGRACIÓN CONJUNTA
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    r = h1.add_run("10. Checklist de Integración Conjunta")
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    checklist = [
        "1. El módulo de Auth se crea en src/features/auth/ respetando la estructura de carpetas.",
        "2. LoginPage y componentes de Auth usan las primitivas shadcn (Base UI) sin instalar librerías externas.",
        "3. Ningún componente usa el prop 'asChild'; se usa 'render' de Base UI.",
        "4. SessionProvider se monta en src/app/providers.tsx.",
        "5. UserMenu se conecta en src/components/Navbar.tsx.",
        "6. AppSidebar filtra los ítems del menú consumiendo usePermissions().",
        "7. Rutas protegidas en src/app/router.tsx quedan envueltas con <RequireAuth>.",
        "8. Error 401 de la API dispara el diálogo o redirección adecuada.",
        "9. Todos los tests de la app pasan (npm test) y el build es exitoso (npm run build)."
    ]
    for item in checklist:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(item)
        r.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # Save outputs
    out_dir_docs = r"C:\Facultad\PPS\miniproyecto\docs"
    out_file_miniproyecto = os.path.join(out_dir_docs, "Componentes_Comunes_App_y_Auth.docx")
    out_file_root = r"C:\Facultad\PPS\Componentes_Comunes_App_y_Auth.docx"
    
    os.makedirs(out_dir_docs, exist_ok=True)
    doc.save(out_file_miniproyecto)
    doc.save(out_file_root)
    print(f"Documento guardado con éxito en:")
    print(f"1. {out_file_miniproyecto}")
    print(f"2. {out_file_root}")

if __name__ == "__main__":
    build_document()
