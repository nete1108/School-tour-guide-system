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




// 新增点弹窗
let isDragging = false;
    let offsetX, offsetY;

    // 显示弹窗
    function open_add_Modal() {
      document.getElementById('my_add_Modal').style.display = 'block';
    }

    // 关闭弹窗
    function close_add_Modal() {
      document.getElementById('my_add_Modal').style.display = 'none';
    }

    // 处理表单提交
    var new_place;
    document.getElementById('my_add_Form').addEventListener('submit', function(event) {
      event.preventDefault(); // 阻止默认表单提交行为
      // 这里可以添加处理表单数据的逻辑
      new_place = document.getElementById('add_point').value;
      new_place = new_place.toString();
      var graph_name = $("#graph_name").val();
      graph_name = graph_name.toString();
      add_new_point(graph_name,new_place);
      close_add_Modal(); // 提交后关闭弹窗
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
}




// 添加边弹窗
    // 显示弹窗
    function open_add_edge_Modal() {
        document.getElementById('my_add_edge_Modal').style.display = 'block';
      }
  
      // 关闭弹窗
      function close_add_edge_Modal() {
        document.getElementById('my_add_edge_Modal').style.display = 'none';
      }
  
      // 处理表单提交
      var new_place;
      document.getElementById('my_add_edge_Form').addEventListener('submit', function(event) {
        event.preventDefault(); // 阻止默认表单提交行为
        // 这里可以添加处理表单数据的逻辑
        var start_point = document.getElementById('add_start_point').value;
        var end_point = document.getElementById('add_end_point').value;
        var weight = parseInt(document.getElementById('add_weight').value);
        start_point = start_point.toString();
        end_point = end_point.toString();
        var graph_name = $("#graph_name").val();
        graph_name = graph_name.toString();
        add_new_edge(start_point,end_point,weight,graph_name);
        get_point_x_y(start_point,end_point,graph_name,weight)
        close_add_edge_Modal(); // 提交后关闭弹窗
      });


// 添加边
function add_new_edge(start_point,end_point,weight,graph_name){
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


// 删除点弹窗
    isDragging = false;

    // 显示弹窗
    function open_delete_Modal() {
      document.getElementById('my_delete_Modal').style.display = 'block';
    }

    // 关闭弹窗
    function close_delete_Modal() {
      document.getElementById('my_delete_Modal').style.display = 'none';
    }

    // 处理表单提交
    var new_place;
    document.getElementById('my_delete_Form').addEventListener('submit', function(event) {
      event.preventDefault(); // 阻止默认表单提交行为
      // 这里可以添加处理表单数据的逻辑
      new_place = document.getElementById('delete_point').value;
      new_place = new_place.toString();
      var graph_name = $("#graph_name").val();
      graph_name = graph_name.toString();
      delete_point(graph_name,new_place);
      delete_edge_by_one_point(new_place,graph_name);
      close_delete_Modal(); // 提交后关闭弹窗
    });


// 删除点
function delete_point(graph_name,new_place){
    $.ajax({
        url:"http://127.0.0.1:12348/get_point_x_y",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name,
            'start_point':new_place,
            'end_point':new_place
        }),
        success:function(result){
            var point = result[0].point;
            var x = result[0].x;
            var y = result[0].y;
            $.ajax({
                url:"http://127.0.0.1:12348/delete_point",
                type:"post",
                contentType:"application/json",
                data:JSON.stringify({
                    'graph_name':graph_name,
                    'new_place':point,
                }),
                success:function(result){
                    alert(result.message);
                    console.log(result);
                },
                error:function(error){
                    console.error(error);
                }
            });
        },
        error:function(error){
            console.error(error);
        }
    });
}

