/**
 * Qué se sabe de si el MCP anda con el aula de una regional:
 * - `verified`: alguien ya entró y usó las tools.
 * - `candidate`: tiene habilitado el servicio `moodle_mobile_app` (y se sabe cómo entra), así que
 *   casi seguro anda; se verifica con el primer login que funcione.
 * - `unsupported`: no tiene el servicio habilitado, o entra por un login que todavía no sabemos usar;
 *   se puede elegir, pero todavía no se puede usar.
 */
export type RegionalSupport = "verified" | "candidate" | "unsupported";

/** Los SSO que sabemos usar: Keycloak propio de la regional u Office 365 (Microsoft Entra ID). */
export type SsoProviderId = "keycloak" | "microsoft";

/** El SSO por el que entra el aula: quién valida usuario y contraseña, y en qué host. */
export interface Sso {
    provider: SsoProviderId;
    host: string;
}

/** El aula virtual de un campus de la UNAHUR. Sin `sso`, entra con el login directo de Moodle. */
export interface Regional {
    id: string;
    name: string;
    baseUrl: string;
    sso?: Sso;
    support: RegionalSupport;
}

/** Office 365: cada regional tiene su tenant, pero el login es siempre en este host. */
const MICROSOFT_SSO: Sso = { provider: "microsoft", host: "login.microsoftonline.com" };

/** El primer campus en Moodle: antes de `campus2023.unahur.edu.ar` no hay ninguno. */
const FIRST_YEAR = 2023;

/**
 * Los años con login probado. El resto tiene el servicio habilitado según `tool_mobile_get_public_config`,
 * que Moodle contesta sin login (octubre de 2026).
 */
const VERIFIED_YEARS = new Set([2026]);

const currentYear = () => new Date().getFullYear();

/**
 * La UNAHUR tiene un Moodle por año lectivo, `campusAAAA.unahur.edu.ar`: del año actual para atrás.
 * Se arma en cada llamada para que un servidor que sigue andando en año nuevo sume el campus nuevo.
 */
// ponytail: asume que el campus del año existe desde el 1 de enero; si la UNAHUR lo crea más tarde, hasta
// entonces el que viene marcado falla y hay que elegir el anterior. Si molesta, probar el host antes de elegirlo.
function yearlyCampuses(): Regional[] {
    const campuses: Regional[] = [];
    for (let year = currentYear(); year >= FIRST_YEAR; year--) {
        campuses.push({
            id: String(year),
            name: `Campus ${year}`,
            baseUrl: `https://campus${year}.unahur.edu.ar`,
            support: VERIFIED_YEARS.has(year) ? "verified" : "candidate",
        });
    }
    return campuses;
}

/** `UTN_REGIONAL` no está en el registro: sin cortar acá, las credenciales irían a otro campus. */
export class UnknownRegionalError extends Error {
    name = "UnknownRegionalError";
    constructor(regional: string) {
        super(
            `"${regional}" no es un campus conocido. Los válidos son: ${availableRegionals().map((r) => r.id).join(", ")}. ` +
                "Si tu campus no está en la lista, borrá UTN_REGIONAL y definí UTN_AULA_BASE_URL con la URL del aula " +
                "(y UTN_SSO_HOST si entra por SSO: el host del Keycloak, o login.microsoftonline.com si es Office 365).",
        );
    }
}

/** Su aula no tiene el servicio habilitado o entra por un SSO que no sabemos usar: ni se intenta entrar. */
export class UnsupportedRegionalError extends Error {
    name = "UnsupportedRegionalError";
    constructor(readonly regional: Regional) {
        super(
            `Todavía no hay soporte para ${regional.name}: su aula no tiene habilitado el servicio que usa ` +
                "UNAHUR-MCP o entra por un login que todavía no sabemos usar.",
        );
    }
}

/** El aula de UTN_AULA_BASE_URL, para un campus que no está en el registro. */
function customRegional(): Regional | undefined {
    const raw = process.env.UTN_AULA_BASE_URL?.trim();
    if (!raw) return undefined;
    const baseUrl = raw.replace(/\/+$/, "");
    const host = new URL(baseUrl).host;
    const ssoHost = process.env.UTN_SSO_HOST?.trim();
    const sso: Sso | undefined = !ssoHost
        ? undefined
        : ssoHost === MICROSOFT_SSO.host
          ? MICROSOFT_SSO
          : { provider: "keycloak", host: ssoHost };
    return { id: host, name: host, baseUrl, sso, support: "verified" };
}

/**
 * Las que se pueden elegir al iniciar sesión: el catálogo y, si está definida, la de UTN_AULA_BASE_URL.
 * `verifiedIds` son las `candidate` que ya se verificaron en el servidor (las guarda el store).
 */
export function availableRegionals(verifiedIds: Iterable<string> = []): Regional[] {
    const verified = new Set(verifiedIds);
    const custom = customRegional();
    return [...yearlyCampuses(), ...(custom ? [custom] : [])].map((r) =>
        r.support === "candidate" && verified.has(r.id) ? { ...r, support: "verified" } : r,
    );
}

/** La regional con ese id; si no está entre las disponibles, `UnknownRegionalError`. */
export function findRegional(id: string): Regional {
    const wanted = id.trim().toLowerCase();
    const found = availableRegionals().find((r) => r.id === wanted);
    if (!found) throw new UnknownRegionalError(id);
    return found;
}

/**
 * La que viene elegida si nadie dice otra: la de UTN_REGIONAL; si no, la de UTN_AULA_BASE_URL; si no,
 * el campus del año. Es la de quien usa UTN_USER/UTN_PASS sin `unahur-mcp login`, y la opción por defecto al elegir.
 */
export function defaultRegional(): Regional {
    const fromEnv = process.env.UTN_REGIONAL?.trim();
    if (fromEnv) return findRegional(fromEnv);
    return customRegional() ?? findRegional(String(currentYear()));
}
