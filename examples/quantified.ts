
import Cypher from "..";

// MATCH (this1:`Person`)-[this0:ACTED_IN]->(this2:`Movie`)
// WHERE (this1.name = $param0 AND this2.released = $param1)
// RETURN this2.title, this2.released AS year



const movieNode = new Cypher.Node({
    labels: ["Movie"],
});
const personNode = new Cypher.Node({
    labels: ["Person"],
});

const actedInPattern = new Cypher.Pattern(movieNode, "+")
    .related(new Cypher.Relationship({ type: "ACTED_IN" }))
    .to(personNode);


const matchQuery = new Cypher.Match(actedInPattern)
    .where(personNode, { name: new Cypher.Param("Keanu Reeves") })
    .and(movieNode, { released: new Cypher.Param(1999) })
    .return(movieNode.property("title"), [movieNode.property("released"), "year"]);

const { cypher, params } = matchQuery.build();

console.log("Cypher");
console.log(cypher);
console.log("----");
console.log("Params", params);

