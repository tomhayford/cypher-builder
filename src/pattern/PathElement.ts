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

import { CypherEnvironment } from "../Environment";
import type { NodeProperties, NodeRef } from "../references/NodeRef";
import type { PathPattern } from "./PathPattern";
import type { RelationshipProperties, RelationshipRef } from "../references/RelationshipRef";
import type { Variable } from "../references/Variable";
import type { CypherCompilable } from "../types";
import { padBlock } from "../utils/pad-block";
import { padLeft } from "../utils/pad-left";
import { stringifyObject } from "../utils/stringify-object";

const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

export abstract class PathElement<T extends NodeRef | RelationshipRef> implements CypherCompilable {
    public reference: T;
    public path: PathPattern | undefined;

    constructor(reference: T, path?: PathPattern) {
        this.path = path;
        this.reference = reference;
    }

    public abstract getCypher(env: CypherEnvironment): string;

    /**
     * Returns the ordered variables of the Pattern
     * Note that even unnamed variables will be returned
     */
    public abstract getVariables(): Variable[];

    protected serializeParameters(parameters: NodeProperties | RelationshipProperties, env: CypherEnvironment): string {
        if (Object.keys(parameters).length === 0) return "";
        const paramValues = Object.entries(parameters).reduce((acc: Record<string, string>, [key, param]) => {
            acc[key] = param.getCypher(env);
            return acc;
        }, {});

        return padLeft(stringifyObject(paramValues));
    }

    /** Custom string for browsers and templating
     * @hidden
     */
    public toString() {
        const cypher = padBlock(this.getCypher(new CypherEnvironment()));
        return `<${this.constructor.name}> """\n${cypher}\n"""`;
    }

    public getPath() {
        return this.path;
    }

    /** Custom log for console.log in Node
     * @hidden
     */
    [customInspectSymbol](): string {
        return this.toString();
    }
}
