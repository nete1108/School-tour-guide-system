// 初始化整个地图
var map = L.map('map', {
    attributionControl: false,
    // maxBounds: L.latLngBounds([112.16175, 112.40661], [29.16175, 199]),
}).setView([47, 47], 10);


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
}
//////////////////////////////////////////////////////////////////////
// var g = new Graph();
// g.addVertex('A')
// g.addVertex('B')
// g.addEdge('A','B',3)
// g.printGraph()

var g = new Graph();

function init_tu_table(graph_name){
    $.ajax({
        url:"http://127.0.0.1:12348/init_tu_table",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name
        }),
        success:function(result){
            console.log(result);
        },
        error:function (error) {
            console.error(error);
          }
    });

}

function init_point_table(graph_name){
    $.ajax({
        url:"http://127.0.0.1:12348/init_point_table",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name
        }),
        success:function(result){
            console.log(result);
        },
        error:function (error) {
            console.error(error);
          }
    });
}


function init_edge_table(graph_name){
    // alert(random_num);
    // 初始化建表(该表是各条边的信息，包括起始点，终点，权值)
    $.ajax({
        url:"http://127.0.0.1:12348/init_edge_table",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name
        }),
        success:function(result){
            console.log(result)
        },
        error:function (error) {
            console.error(error);
          }
    });
}




function init_tu_table_data(graph_name){
    $.ajax({
        url:"http://127.0.0.1:12348/init_tu_table_data",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name
        }),
        success:function(result){
            console.log(result);
        },
        error:function(error){
            console.error(error);
        }
    });
}

// 添加基准点
function add_base_point(graph_name){
// 添加基准点，基准点为学校大门
    marker_base = L.marker([47.0, 47.0], {draggable: false});

    var customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div>学校大门</div>",
    iconSize: [100, 40],  // 调整图标大小
    iconAnchor: [,]  // 调整图标锚点
    });

    var marker_with_text = L.marker([47, 47], {
    icon: customIcon,
    interactive: false  // 防止覆盖默认标记的交互
    }).addTo(map);

    var markerGroup = L.layerGroup([marker_base, marker_with_text]);
    markerGroup.addTo(map);
    // 将基准点加入到数据库中
    $.ajax({
        url:"http://127.0.0.1:12348/add_base_point",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name
        }),
        success:function(result){
            console.log(result);
        },
        error:function(error){
            console.error(error);
        }
    })

    g.addVertex('学校大门');
    g.printGraph();
}

// 初始化地图点击按钮实现
function init(){
    var graph_name = $("#graphname").val();
    graph_name = graph_name.toString();
    $.ajax({
        url:"http://127.0.0.1:12348/save_graph_name",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name
        }),
        success:function(result){
            console.log(result);
        },
        error:function(error){
            console.error(error);
        }
    })
    // 生成一张地图信息表
    init_tu_table(graph_name);
    // 生成一张点集表
    init_point_table(graph_name);
    // 生成一张边集表
    init_edge_table(graph_name);
    // 初始化地图信息表
    init_tu_table_data(graph_name);
    // 添加基准点“大门”
    add_base_point(graph_name);
    alert("初始化地图成功！");
}






// 弹窗操作
let isDragging = false;
    let offsetX, offsetY;

    // 显示弹窗
    function openModal() {
      document.getElementById('myModal').style.display = 'block';
    }

    // 关闭弹窗
    function closeModal() {
      document.getElementById('myModal').style.display = 'none';
    }

    // 处理表单提交
    var new_place;
    document.getElementById('myForm').addEventListener('submit', function(event) {
      event.preventDefault(); // 阻止默认表单提交行为
      // 这里可以添加处理表单数据的逻辑
      new_place = document.getElementById('new_place').value;
      new_place = new_place.toString();
      var graph_name = $("#graphname").val();
      graph_name = graph_name.toString();
      add_new_point(graph_name,new_place);
      closeModal(); // 提交后关闭弹窗
    });