// 删除点对应的边
function delete_edge_by_one_point(new_place,graph_name){
    $.ajax({
        url:"http://127.0.0.1:12348/delete_edge_by_one_point",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name,
            'new_place':new_place,
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



// 删除边弹窗
    // 显示弹窗
    function open_delete_edge_Modal() {
        document.getElementById('my_delete_edge_Modal').style.display = 'block';
      }
  
      // 关闭弹窗
      function close_delete_edge_Modal() {
        document.getElementById('my_delete_edge_Modal').style.display = 'none';
      }
  
      // 处理表单提交
      var new_place;
      document.getElementById('my_delete_edge_Form').addEventListener('submit', function(event) {
        event.preventDefault(); // 阻止默认表单提交行为
        // 这里可以添加处理表单数据的逻辑
        var start_point = document.getElementById('delete_start_point').value;
        var end_point = document.getElementById('delete_end_point').value;
        start_point = start_point.toString();
        end_point = end_point.toString();
        var graph_name = $("#graph_name").val();
        graph_name = graph_name.toString();
        delete_edge(graph_name,start_point,end_point);
        close_delete_edge_Modal(); // 提交后关闭弹窗
      });

function delete_edge(graph_name,start_point,end_point){
    $.ajax({
        url:"http://127.0.0.1:12348/delete_edge",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name,
            'start_point':start_point,
            'end_point':end_point
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


// 修改点弹窗
isDragging = false;

// 显示弹窗
function open_edit_Modal() {
  document.getElementById('my_edit_Modal').style.display = 'block';
}

// 关闭弹窗
function close_edit_Modal() {
  document.getElementById('my_edit_Modal').style.display = 'none';
}

// 处理表单提交
var new_place;
document.getElementById('my_edit_Form').addEventListener('submit', function(event) {
  event.preventDefault(); // 阻止默认表单提交行为
  // 这里可以添加处理表单数据的逻辑
  new_place = document.getElementById('edit_point').value;
  new_place = new_place.toString();
  var edit_finished_point = document.getElementById('edit_finished_point').value;
  var graph_name = $("#graph_name").val();
  graph_name = graph_name.toString();
  edit_point(graph_name,new_place,edit_finished_point);
  edit_edge_by_one_point(new_place,edit_finished_point,graph_name)
  close_edit_Modal(); // 提交后关闭弹窗
});


// 修改点
function edit_point(graph_name,new_place,edit_finished_point){
    $.ajax({
        url:"http://127.0.0.1:12348/edit_point",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name,
            'new_place':new_place,
            'finished':edit_finished_point
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

// 修改点对应的边
function edit_edge_by_one_point(new_place,edit_finished_point,graph_name){
    $.ajax({
        url:"http://127.0.0.1:12348/edit_edge_by_one_point",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name,
            'new_place':new_place,
            'finished':edit_finished_point
        }),
        success:function(result){
            console.log(result);
        },
        error:function(error){
            console.error(error);
        }
    });
}



// 删除边弹窗
    // 显示弹窗
    function open_edit_edge_Modal() {
        document.getElementById('my_edit_edge_Modal').style.display = 'block';
      }
  
      // 关闭弹窗
      function close_edit_edge_Modal() {
        document.getElementById('my_edit_edge_Modal').style.display = 'none';
      }
  
      // 处理表单提交
      var new_place;
      document.getElementById('my_edit_edge_Form').addEventListener('submit', function(event) {
        event.preventDefault(); // 阻止默认表单提交行为
        // 这里可以添加处理表单数据的逻辑
        var start_point = document.getElementById('edit_start_point').value;
        var end_point = document.getElementById('edit_end_point').value;
        start_point = start_point.toString();
        end_point = end_point.toString();
        var graph_name = $("#graph_name").val();
        graph_name = graph_name.toString();
        var weight = parseInt(document.getElementById('edit_weight').value);
        edit_edge(graph_name,start_point,end_point,weight);
        close_edit_edge_Modal(); // 提交后关闭弹窗
      });

function edit_edge(graph_name,start_point,end_point,weight){
    $.ajax({
        url:"http://127.0.0.1:12348/edit_edge",
        type:"post",
        contentType:"application/json",
        data:JSON.stringify({
            'graph_name':graph_name,
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