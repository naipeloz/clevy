# Investigación LinkedIn API — Spikes para el MVP

> **Estado:** Investigación (spikes) · **Fecha:** 2026-05-29
> **Alcance:** Login de candidatos, conexión de cuentas de empresa, importación de vacantes y postulados.
> **Audiencia:** Equipo de producto/ingeniería del MVP (aún **no** somos partner de LinkedIn).

## TL;DR (resumen ejecutivo)

| Caso de uso | ¿Disponible sin ser partner? | Producto / scopes | Veredicto MVP |
|---|---|---|---|
| **Login de candidato** (Sign In with LinkedIn) | ✅ **Sí, self-serve** | OpenID Connect: `openid`, `profile`, `email` | **Viable ahora** |
| Publicar como miembro | ✅ Sí, self-serve | `w_member_social` | Viable (poco relevante) |
| **Conectar cuenta de empresa / Página** | ❌ No | Community Management API (`r/w_organization_social`, `rw_organization_admin`) | **Bloqueado: requiere aprobación de partner** |
| **Importar vacantes publicadas por la empresa** | ❌ No | Job Posting API (Talent Solutions) | **Cerrado a nuevos partners en 2026** |
| **Obtener postulados (applicants) por vacante** | ❌ No | Apply Connect / Recruiter System Connect | **Solo partners ATS aprobados, a discreción de LinkedIn** |

**Conclusión central:** El único camino abierto y self-serve para nuestro MVP es el **login de candidato vía OpenID Connect**. Todo lo demás (Páginas de empresa, importar vacantes, leer postulados) está detrás de **programas de partners cerrados o discrecionales** que no aceptan startups pre-revenue sin un proceso de certificación y, en el caso de Job Postings, **no aceptan nuevos partners en 2026**.

---

## SPIKE 1 — Scopes de OAuth 2.0 (login de candidato y conexión de empresa)

### 1.A · Login de candidato — "Sign In with LinkedIn using OpenID Connect" ✅

- Es un producto **self-serve**: se habilita desde la pestaña **Products** del LinkedIn Developer Portal sin proceso de aprobación.
- Scopes: **`openid`**, **`profile`**, **`email`**. Estos, junto con `w_member_social`, son las únicas **"Open Permissions"** que no requieren revisión/aprobación.
  - `openid` → autenticación OIDC (devuelve un `id_token` JWT).
  - `profile` → nombre, foto, `vanityName`, etc.
  - `email` → email del miembro (campo **opcional**: el usuario podría no concederlo o no tenerlo verificado; manejar el caso nulo).
- **Reemplazó** al flujo antiguo basado en **`r_liteprofile` + `r_emailaddress`**, que quedó **deprecado el 1 de agosto de 2023**. No usar los scopes viejos en código nuevo.
- Implementación: flujo OAuth 2.0 Authorization Code estándar; el `id_token` ya trae los claims básicos del perfil (no requiere llamada adicional a `/userinfo`, aunque existe).

> **Implicación para el MVP:** podemos implementar "Iniciar sesión con LinkedIn" para candidatos **hoy mismo**, sin ser partner. Es el caso de uso de mayor ROI y menor fricción.

**Nota sobre datos del candidato:** OIDC entrega *identidad básica* (nombre, foto, email), **no** el perfil profesional completo (experiencia laboral, skills, educación, conexiones). Esos datos enriquecidos **no están disponibles** vía API self-serve. Si el matching cultural/profesional necesita historial laboral, el candidato deberá ingresarlo manualmente o subir su CV — no podemos extraerlo de LinkedIn.

### 1.B · Conexión de cuenta de empresa / Página ❌

- Todos los scopes de organización pertenecen a la **Community Management API**:
  - `r_organization_social` (leer posts/actividad de la Página)
  - `w_organization_social` (publicar como la Página)
  - `rw_organization_admin` (administrar la Página)
  - *(el antiguo `rw_company_admin` está deprecado — evidencia con voto 2-1, menor confianza)*
- La Community Management API es un **"Vetted Product"** (producto verificado): **requiere completar un formulario de acceso y ser aprobado**. **No es self-serve.**
- Estos scopes **no son "Open Permissions"** → no se pueden usar sin aprobación.

> **Implicación para el MVP:** no podemos pedir al usuario que "conecte su Página de empresa de LinkedIn" sin antes ser aprobados en el programa Community Management. Para el MVP, la empresa deberá **crear/gestionar sus vacantes dentro de nuestra plataforma**, no sincronizarlas desde su Página de LinkedIn.

### 1.C · Modelo de acceso de dos tiers y proceso de revisión

Para la plataforma de Marketing/Developer (donde vive Community Management), el acceso es de **dos niveles**:

1. **Development tier** (por defecto al crear la app). Límites duros:
   - **500 llamadas/app/24h**
   - **100 llamadas/miembro/24h**
   - **Sin `BATCH_GET`**
   - **Webhooks deshabilitados**
