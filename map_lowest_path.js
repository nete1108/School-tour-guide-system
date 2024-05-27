// 初始化整个地图////////////////////////////////////////////////////////////////
var map = L.map('map', {
    attributionControl: false,
    // maxBounds: L.latLngBounds([112.16175, 112.40661], [29.16175, 199]),
}).setView([47, 47], 10);


window.onload = function(){
    $.ajax({
        url:"http://127.0.0.1:12348/get_all_graphs",
        type:"get",
        contentType:"application/json",
        success:function(result){
            var selectElement = document.getElementById("graph_name");
            selectElement.innerHTML = "";
            for (var i = 0; i < result.length; i++) {
                var optionElement = document.createElement("option");
                optionElement.value = result[i].graph_name;  // 假设数据是字符串类型，直接作为值
                optionElement.text = result[i].graph_name;   // 设置显示文本
                selectElement.appendChild(optionElement);  // 添加到下拉框
              }
        },
        error:function (error) {
            console.error(error);
        }
    });
}

function show_map(){
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });
    var graph_name = $("#graph_name").val();
    graph_name = graph_name.toString();
    $.ajax({
        url:"http://127.0.0.1:12348/get_all_map",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name
        }),
        success:function(result){
            // 添加点
            for(var i=0;i<result.point.length;i++){
                var position = [result.point[i].x, result.point[i].y];
                var marker = L.marker(position, { draggable: true });
                var customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: "<div>"+result.point[i].point+"</div>",
                    iconSize: [100, 40],
                    iconAnchor: [,]
                });
                var marker_with_text = L.marker(position, {
                    icon: customIcon,
                    interactive: false
                });
                var markerGroup = L.layerGroup([marker, marker_with_text]);
                markerGroup.addTo(map);
            }
            //添加边
            for(var j=0;j<result.edge.length;j++){
                var position_start_point = [];
                var position_end_point = [];
                for(var k=0;k<result.point.length;k++){
                    if(result.edge[j].start_point==result.point[k].point){
                        position_start_point = [result.point[k].x,result.point[k].y];
                    }
                    if(result.edge[j].end_point==result.point[k].point){
                        position_end_point = [result.point[k].x,result.point[k].y];
                    }
                }
                var polyline = L.polyline([position_start_point, position_end_point], { color: 'grey' });

                var midPoint = [(position_start_point[0] + position_end_point[0]) / 2, (position_start_point[1] + position_end_point[1]) / 2];
                var customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: "<div style='color: red;'>" + result.edge[j].weight + "</div>",
                    iconSize: [100, 40],
                    iconAnchor: [,]
                });
                var marker_weight = L.marker(midPoint, { icon: customIcon }).addTo(map);
                var Linegroup = L.layerGroup([polyline,marker_weight]).addTo(map);
            }
        },
        error:function (error) {
            console.error(error);
          }
    });
}

// 封装地图类（邻接表）////////////////////////////////////////////////////////////////////
var Graph = function(){
    // 存储顶点
    var vertices = [];


    // 存储边
    var edges = {};

    // 添加顶点
    this.addVertex = function(v){
        vertices.push(v);
        edges[v] = [];
    }

    // 添加边
    this.addEdge = function(start_point,end_point,weight){
        edges[start_point].push({ vertex: end_point, weight: weight });
        edges[end_point].push({ vertex: start_point, weight: weight });
    }


    // 输出图的顶点和边(测试用)
    this.printGraph = function(){
        for(var i=0;i<vertices.length;i++){
            var vertex = vertices[i];
            var edgeString = "";
            for (var j = 0; j < edges[vertex].length; j++) {
                edgeString += edges[vertex][j].vertex + "(" + edges[vertex][j].weight + ") ";
            }
            console.log(vertex + " -> " + edgeString);
        }
    }

    // 迪杰斯特拉算法
    this.dijkstra = function(start_point) {
        // 初始化距离表，用于存储从起点到各顶点的最短路径
        var dist = {};
        // 初始化前驱点表，用于存储当前点最短路径的前驱点
        var path = {};
        // 用于存储待访问的顶点
        var S = [];

        // 初始化dist数组和path数组
        for (var i = 0; i < vertices.length; i++) {
            //  遍历图中每一个点
            var vertex = vertices[i];
            // dist数组初始都设为无穷大
            dist[vertex] = Infinity;
            // path数组初始都设为null
            path[vertex] = null;
            // 初始将点加入待处理队伍
            S.push(vertex);
        }

        // 初始点到初始点距离为0
        dist[start_point] = 0;

        // 当S中还有待处理的点时循环
        while (S.length > 0) {

            // 找到距离起点最短的顶点
            var currentVertex = S.reduce(function(minVertex, vertex) {
                return dist[vertex] < dist[minVertex] ? vertex : minVertex;
            }, S[0]);


            // 移除该点
            S = S.filter(function(vertex) {
                return vertex !== currentVertex;
            });

            for (var j = 0; j < edges[currentVertex].length; j++) {
                // 获取当前相邻点和边的权重信息
                var neighbor = edges[currentVertex][j].vertex;
                var edgeWeight = edges[currentVertex][j].weight;
                // // 计算经过当前顶点到相邻顶点的总权重
                var totalWeight = dist[currentVertex] + edgeWeight;

                // 更新dist数组和path数组
                if (totalWeight < dist[neighbor]) {
                    dist[neighbor] = totalWeight;
                    path[neighbor] = currentVertex;
                }
            }
        }

        return { dist: dist, path: path };
    };


}
//////////////////////////////////////////////////////////////////////
var g = new Graph

