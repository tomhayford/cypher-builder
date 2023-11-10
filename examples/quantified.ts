import Cypher from "..";

const parent = new Cypher.Node({ labels: ["Part"] });
const child = new Cypher.Node();

const tree = new Cypher.Path("+").node().rel().node().rel().node();
const path = new Cypher.Path().union([new Cypher.NodePattern(parent), new Cypher.NodePattern(child)]);
console.log(path);
const matchQuery = new Cypher.Match(path);
const { cypher } = matchQuery.build();
console.log(cypher);