2. **Standard tier** (mediante upgrade verificado). Requisitos:
   - Organización legal, **email corporativo**, sitio web, **política de privacidad**.
   - **Verificación de la Página de LinkedIn** de la empresa.
   - Para Standard: **screencast del flujo OAuth** + **demo en vivo** con un *Business Development POC* de LinkedIn ("Technical Sign Off").

> ⚠️ **Cumplir los requisitos mínimos NO garantiza la aprobación.** LinkedIn selecciona a sus partners **a su discreción**.

**Restricciones para apps en desarrollo / en revisión (resumen):**
- Funcionan, pero con los límites duros del Development tier (500/100, sin batch, sin webhooks).
- Suficiente para *demos* y *pruebas internas*, no para producción a escala.
- El upgrade a Standard / la aprobación de Vetted Products exige verificación de negocio + demo.

---

## SPIKE 2 — Importar vacantes y obtener postulados

### 2.A · Job Posting API (importar/publicar vacantes) ❌

- En la documentación **`li-lts-2026-03`**, LinkedIn **NO está aceptando nuevas asociaciones (partnerships)** para la Job Posting API; redirige a **Apply Connect**.
- Restringida a **developers ya aprobados** como **LinkedIn Talent Solutions Partner** con un **acuerdo de API firmado**.
- Diseñada para **ATS y distribuidores de empleo**, no para el uso directo de un MVP.

> **Implicación para el MVP:** importar/leer las vacantes que una empresa ya publicó en LinkedIn **no es posible** por la vía oficial. La API está efectivamente cerrada a nuevos entrantes en 2026.

### 2.B · Obtener postulados (applicants) por vacante ❌

- Requiere **Apply Connect** o **Recruiter System Connect (RSC)** — ambos **solo para partners**.
- Gateados por la **aplicación de Talent Solutions Partner** (discrecional):
  - El formulario pide listar los **5 clientes más grandes**.
  - **LinkedIn no puede prometer** que se firmará un acuerdo.
  - **Apply Connect** requiere **certificación + demos** antes de entregar una *Production API Key*.
  - **"Apply with LinkedIn"** quedó **cerrado a nuevos partners el 1 de octubre de 2025**.

> **Implicación para el MVP:** leer la lista de postulados de una vacante de LinkedIn **no es alcanzable** para una startup pre-revenue. El requisito de "5 clientes más grandes" presupone un ATS ya establecido con base de clientes.

### 2.C · Webhooks de eventos de postulación

- En el **Development tier los webhooks están deshabilitados**.
- Los flujos de sincronización de aplicaciones (Apply Connect / Application Sync / RSC) viven dentro de los programas de partners. (No se verificó adversarialmente el detalle exacto de los webhooks de postulación — ver *Preguntas abiertas*.)

### 2.D · Alternativas evaluadas

> ⚠️ Las afirmaciones de esta subsección provienen de fuentes secundarias/blogs y **no pasaron** el mismo filtro de verificación adversarial que el resto del documento. Tratar como orientación, no como hecho confirmado.

**1. Scraping de LinkedIn**
- Caso de referencia: **hiQ Labs v. LinkedIn**. Aunque hubo fallos iniciales favorables al scraping de datos *públicos* bajo la CFAA, el litigio **terminó en contra de hiQ**: se determinó que violó los Términos de Servicio de LinkedIn (incumplimiento de contrato). hiQ esencialmente cerró.
- Señal de mercado: **Proxycurl** (uno de los mayores proveedores de datos de LinkedIn vía scraping) **cerró en 2025**, presuntamente por presión legal de LinkedIn.
- **Riesgo:** alto. Violación de ToS, riesgo de bloqueo de IP/cuentas, exposición legal y reputacional. **No recomendado** para un producto comercial.

**2. Proveedores / agregadores de terceros**
- Existen APIs de "job postings" agregadas (p. ej. proveedores listados por Bright Data, TheirStack y similares) que recopilan ofertas de múltiples fuentes.
- Suelen ser de pago, con cobertura y frescura variables, y con su **propia exposición a riesgo de ToS** según cómo obtengan los datos de LinkedIn.

**3. Integración vía ATS partner**
- En lugar de integrarnos directamente con LinkedIn, podríamos integrarnos con un **ATS** que **ya sea** partner de LinkedIn (Lever, Greenhouse, etc.). LinkedIn fluye los postulados al ATS y nosotros leemos del ATS.
- Añade dependencia de un tercero y asume que el cliente usa ese ATS.

---

## Recomendaciones para el MVP

