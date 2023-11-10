// //Lets get something working again, ignore the ideal hierarhcy for now. At least its better that the current one.
import { Cypher } from "./src/";
const parentNode = new Cypher.Node({ labels: ["Part"] });
const path = new Cypher.Path().union([
    new Cypher.Node(),
    new Cypher.Path().node().rel().node().withQuantifier("+"),
    new Cypher.Path().node().rel().node().withQuantifier({0,5}),
    new Cypher.Node().rel().node(),
    new Cypher.Node().rel().node(),
);
    .node()
    .rel()
    .node({ labels: ["Component"] })
    .rel()
    .node({ labels: ["Part"] })
    .withQuantifier("+");
const child = new Cypher.Node();

const fullPath = new Cypher.Path.union([parentNode, path, child]);

const path = new Cypher.Path(new Cypher.Node().rel().node().withQuantifier("+"))
    .path(new Cypher.Node().rel().node().withQuantifier("+"))
    .path(new Cypher.Node())
    .withVariable("p");

// const [node,nodeRef] = Cypher.Node()

// const combinedpath = Cypher.Path(pathRef).union([
//     new Cypher.Node(node),
//     new Cypher.Node().rel().node().withQuantifier("+"),
//     new Cypher.Node(),
// ]);

// const path = new Cypher.Path();

// const simplePath = new Cypher.Node().rel().node();
// const pathPatternn = new Cypher.Path(new Cypher.Node().rel().node()).withQuantifier("+");

// //Start Simple
// //Start Quantifier
// // start with variable, start anonymous
// const pathRef = new Cypher.PathRef();
// const simplePath = new Cypher.Node().rel().node()
//     new Cypher.Node().rel().node()
//     ).withQuantifier("+").withPathVariable(pathRef);
// const quantPath = new Cypher.Path(pathRef).node().rel().node().withQuantifier("+");

// // Simple Path
// new Path().rel().node()
// // Simple Path with path Variable
// new Node().rel().node().withPathVariable(pathRef)
// // Simple Path with quantified realtionship
// new Node().rel().withQuantifier("+").node()

// const parentNode = new Node({labels:});

// const path1 = new Path(p).node().rel().node().withQuantifier("+");
// const path2 = new Path(p).union([
//     new Node(),
//     new Node().rel().node().withQuantifier("+"),
//     new Node().rel().node().withQuantifier("+"),
// ]
// )
