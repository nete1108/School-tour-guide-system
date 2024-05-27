// 封装地图类（邻接表）/////////////////////////////////////////////////
var Graph = function(){
    // 存储顶点
    var vertices = [];
    
    // 存储边
    var edges = {};
    
    // 添加顶点
    addVertex = function(v){
    vertices.push(v);
    edges[v] = [];
    }
    
    // 添加边
    addEdge = function(start_point,end_point,weight){
    edges[start_point].push({ vertex: end_point, weight: weight });
    edges[end_point].push({ vertex: start_point, weight: weight });
    }
    
    // 输出图的顶点和边(测试用)
    printGraph = function(){
    for(var i=0;i<vertices.length;i++){
    var vertex = vertices[i];
    var edgeString = "";
    for (var j = 0; j < edges[vertex].length; j++) {
    edgeString += edges[vertex][j].vertex + "(" + edges[vertex][j].weight + ") ";
    }
    console.log(vertex + " -> " + edgeString);
    }
    }

    Graph.prototype.isEulerian = function () {
        var oddDegreeCount = 0;
    
        // Check the degree of each vertex
        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            if (edges[vertex].length % 2 !== 0) {
                oddDegreeCount++;
            }
        }
    
        // Determine the type of graph based on the count of vertices with odd degree
        if (oddDegreeCount === 0) {
            console.log("The graph is an Eulerian graph.");
        } else if (oddDegreeCount === 2) {
            console.log("The graph is a semi-Eulerian graph.");
        } else {
            console.log("The graph is neither Eulerian nor semi-Eulerian.");
        }
    };


    Graph.prototype.findShortestEulerianPath = function () {
        // Check if the graph is Eulerian or semi-Eulerian
        var oddDegreeCount = 0;
        var oddDegreeVertices = [];
    
        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            if (edges[vertex].length % 2 !== 0) {
                oddDegreeCount++;
                oddDegreeVertices.push(vertex);
            }
        }
    
        if (oddDegreeCount !== 0 && oddDegreeCount !== 2) {
            console.log("The graph is neither Eulerian nor semi-Eulerian.");
            return;
        }
    
        // Create a copy of the graph to avoid modifying the original graph
        var clonedGraph = new Graph();
        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            clonedGraph.addVertex(vertex);
            for (var j = 0; j < edges[vertex].length; j++) {
                var edge = edges[vertex][j];
                clonedGraph.addEdge(vertex, edge.vertex, edge.weight);
            }
        }
    
        // Initialize variables
        var currentVertex = oddDegreeCount === 2 ? oddDegreeVertices[0] : vertices[0];
        var path = [currentVertex];
        var visitedEdges = {};
    
        // DFS to find the Eulerian path
        function dfs(vertex) {
            for (var i = 0; i < clonedGraph.edges[vertex].length; i++) {
                var edge = clonedGraph.edges[vertex][i];
                var edgeKey = vertex + '-' + edge.vertex + '-' + edge.weight;
    
                if (!visitedEdges[edgeKey]) {
                    visitedEdges[edgeKey] = true;
    
                    path.push(edge.vertex);
                    dfs(edge.vertex);
                }
            }
        }
    
        dfs(currentVertex);
    
        // Output the shortest path
        console.log("Shortest Eulerian Path:", path.join(' -> '));
    };

}



// Example usage
var graph = new Graph();
graph.addVertex(1);
graph.addVertex(2);
graph.addVertex(3);
graph.addEdge(1, 2, 1);
graph.addEdge(2, 3, 1);
graph.addEdge(3, 1, 1);

graph.isEulerian();
graph.findShortestEulerianPath()