function show_lowest_path(){
    var graph_name = $("#graph_name").val();
    $.ajax({
        url:"http://127.0.0.1:12348/get_all_map",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name
        }),
        success:function(result){
            // 将数据导入到邻接表中
            for(var i=0;i<result.point.length;i++){
                g.addVertex(result.point[i].point);
            }
            // 将数据导入到邻接表中
            for(var j=0;j<result.edge.length;j++){
                g.addEdge(result.edge[j].start_point,result.edge[j].end_point,result.edge[j].weight);
            }
            g.printGraph()
            console.log("\n")
            console.log("\n")

            var start_point = $("#start_point").val();
            var end_point = $("#end_point").val();
            var all_datas = g.dijkstra(start_point);

            console.log(all_datas.dist)

            console.log(all_datas.path)

            
            // 测试输出
            for (var vertex in all_datas.dist) {
                if (all_datas.dist[vertex] !== Infinity) {
                    var path = [];
                    var currentVertex = vertex;
                    while (currentVertex !== null) {
                        path.unshift(currentVertex);
                        currentVertex = all_datas.path[currentVertex];
                    }
                    console.log("从 " + start_point + " 到 " + vertex + " 的最短路径:\n " + path.join(" -> ") + ", 长度: " + all_datas.dist[vertex]);
                } 
                else {
                    console.log("从 " + start_point + " 到 " + vertex + " 无法到达");
                }
            }

            console.log("\n")
            console.log("\n")
            console.log("\n")

            
            
            var lujing = []
            for (var vertex in all_datas.dist) {
                if (vertex === end_point) {
                    if (all_datas.dist[vertex] !== Infinity) {
                        var path = [];
                        var currentVertex = vertex;
            
                        while (currentVertex !== null) {
                            path.unshift(currentVertex);
                            currentVertex = all_datas.path[currentVertex];
                        }
                        lujing.push(path)
                        shortestPath = path.join(" -> ");
                        var shortestPathLength = all_datas.dist[vertex];
            
                        console.log("从 " + start_point + " 到 " + vertex + " 的最短路径:\n " + shortestPath + ", 长度: " + shortestPathLength);
                    } else {
                        console.log("从 " + start_point + " 到 " + vertex + " 无法到达");
                    }
                    break;
                }
            }


            // 根据当前最小路径将边绘制成红色
            for(var k=0;k<(lujing[0].length-1);k++){
                $.ajax({
                    url:"http://127.0.0.1:12348/get_point_x_y",
                    type:"post",
                    contentType:"application/json",
                    data:JSON.stringify({
                        'graph_name':graph_name,
                        'start_point':lujing[0][k],
                        'end_point':lujing[0][k+1]
                    }),
                    success:function(result){
                        var position_start_point = [result[0].x,result[0].y]
                        var position_end_point = [result[1].x,result[1].y]
                        var polyline = L.polyline([position_start_point, position_end_point], { color: 'red' }).addTo(map);
                    }
                })
                
            }
          
        },
        error:function (error) {
            console.error(error);
          }
    });
}