1. **Implementar ahora:** Login de candidato con **Sign In with LinkedIn (OIDC)** — `openid profile email`. Único camino self-serve y de alto valor. Manejar `email` como opcional.
2. **No depender de** la conexión de Página de empresa ni de la importación de vacantes/postulados de LinkedIn para el MVP. Modelar las **vacantes y postulaciones de forma nativa** en nuestra plataforma.
3. **Empresas:** que **publiquen/gestionen vacantes dentro de nuestra app**. Si quieren difusión en LinkedIn, en el MVP es manual (copiar/pegar el enlace de su propia publicación).
4. **No hacer scraping** de LinkedIn en el producto comercial (riesgo legal/ToS demostrado por hiQ y el cierre de Proxycurl).
5. **Roadmap post-MVP:** iniciar el trámite de **Community Management API** (para Páginas) y evaluar la **aplicación a Talent Solutions Partner** solo cuando tengamos tracción/clientes que justifiquen el requisito de "5 clientes más grandes". Job Posting API está cerrada; la vía realista a futuro es **Apply Connect** o integrarse a través de un **ATS partner**.

---

## Preguntas abiertas

- **Pricing** de las integraciones de partner una vez aprobados (no documentado públicamente).
- **Legalidad del scraping** post-hiQ y existencia de agregadores realmente compliant para no-partners.
- Detalle exacto de **webhooks de eventos de postulación** en Apply Connect / Recruiter System Connect.
- **Tiempos y tasa de aprobación** de la aplicación de partner para un MVP pre-revenue.

---

## Metodología y confianza

- Investigación multi-fuente con verificación adversarial (votación 3-voto por afirmación; se requería 2/3 refutaciones para descartar).
- **22 fuentes** consultadas → 99 afirmaciones extraídas → **25 verificadas** → **24 confirmadas, 1 descartada**.
- Las 5 afirmaciones núcleo del SPIKE 1 y 2 son de **alta confianza** (votos mayoritariamente 3-0) y se apoyan en **documentación oficial primaria** de LinkedIn.
- 1 afirmación descartada (voto 0-3): la lista de "cuatro productos de Talent Solutions para ATS partners" no se sostuvo como estaba formulada.
- **Caveat global:** la documentación de LinkedIn 2026 cambia con frecuencia; reverificar antes de tomar decisiones de arquitectura definitivas. La afirmación sobre `rw_company_admin` (deprecado) es de menor confianza (voto 2-1). El detalle de scraping/costos/agregadores **no** fue verificado adversarialmente.

## Fuentes principales (primarias de LinkedIn)

**Login / OIDC**
- Sign In with LinkedIn v2 (OIDC): https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
- Migration FAQ (deprecación r_liteprofile/r_emailaddress): https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/migration-faq

**Scopes de organización / tiers / revisión**
- Community Management API overview: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview?view=li-lms-2026-04
- Increasing access (Dev vs Standard tier): https://learn.microsoft.com/en-us/linkedin/marketing/increasing-access?view=li-lms-2026-01
- Integration requirements (Community Management): https://learn.microsoft.com/en-us/linkedin/marketing/community-management/integration-requirements-community-management?view=li-lms-2026-04
- Community Management API migration guide: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-api-migration-guide?view=li-lms-2026-02
- Product catalog: https://developer.linkedin.com/product-catalog/marketing/community-management-api

**Talent Solutions (vacantes y postulados)**
- Job Postings API overview: https://learn.microsoft.com/en-us/linkedin/talent/job-postings/api/overview?view=li-lts-2026-03
- Apply Connect: https://learn.microsoft.com/en-us/linkedin/talent/apply-connect?view=li-lts-2026-03
- Apply Connect — receive applications: https://learn.microsoft.com/en-us/linkedin/talent/apply-connect/receive-applications?view=li-lts-2026-03
- Application Sync (middleware): https://learn.microsoft.com/en-us/linkedin/talent/middleware-platform/sync-applications?view=li-lts-2025-10
- Recruiter System Connect: https://learn.microsoft.com/en-us/linkedin/talent/recruiter-system-connect?view=li-lts-2026-03
- ATS Partners: https://business.linkedin.com/talent-solutions/ats-partners
- ATS Partner application: https://business.linkedin.com/talent-solutions/ats-partners/partner-application

**Alternativas / contexto (secundarias — no verificadas adversarialmente)**
- hiQ Labs v. LinkedIn (Wikipedia): https://en.wikipedia.org/wiki/HiQ_Labs_v._LinkedIn
- Análisis legal (Morgan Lewis): https://www.morganlewis.com/blogs/sourcingatmorganlewis/2022/12/linkedin-v-hiq-landmark-data-scraping-suit-provides-guidance-to-data-scrapers-and-web-operators
- Cierre de Proxycurl: https://www.startuphub.ai/ai-news/startup-news/2025/the-1-linkedin-scraping-startup-proxycurl-shuts-down
- Job APIs (Bright Data): https://brightdata.com/blog/web-data/best-job-apis
- Job posting APIs (TheirStack): https://theirstack.com/en/blog/best-job-posting-apis
