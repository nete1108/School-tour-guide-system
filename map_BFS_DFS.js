// 初始化整个地图
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
                var polyline = L.polyline([position_start_point, position_end_point], { color: 'blue' });

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

// 封装栈类
var Stack = function(){
    var items = []

    // 入栈
    this.push = function(element){
        items.push(element)
    }

    // 出栈
    this.pop = function(){
        return items.pop()
    }

    // 检查栈顶
    this.peek = function(){
        return items[items.length-1]
    }

    // 检查栈是否为空
    this.isEmpty = function(){
        return items.length == 0
    }

    // 清除栈
    this.clear = function(){
        items = []
    }

    // 获取栈大小
    this.size = function(){
        return items.length
    }
}

// 封装队列类
var Queue = function(){
    var items = []

    //入队
    this.enqueue = function(element){
        items.push(element)
    }

    // 出队
    this.dequeue = function(){
        return items.shift()
    }

    // 查看队列头
    this.front = function(){
        return items[0]
    }

    // 检查队列是否为空
    this.isEmpty = function(){
        return items.length ===0
    }

    // 队列大小
    this.size = function(){
        return items.length
    }
}

// 封装地图类（邻接表）/////////////////////////////////////////////////
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
    // white 未发现
    // grey 已发现未探索
    // black 已探索

    //
    var initColor = function(){
        var color = {}
        for(var i=0;i<vertices.length;i++){
            color[vertices[i]] = 'white'
        }
        return color;
    }

    

    // 广度优先搜索
    this.bfs = function(v){
        var visit_list = [];
        // 初始化所有点为白色，即未发现
        var color = initColor();
        // 创建一个队列
        var queue = new Queue
        // 将输入的点入队
        queue.enqueue(v);

        // 循环,当队列不为空时
        while(!queue.isEmpty()){
            var now = queue.dequeue()
            var bian = edges[now];
            for(var i=0;i<bian.length;i++){
                var w = bian[i].vertex;           // 改
                if(color[w] === 'white'){
                    color[w] = 'grey'
                    queue.enqueue(w)
                }
            }
            color[now] = 'black'
            visit_list.push(now)

            // 测试用
            // if(callback){
            //     callback(now);
            // }
        }
        return visit_list
    }

    // 深度优先搜索
    var dfsVisit = function(u,color,visit_list){
        color[u] = 'grey'

        // if(callback){
        //     callback(u)
        // }
        visit_list.push(u);

        var n = edges[u]
        for(var i=0;i<n.length;i++){
            var w = n[i].vertex
            if(color[w]=='white'){
                dfsVisit(w,color,visit_list)
            }
        }
        color[u] = 'black'
    }

    this.dfs = function(v){
        var visit_list = [];
        var color = initColor()
        dfsVisit(v,color,visit_list)
        return visit_list;
    }

}
//////////////////////////////////////////////////////////////////////
var g = new Graph



function visit_bfs(){
    var graph_name = $("#graph_name").val();
    var start_point = $("#start_point").val();
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
            var list = g.bfs(start_point)
            alert(list);
        },
        error:function (error) {
            console.error(error);
          }
    });
}


function visit_dfs(){
    var graph_name = $("#graph_name").val();
    var start_point = $("#start_point").val();
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
            var list = g.dfs(start_point)
            alert(list);
        },
        error:function (error) {
            console.error(error);
          }
    });
}


