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

import type { CypherEnvironment } from "../Environment";
import { NodePattern } from "../pattern/NodePattern";
import type { NodeRef } from "../references/NodeRef";
import { compileCypherIfExists } from "../utils/compile-cypher-if-exists";
import { Clause } from "./Clause";
import { WithPathAssign } from "./mixins/WithPathAssign";
import { WithMerge } from "./mixins/clauses/WithMerge";
import { WithReturn } from "./mixins/clauses/WithReturn";
import { WithWith } from "./mixins/clauses/WithWith";
import { WithDelete } from "./mixins/sub-clauses/WithDelete";
import { WithRemove } from "./mixins/sub-clauses/WithRemove";
import { WithSet } from "./mixins/sub-clauses/WithSet";
import { SetClause } from "./sub-clauses/Set";
import { mixin } from "./utils/mixin";

export interface Create extends WithReturn, WithSet, WithPathAssign, WithWith, WithDelete, WithRemove, WithMerge {}

/**
 * @see [Cypher Documentation](https://neo4j.com/docs/cypher-manual/current/clauses/create/)
 * @group Clauses
 */
@mixin(WithReturn, WithSet, WithPathAssign, WithWith, WithDelete, WithRemove, WithMerge)
export class Create extends Clause {
    private pattern: NodePattern;

    constructor(pattern: NodeRef | NodePattern) {
        super();
        if (pattern instanceof NodePattern) {
            this.pattern = pattern;
        } else {
            this.pattern = new NodePattern(pattern);
        }

        this.setSubClause = new SetClause(this);
    }

    /** Add a {@link Create} clause
     * @see [Cypher Documentation](https://neo4j.com/docs/cypher-manual/current/clauses/create/)
     */
    public create(clause: Create): Create;
    public create(pattern: NodeRef | NodePattern): Create;
    public create(clauseOrPattern: Create | NodeRef | NodePattern): Create {
        if (clauseOrPattern instanceof Create) {
            this.addNextClause(clauseOrPattern);
            return clauseOrPattern;
        }

        const matchClause = new Create(clauseOrPattern);
        this.addNextClause(matchClause);

        return matchClause;
    }

    /** @internal */
    public getCypher(env: CypherEnvironment): string {
        const pathCypher = this.compilePath(env);
        const patternCypher = this.pattern.getCypher(env);

        const setCypher = compileCypherIfExists(this.setSubClause, env, { prefix: "\n" });
        const deleteStr = compileCypherIfExists(this.deleteClause, env, { prefix: "\n" });
        const removeCypher = compileCypherIfExists(this.removeClause, env, { prefix: "\n" });

        const nextClause = this.compileNextClause(env);
        return `CREATE ${pathCypher}${patternCypher}${setCypher}${removeCypher}${deleteStr}${nextClause}`;
    }
}
