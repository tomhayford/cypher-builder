import type { CypherCompilable } from "src/types";
import type { CypherEnvironment } from "src/Environment";
import type { PathPattern } from "./PathPattern";

export class GraphPattern implements CypherCompilable {
    private paths: PathPattern[];
    constructor(paths: PathPattern[]) {
        this.paths = paths;
    }

    /**
     * @internal
     */
    public getCypher(env: CypherEnvironment): string {
        const pathCypher = this.paths.map((path) => {
            return path.getCypher(env);
        });

        return pathCypher.join(", ");
    }
}
