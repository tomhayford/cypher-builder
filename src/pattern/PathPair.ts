import type { CypherCompilable } from "src/types";
import type { CypherEnvironment } from "src/Environment";
import type { PathPattern } from "./PathPattern";

export class PathUnion implements CypherCompilable {
    private paths: PathPattern[];

    constructor(paths: PathPattern[]) {
        this.paths = paths;
        //Check Sequence Validity
        //Check min quantifier validity
    }

    /**
     * @internal
     */
    public getCypher(env: CypherEnvironment): string {
        //check sequence validity, check if min quantifier is met
        const pathCypher = this.paths.map((path) => {
            return path.getCypher(env);
        });

        return pathCypher.join("");
    }
}
