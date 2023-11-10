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
//import type { Expr } from "..";
import type { CypherEnvironment } from "../Environment";
//import { LabelExpr } from "../expressions/labels/label-expressions";
import type { CypherCompilable } from "../types";
import { NodeRef } from "../references/NodeRef";
import type { PathRef } from "../references/PathRef";
//import type { Variable } from "../references/Variable";
import { NodePattern } from "./NodePattern";
import type { RelationshipPattern } from "./RelationshipPattern";
import type { QuantifierOption } from "../types";
import { generateQuantifierStr } from "../utils/quantifier";

export class PathPattern implements CypherCompilable {
    private pathRef: PathRef | undefined;
    public elements: (NodePattern | RelationshipPattern | PathPattern)[] = [];
    private pathQuantifier: QuantifierOption | undefined;

    constructor(pathQuantifier?: QuantifierOption) {
        this.pathQuantifier = pathQuantifier;
    }

    withPathVariable(pathRef: PathRef): this {
        this.pathRef = pathRef;
        return this;
    }

    public node(node?: NodeRef): NodePattern {
        if (this.currentElement() instanceof NodePattern) {
            throw new Error("Cannot add node after a node");
        }
        if (!node) node = new NodeRef();
        return this.addElement(new NodePattern(node, undefined, this)) as NodePattern;
    }

    private currentElement(): NodePattern | RelationshipPattern | PathPattern | undefined {
        return this.elements[this.elements.length - 1];
    }

    public addElement(
        element: PathPattern | NodePattern | RelationshipPattern
    ): PathPattern | NodePattern | RelationshipPattern {
        this.elements.push(element);
        return element;
    }

    public union(patterns: (PathPattern | NodePattern)[]): PathPattern {
        let newElement: PathPattern;
        patterns.forEach((pattern, i) => {
            //
            if (pattern instanceof NodePattern) {
                if (pattern.path) {
                    newElement = pattern.path;
                } else {
                    newElement = new PathPattern();
                    newElement.node(pattern.reference);
                }
                pattern = new PathPattern().node(pattern.reference);
            } else {
                newElement = pattern;
            }

            if (i > 0) {
                this.validatePatternUnion(newElement, this.currentElement() as PathPattern);
            }
            this.addElement(newElement);
            return this;
        });

        return this;
    }

    private validatePatternUnion(pattern1: PathPattern, pattern2: PathPattern): void {
        if (!pattern1.isQuantified() && !pattern2.isQuantified()) {
            throw new Error("Cannot union two simple patterns");
        }
    }
    // Valide Pattern Union?
    //

    // Union to other paths
    /**
     * @internal
     */
    public isQuantified(): boolean {
        return !!this.pathQuantifier;
    }

    public getCypher(env: CypherEnvironment): string {
        const pathStr = this.elements.reduce((acc, element) => {
            return acc + element.getCypher(env);
        }, "");

        const startParenth = this.pathQuantifier ? "(" : "";
        const endParenth = this.pathQuantifier ? ")" : "";
        const quantifierStr = this.pathQuantifier ? generateQuantifierStr(this.pathQuantifier) : "";
        return `${startParenth}${pathStr}${endParenth}${quantifierStr}`;
    }
}
