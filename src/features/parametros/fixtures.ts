import type {
  CategoriaInput,
  DireccionInput,
  FinanciadorInput,
  MonedaInput,
  ParametroMensualInput,
  ProyectoInput,
} from "./types"

/**
 * Datos semilla de los catálogos de Parámetros.
 * TODO(api): reemplazar por los datos que devuelva el backend real.
 * Las fechas de auditoría se completan al inicializar el store mock.
 */
export const proyectosSeed: ProyectoInput[] = [
  {
    nombre: "Estructura FH",
    direccionId: "dir-003",
    financiadorId: "fin-001",
    estado: "En ejecución",
    gradoCerteza: "Alta",
    esFicticioEstructura: true,
  },
  {
    nombre: "Prevención y testeo",
    direccionId: "dir-002",
    financiadorId: "fin-003",
    estado: "En ejecución",
    gradoCerteza: "Alta",
    esFicticioEstructura: false,
  },
  {
    nombre: "Educación sexual integral",
    direccionId: "dir-002",
    financiadorId: "fin-002",
    estado: "En ejecución",
    gradoCerteza: "Media",
    esFicticioEstructura: false,
  },
  {
    nombre: "Acompañamiento integral",
    direccionId: "dir-002",
    financiadorId: "fin-004",
    estado: "En ejecución",
    gradoCerteza: "Alta",
    esFicticioEstructura: false,
  },
  {
    nombre: "Comunicación y campañas",
    direccionId: "dir-004",
    financiadorId: "fin-006",
    estado: "En preparación",
    gradoCerteza: "Media",
    esFicticioEstructura: false,
  },
  {
    nombre: "Investigación clínica",
    direccionId: "dir-006",
    financiadorId: "fin-005",
    estado: "En ejecución",
    gradoCerteza: "Alta",
    esFicticioEstructura: false,
  },
  {
    nombre: "Operaciones territoriales",
    direccionId: "dir-002",
    financiadorId: "fin-003",
    estado: "En ejecución",
    gradoCerteza: "Media",
    esFicticioEstructura: false,
  },
  {
    nombre: "Gestión de donantes",
    direccionId: "dir-005",
    financiadorId: "fin-001",
    estado: "En preparación",
    gradoCerteza: "Baja",
    esFicticioEstructura: false,
  },
  {
    nombre: "Salud mental",
    direccionId: "dir-002",
    financiadorId: "fin-004",
    estado: "Aprobado",
    gradoCerteza: "Media",
    esFicticioEstructura: false,
  },
  {
    nombre: "Niñez y adolescencia",
    direccionId: "dir-002",
    financiadorId: "fin-005",
    estado: "En ejecución",
    gradoCerteza: "Media",
    esFicticioEstructura: false,
  },
  {
    nombre: "Abogacía y políticas públicas",
    direccionId: "dir-001",
    financiadorId: null,
    estado: "En preparación",
    gradoCerteza: "Baja",
    esFicticioEstructura: false,
  },
  {
    nombre: "Centro de documentación",
    direccionId: "dir-004",
    financiadorId: null,
    estado: "Finalizado",
    gradoCerteza: null,
    esFicticioEstructura: false,
  },
]

export const direccionesSeed: DireccionInput[] = [
  { nombre: "Dirección Ejecutiva" },
  { nombre: "Dirección de Programas" },
  { nombre: "Dirección de Administración" },
  { nombre: "Dirección de Comunicación" },
  { nombre: "Dirección de Desarrollo" },
  { nombre: "Dirección Médica" },
]

export const financiadoresSeed: FinanciadorInput[] = [
  { nombre: "Fundación Huésped" },
  { nombre: "Universidad Nacional de Lomas de Zamora" },
  { nombre: "Ministerio de Salud de la Nación" },
  { nombre: "ONUSIDA" },
  { nombre: "Fondo Global" },
  { nombre: "Cooperación Internacional" },
]

export const categoriasSeed: CategoriaInput[] = [
  { nombre: "Sueldos y cargas sociales", tipo: "estructura_fija" },
  { nombre: "Alquileres", tipo: "estructura_fija" },
  { nombre: "Servicios", tipo: "estructura_fija" },
  { nombre: "Seguros", tipo: "estructura_fija" },
  { nombre: "Honorarios", tipo: "estructura_fija" },
  { nombre: "Mantenimiento", tipo: "estructura_fija" },
  { nombre: "Insumos de testeo", tipo: "proyecto" },
  { nombre: "Material de difusión", tipo: "proyecto" },
  { nombre: "Viáticos y movilidad", tipo: "proyecto" },
  { nombre: "Capacitaciones", tipo: "proyecto" },
  { nombre: "Equipamiento", tipo: "proyecto" },
  { nombre: "Consultoría", tipo: "proyecto" },
]

export const monedasSeed: MonedaInput[] = [
  { codigo: "ARS", descripcion: "Peso argentino" },
  { codigo: "USD", descripcion: "Dólar estadounidense" },
]

export const parametrosMensualesSeed: ParametroMensualInput[] = [
  { mes: "2026-01-01", tipoCambioCcl: 1210.5, tipoCambioNacion: 1045, inflacionMensual: 0.025 },
  { mes: "2026-02-01", tipoCambioCcl: 1235.8, tipoCambioNacion: 1068.5, inflacionMensual: 0.028 },
  { mes: "2026-03-01", tipoCambioCcl: 1268.4, tipoCambioNacion: 1092.3, inflacionMensual: 0.031 },
  { mes: "2026-04-01", tipoCambioCcl: 1305.2, tipoCambioNacion: 1120.1, inflacionMensual: 0.029 },
  { mes: "2026-05-01", tipoCambioCcl: 1340, tipoCambioNacion: 1148.6, inflacionMensual: 0.027 },
  { mes: "2026-06-01", tipoCambioCcl: 1378.9, tipoCambioNacion: 1175.4, inflacionMensual: 0.026 },
  { mes: "2026-07-01", tipoCambioCcl: 1415.3, tipoCambioNacion: 1202.8, inflacionMensual: 0.025 },
  { mes: "2026-08-01", tipoCambioCcl: 1452.7, tipoCambioNacion: 1230.5, inflacionMensual: 0.024 },
  { mes: "2026-09-01", tipoCambioCcl: 1490.1, tipoCambioNacion: 1258.9, inflacionMensual: 0.023 },
  { mes: "2026-10-01", tipoCambioCcl: 1528.6, tipoCambioNacion: 1287.2, inflacionMensual: 0.022 },
  { mes: "2026-11-01", tipoCambioCcl: 1568.4, tipoCambioNacion: 1316, inflacionMensual: 0.021 },
  { mes: "2026-12-01", tipoCambioCcl: 1609.1, tipoCambioNacion: 1345.3, inflacionMensual: 0.02 },
]