// 添加新的点
function add_new_point(graph_name,new_place){
    var center = [47, 47];
    var offsetRange = 0.3;
    var offsetX = Math.random() * offsetRange * 2 - offsetRange;
    var offsetY = Math.random() * offsetRange * 2 - offsetRange;
    var newPoint = [center[0] + offsetX, center[1] + offsetY];
    var new_marker = L.marker(newPoint, { draggable: true });

    var customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div>"+new_place+"</div>",
        iconSize: [100, 40],
        iconAnchor: [,]
    });

    var marker_with_text = L.marker(newPoint, {
        icon: customIcon,
        interactive: false
    });

    var markerGroup = L.layerGroup([new_marker, marker_with_text]);
    markerGroup.addTo(map);

    // 监听拖动事件
    new_marker.on('move', function (event) {
        var newMarkerLatLng = event.target.getLatLng(); // 获取拖动后的新位置
        marker_with_text.setLatLng(newMarkerLatLng); // 更新文字标记的位置
        $.ajax({
            url:"http://127.0.0.1:12348/change_point_position",
            type:"post",
            contentType:"application/json",
            data:JSON.stringify({
                'graph_name':graph_name,
                'new_place':new_place,
                'x':newMarkerLatLng.lat,
                'y':newMarkerLatLng.lng
            }),
            success:function(result){
                console.log(result);
            }
        })
    });

    $.ajax({
        url:"http://127.0.0.1:12348/add_new_point",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name,
            'new_place':new_place,
            'x':newPoint[0],
            'y':newPoint[1]
        }),
        success:function(result){
            alert(result.message);
            console.log(result);
        },
        error:function(error){
            console.error(error);
        }
    });

    g.addVertex(new_place);
    g.printGraph();
}



// 添加边弹窗操作///////////////////////////////////////////////////////////////////////////////////////////////////
    // 显示弹窗
    function open_edge_Modal() {
        document.getElementById('my_edge_Modal').style.display = 'block';
      }
  
      // 关闭弹窗
      function close_edge_Modal() {
        document.getElementById('my_edge_Modal').style.display = 'none';
      }
  
      // 处理表单提交
      var new_place;
      document.getElementById('my_edge_Form').addEventListener('submit', function(event) {
        event.preventDefault(); // 阻止默认表单提交行为
        // 这里可以添加处理表单数据的逻辑
        var start_point = document.getElementById('start_point').value;
        var end_point = document.getElementById('end_point').value;
        var weight = parseInt(document.getElementById('new_edge').value);
        start_point = start_point.toString();
        end_point = end_point.toString();
        var graph_name = $("#graphname").val();
        graph_name = graph_name.toString();
        add_new_edge(start_point,end_point,weight,graph_name);
        get_point_x_y(start_point,end_point,graph_name,weight)
        close_edge_Modal(); // 提交后关闭弹窗
      });


// 添加边
function add_new_edge(start_point,end_point,weight,graph_name){
    g.addEdge(start_point,end_point,weight);
    g.printGraph();
    $.ajax({
        url:"http://127.0.0.1:12348/add_new_edge",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            "graph_name":graph_name,
            'start_point':start_point,
            'end_point':end_point,
            'weight':weight
        }),
        success:function(result){
            alert(result.message);
            console.log(result);
        },
        error:function(error){
            console.error(error);
        }
    });
}

function get_point_x_y(start_point,end_point,graph_name,weight){
    $.ajax({
        url:"http://127.0.0.1:12348/get_point_x_y",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name,
            'start_point':start_point,
            'end_point':end_point
        }),
        success:function(result){
            var x1 = result[0].x;
            var y1 = result[0].y;
            var x2 = result[1].x;
            var y2 = result[1].y;
            var polyline = L.polyline([[x1,y1], [x2,y2]], { color: 'blue' });

            var midPoint = [(x1 + x2) / 2, (y1 + y2) / 2];
            var customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: "<div style='color: red;'>" + weight + "</div>",
                iconSize: [100, 40],
                iconAnchor: [,]
              });
            var marker_weight = L.marker(midPoint, { icon: customIcon }).addTo(map);
            var Linegroup = L.layerGroup([polyline,marker_weight]).addTo(map);
        },
        error:function(error){
            console.error(error);
        }
    });
}

























