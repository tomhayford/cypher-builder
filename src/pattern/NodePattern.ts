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

//import { start } from "repl";
import type { Expr } from "..";
import type { CypherEnvironment } from "../Environment";
import { LabelExpr } from "../expressions/labels/label-expressions";
import type { NodeRef } from "../references/NodeRef";
import { RelationshipRef } from "../references/RelationshipRef";
import type { Variable } from "../references/Variable";
import { escapeLabel } from "../utils/escape";
import { RelationshipPattern } from "./RelationshipPattern";
import { PathElement } from "./PathElement";
import type { PathPattern } from "./PathPattern";

export class NodePattern extends PathElement<NodeRef> {
    private withLabels = true;
    private withVariable = true;
    private previous: RelationshipPattern | undefined;
    private properties: Record<string, Expr> | undefined;

    constructor(node: NodeRef, previous?: RelationshipPattern, path?: PathPattern) {
        super(node, path);
        this.previous = previous;
    }

    public rel(rel?: RelationshipRef): RelationshipPattern {
        if (!rel) rel = new RelationshipRef();
        return this.path!.addElement(new RelationshipPattern(rel, this, this.path)) as RelationshipPattern;
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

    public getVariables(): Variable[] {
        const prevVars = this.previous?.getVariables() ?? [];

        prevVars.push(this.reference);
        return prevVars;
    }

    /**
     * @internal
     */
    public getCypher(env: CypherEnvironment): string {
        const nodeRefId = this.withVariable ? `${this.reference.getCypher(env)}` : "";
        const propertiesStr = this.properties ? this.serializeParameters(this.properties, env) : "";
        const nodeLabelStr = this.withLabels ? this.getNodeLabelsString(this.reference, env) : "";

        return `(${nodeRefId}${nodeLabelStr}${propertiesStr})`;
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
}
