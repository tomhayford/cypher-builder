/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { start } from "repl";
import type { Expr } from "..";
import type { CypherEnvironment } from "../Environment";
import { LabelExpr } from "../expressions/labels/label-expressions";
import type { NodeRef } from "../references/NodeRef";
import { RelationshipRef } from "../references/RelationshipRef";
import type { Variable } from "../references/Variable";
import { escapeLabel } from "../utils/escape";
import { PartialPattern } from "./PartialPattern";
import { PatternElement } from "./PatternElement";

type QuantifierOption =
    | number
    | "+"
    | "*"
    | { min: number; max: number }
    | { min: number; max?: number }
    | { min?: number; max: number }
    | { min?: number; max?: number };


export class Pattern extends PatternElement<NodeRef> {
    private withLabels = true;
    private withVariable = true;
    private previous: PartialPattern | undefined;
    private isFinal = true
    public patternQuantifier: QuantifierOption | undefined;
    private properties: Record<string, Expr> | undefined;

    constructor(node: NodeRef, patternQuantifier?: QuantifierOption, previous?: PartialPattern) {
        super(node);
        this.previous = previous;
        this.patternQuantifier = patternQuantifier;
    }

    public withoutLabels(): this {
        this.withLabels = false;
        return this;
    }

    public withoutVariable(): this {
        this.withVariable = false;
        return this;
    }

    public withProperties(properties: Record<string, Expr>): this {
        this.properties = properties;
        return this;
    }

    public related(rel?: RelationshipRef): PartialPattern {
        if (!rel) rel = new RelationshipRef();
        this.isFinal = false;
        return new PartialPattern(rel, this.patternQuantifier, this);
    }

    public getVariables(): Variable[] {
        const prevVars = this.previous?.getVariables() ?? [];

        prevVars.push(this.element);
        return prevVars;
    }

    /**
     * @internal
     */
    public getCypher(env: CypherEnvironment): string {
        const startParenth = !this.previous ? '(' : "";
        const endParenth = this.isFinal ? ')' : "";
        const prevStr = this.previous?.getCypher(env) ?? "";
        const nodeRefId = this.withVariable ? `${this.element.getCypher(env)}` : "";
        const propertiesStr = this.properties ? this.serializeParameters(this.properties, env) : "";
        const nodeLabelStr = this.withLabels ? this.getNodeLabelsString(this.element, env) : "";
        const quantifierStr = this.isFinal ? this.generateQuantifierStr() : "";

        return `${startParenth}${prevStr}(${nodeRefId}${nodeLabelStr}${propertiesStr})${endParenth}${quantifierStr}`;
    }

    private getNodeLabelsString(node: NodeRef, env: CypherEnvironment): string {
        const labels = node.labels;
        if (labels instanceof LabelExpr) {
            const labelsStr = labels.getCypher(env);
            if (!labelsStr) return "";
            return `:${labels.getCypher(env)}`;
        } else {
            const escapedLabels = labels.map(escapeLabel);
            if (escapedLabels.length === 0) return "";
            return `:${escapedLabels.join(":")}`;
        }
    }
    private generateQuantifierStr(): string {
        if (this.patternQuantifier === undefined) return "";
        if (typeof this.patternQuantifier === "number") {
            return `{${this.patternQuantifier}}`;
        } else if (this.patternQuantifier === "*") {
            return "*";
        } else if (this.patternQuantifier === "+") {
            return "+";
        } else {
            return `{${this.patternQuantifier.min ?? ""},${this.patternQuantifier.max ?? ""}}`;
        }
    }
}
