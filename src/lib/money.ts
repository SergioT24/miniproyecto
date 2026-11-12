import Decimal from "decimal.js"

/** Redondea un importe a dos decimales sin acumular errores de punto flotante. */
export function roundMoney(value: Decimal.Value): number {
  return new Decimal(value).toDecimalPlaces(2).toNumber()
}

/** Suma importes con precisión decimal y redondea el resultado a dos decimales. */
export function sumMoney(values: number[]): number {
  return values
    .reduce((total, value) => total.plus(value), new Decimal(0))
    .toDecimalPlaces(2)
    .toNumber()
}
