import type { QuantifierOption, CanonicalQuantifier } from "../types";

export function generateQuantifierStr(quantifier: QuantifierOption): string {
    if (quantifier === undefined) return "";
    if (typeof quantifier === "number") {
        return `{${quantifier}}`;
    } else if (quantifier === "*") {
        return "*";
    } else if (quantifier === "+") {
        return "+";
    } else {
        return `{${quantifier.min ?? ""},${quantifier.max ?? ""}}`;
    }
}

export function getCanonicalQuantifier(quantifier: QuantifierOption): CanonicalQuantifier {
    let canonicalQuantifier: CanonicalQuantifier;
    if ((quantifier as CanonicalQuantifier).min !== undefined) {
        canonicalQuantifier = quantifier as CanonicalQuantifier;
    } else if (typeof quantifier === "number") {
        canonicalQuantifier = { min: quantifier, max: quantifier } as CanonicalQuantifier;
    } else if (quantifier === "*") {
        canonicalQuantifier = { min: 0 } as CanonicalQuantifier;
    } else if (quantifier === "+") {
        canonicalQuantifier = { min: 1 } as CanonicalQuantifier;
    } else if (quantifier.max !== undefined && quantifier.min === undefined) {
        canonicalQuantifier = { min: 0, max: quantifier.max } as CanonicalQuantifier;
    } else {
        throw new Error(`Invalid quantifier: ${quantifier}`);
    }
    return canonicalQuantifier as CanonicalQuantifier;
}

export function getMinimumQuantifier(quantifier: QuantifierOption): number {
    return getCanonicalQuantifier(quantifier).min;
}
