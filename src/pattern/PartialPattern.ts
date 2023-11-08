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

import type { Environment, Variable } from "..";
import type { CypherEnvironment } from "../Environment";
import { LabelExpr } from "../expressions/labels/label-expressions";
import { NodeRef } from "../references/NodeRef";
import type { RelationshipProperties, RelationshipRef } from "../references/RelationshipRef";
import { escapeType } from "../utils/escape";
import { Pattern } from "./Pattern";
import { PatternElement } from "./PatternElement";

type LengthOption =
    | number
    | "*"
    | { min: number; max?: number }
    | { min?: number; max: number }
    | { min: number; max: number };

type QuantifierOption =
    | number
    | "+"
    | "*"
    | { min: number; max: number }
    | { min: number; max?: number }
    | { min?: number; max: number }
    | { min?: number; max?: number };

/** Partial pattern, cannot be used until connected to a node
 * @group Patterns
 */
export class PartialPattern extends PatternElement<RelationshipRef> {
    private length: LengthOption | undefined;
    private quantifier: QuantifierOption | undefined;
    public patternQuantifier: QuantifierOption | undefined;
    private withType = true;
    private withVariable = true;
    private direction: "left" | "right" | "undirected" = "right";
    public previous: Pattern;
    public next: Pattern | undefined;
    private properties: RelationshipProperties | undefined;

    constructor(rel: RelationshipRef, patternQuantifier: QuantifierOption | undefined, previous: Pattern) {
        super(rel);
        this.previous = previous;
        this.patternQuantifier = patternQuantifier;
    }

    public to(node?: NodeRef): Pattern {
        if (!node) node = new NodeRef();
        return new Pattern(node, this.patternQuantifier, this);
    }

    public withoutType(): this {
        this.withType = false;
        return this;
    }

    public withoutVariable(): this {
        this.withVariable = false;
        return this;
    }

    public withDirection(direction: "left" | "right" | "undirected"): this {
        this.direction = direction;
        return this;
    }

    public withProperties(properties: RelationshipProperties): this {
        this.properties = properties;
        return this;
    }

    public withLength(option: LengthOption): this {
        this.length = option;
        return this;
    }

    public withQuantifier(option: QuantifierOption): this {
        this.quantifier = option;
        return this;
    }

    public getVariables(): Variable[] {
        const prevVars = this.previous.getVariables();

        prevVars.push(this.element);
        return prevVars;
    }

    /**
     * @internal
     */
    public getCypher(env: CypherEnvironment): string {
        const prevStr = this.previous.getCypher(env);

        const typeStr = this.withType ? this.getRelationshipTypesString(this.element, env) : "";
        const relStr = this.withVariable ? `${this.element.getCypher(env)}` : "";

        const propertiesStr = this.properties ? this.serializeParameters(this.properties, env) : "";

        const lengthStr = this.generateLengthStr();
        const quantifierStr = this.generateQuantifierStr();

        const leftArrow = this.direction === "left" ? "<-" : "-";
        const rightArrow = this.direction === "right" ? "->" : "-";

        return `${prevStr}${leftArrow}[${relStr}${typeStr}${lengthStr}${propertiesStr}]${rightArrow}${quantifierStr}`;
    }

    private generateLengthStr(): string {
        if (this.length === undefined) return "";
        if (typeof this.length === "number") {
            return `*${this.length}`;
        } else if (this.length === "*") {
            return "*";
        } else {
            return `*${this.length.min ?? ""}..${this.length.max ?? ""}`;
        }
    }

    private generateQuantifierStr(): string {
        if (this.quantifier === undefined) return "";
        if (typeof this.quantifier === "number") {
            return `{${this.quantifier}}`;
        } else if (this.quantifier === "*") {
            return "*";
        } else if (this.quantifier === "+") {
            return "+";
        } else {
            return `{${this.quantifier.min ?? ""},${this.quantifier.max ?? ""}}`;
        }
    }

    private getRelationshipTypesString(relationship: RelationshipRef, env: Environment): string {
        const type = relationship.type ?? "";
        if (type instanceof LabelExpr) {
            return `:${type.getCypher(env)}`;
        } else {
            const escapedType = escapeType(type);
            if (!escapedType) return "";
            return `:${escapedType}`;
        }
    }
}
