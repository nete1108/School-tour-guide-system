from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Union
import psycopg2


nete = FastAPI()

nete.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  
  allow_credentials=True,
  allow_methods=["*"],  
  allow_headers=["*"],  
)


class map(BaseModel):
    graph_name: Union[str,None] = None
    new_place: Union[str,None] = None
    x: Union[float,None] = None
    y: Union[float,None] = None
    start_point: Union[str,None] = None
    end_point: Union[str,None] = None
    weight: Union[int,None] = None
    finished: Union[str,None] = None



@nete.get('/')
async def welcome():
    return {'message':"学校参观系统"}


# 保存地图的名称
@nete.post('/save_graph_name')
async def save_graph_name(sgn:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"insert into all_graphs(graph_name) values('{sgn.graph_name}')")
        conn.commit()
        return {'message':'保存成功！'}
    except Exception as e:
        print(e)
        return {'message':"保存失败！"}
    finally:
        cur.close()
        conn.close()


# 初始化地图信息表
@nete.post('/init_tu_table')
async def init_tu_table(itt:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        # print(irnve.random_num)
        cur.execute(f"create table if not exists map_tu_{itt.graph_name}(vertex_num int, edge_num int)")
        conn.commit()
        return {'message':'建立地图信息表成功！'}
    except Exception as e:
        print(e)
        return {'message':"建立地图信息表失败！"}
    finally:
        cur.close()
        conn.close()



# 初始化点表
@nete.post('/init_point_table')
async def init_data_table(idt:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"create table if not exists map_point_{idt.graph_name}(point varchar(47),x float,y float)")
        conn.commit()
        return {'message':'建立点集表成功！'}
    except Exception as e:
        print(e)
        return {'message':"建立点集表失败！"}
    finally:
        cur.close()
        conn.close()

# 初始化边表
@nete.post('/init_edge_table')
async def init_data_table(idt:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"create table if not exists map_edge_{idt.graph_name}(start_point varchar(47),end_point varchar(47),weight int)")
        conn.commit()
        return {'message':'建立边集表成功！'}
    except Exception as e:
        print(e)
        return {'message':"建立边集表失败！"}
    finally:
        cur.close()
        conn.close()


# 初始化
@nete.post('/init_tu_table_data')
async def init_tu_table_data(ittd:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"insert into map_tu_{ittd.graph_name}(vertex_num,edge_num) values(0,0)")
        conn.commit()
        return {'message':'图信息表初始化成功！'}
    except Exception as e:
        print(e)
        return {'message':"图信息表初始化失败！"}
    finally:
        cur.close()
        conn.close()

# 添加基准点“学校大门”
@nete.post('/add_base_point')
async def add_base_point(abp:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"insert into map_point_{abp.graph_name}(point,x,y) values('学校大门',47.0,47.0)")
        conn.commit()
        cur.execute(f"select vertex_num from map_tu_{abp.graph_name}")
        data = cur.fetchone()
        print(data[0])
        if data:
            data = int(data[0])+1
            cur.execute(f"update map_tu_{abp.graph_name} set vertex_num={data}")
            conn.commit()
        else:
            print("错误！")
        return {'message':'添加基准点成功！'}
    except Exception as e:
        print(e)
        return {'message':"添加基准点失败！"}
    finally:
        cur.close()
        conn.close()


# 任意添加一个新点
@nete.post('/add_new_point')
async def add_new_point(anp:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"insert into map_point_{anp.graph_name}(point,x,y) values('{anp.new_place}',{anp.x},{anp.y})")
        conn.commit()
        cur.execute(f"select vertex_num from map_tu_{anp.graph_name}")
        data = cur.fetchone()
        if data:
            data = int(data[0])+1
            cur.execute(f"update map_tu_{anp.graph_name} set vertex_num={data}")
            conn.commit()
        else:
            print("错误！")
        return {'message':'添加'+anp.new_place+'成功！'}
    except Exception as e:
        print(e)
        return {'message':'添加'+anp.new_place+'失败！'}
    finally:
        cur.close()
        conn.close()

# 移动时修改点的位置
@nete.post('/change_point_position')
async def change_point_position(cpp:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"update map_point_{cpp.graph_name} set x={cpp.x},y={cpp.y} where point='{cpp.new_place}'")
        conn.commit()
        if cur.rowcount:
            return {'message':'位置修改成功!'}
    except Exception as e:
        print(e)
    finally:
        cur.close()
        conn.close()


# 任意添加一条新边
@nete.post('/add_new_edge')
async def add_new_edge(ane:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"insert into map_edge_{ane.graph_name}(start_point,end_point,weight) values('{ane.start_point}','{ane.end_point}',{ane.weight})")
        conn.commit()
        cur.execute(f"select edge_num from map_tu_{ane.graph_name}")
        data = cur.fetchone()
        if data:
            data = int(data[0])+1
            cur.execute(f"update map_tu_{ane.graph_name} set edge_num={data}")
            conn.commit()
        else:
            print("错误！")
        return {'message':'添加'+ane.start_point+'——'+ane.end_point+':'+str(ane.weight)+'成功！'}
    except Exception as e:
        print(e)
        return {'message':'添加'+ane.start_point+'->'+ane.end_point+':'+str(ane.weight)+'失败！'}
    finally:
        cur.close()
        conn.close()

# 获取指定点的坐标
@nete.post('/get_point_x_y')
async def get_point_x_y(gpxy:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"select * from map_point_{gpxy.graph_name} where point='{gpxy.start_point}' or point='{gpxy.end_point}'")
        data = cur.fetchall()
        # print(data)
        if data:
            columns = [desc[0] for desc in cur.description]
            result = []
            for row in data:
                result.append(dict(zip(columns,row)))
            print(result)
            return result
        else:
            return {'message':'当前地图上没有点'}
    except Exception as e:
        print(e)
        
    finally:
        cur.close()
        conn.close()
########################################################################################################################################
# 获取所有图名
@nete.get('/get_all_graphs')
async def get_all_graphs():
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute("select * from all_graphs")
        data = cur.fetchall()
        if data:
            columns = [desc[0] for desc in cur.description]
            result = []
            for row in data:
                result.append(dict(zip(columns,row)))
            print(result)
            return result
        else:
            return {'message':"当前没有图"}
    except Exception as e:
        print(e)
    finally:
        cur.close()
        conn.close()


# 获取指定图的相关信息
@nete.post('/get_all_map')
async def get_all_map(gam:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"select * from map_point_{gam.graph_name}")
        data_point = cur.fetchall()
        if data_point:
            columns = [desc[0] for desc in cur.description]
            result_point = []
            for row in data_point:
                result_point.append(dict(zip(columns,row)))
            print(result_point)
        cur.execute(f"select * from map_edge_{gam.graph_name}")
        data_edge = cur.fetchall()
        if data_edge:
            columns = [desc[0] for desc in cur.description]
            result_edge = []
            for row in data_edge:
                result_edge.append(dict(zip(columns,row)))
            print(result_edge)
        return {'point':result_point,'edge':result_edge}
    except Exception as e:
        print(e)
    finally:
        cur.close()
        conn.close()

# 删除点
@nete.post('/delete_point')
async def delete_point(dp:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"delete from map_point_{dp.graph_name} where point='{dp.new_place}'")
        conn.commit()
        if cur.rowcount:
            return {'message':"删除点"+dp.new_place+"成功！"}
        else:
            return {'message':"删除点"+dp.new_place+"失败！"}
    except Exception as e:
        print(e)
    finally:
        cur.close()
        conn.close()

# 根据一个点删除边
@nete.post('/delete_edge_by_one_point')
async def delete_edge_by_one_point(debop:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"delete from map_edge_{debop.graph_name} where start_point='{debop.new_place}' or end_point='{debop.new_place}'")
        conn.commit()
        if cur.rowcount:
            return {'message':"成功删除有关点"+debop.new_place+"的所有边！"}
        else:
            return {'message':"失败删除有关点"+debop.new_place+"的所有边！"}
    except Exception as e:
        print(e)
    finally:
        cur.close()
        conn.close()

# 删除边
@nete.post('/delete_edge')
async def delete_edge(de:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"delete from map_edge_{de.graph_name} where start_point='{de.start_point}' and end_point='{de.end_point}'")
        conn.commit()
        cur.execute(f"delete from map_edge_{de.graph_name} where start_point='{de.end_point}' and end_point='{de.start_point}'")
        conn.commit()
        if cur.rowcount:
            return {'message':"成功删除边"+de.start_point+'——'+de.end_point+"！"}
        else:
            return {'message':"删除边"+de.start_point+'——'+de.end_point+"失败！"}
    except Exception as e:
        print(e)
    finally:
        cur.close()
        conn.close()

# 修改点
@nete.post('/edit_point')
async def edit_edge(ee:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"update map_point_{ee.graph_name} set point='{ee.finished}' where point='{ee.new_place}'")
        conn.commit()
        if cur.rowcount:
            return {'message':"成功将点"+ee.new_place+"修改为"+ee.finished+"！"}
        else:
            return {'message':"失败将点"+ee.new_place+"修改为"+ee.finished+"！"}
    except Exception as e:
        print(e)
    finally:
        cur.close()
        conn.close()

# 修改点对应的边
@nete.post('/edit_edge_by_one_point')
async def edit_edge_by_one_point(eebop:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"update map_edge_{eebop.graph_name} set start_point='{eebop.finished}' where start_point='{eebop.new_place}'")
        conn.commit()
        cur.execute(f"update map_edge_{eebop.graph_name} set end_point='{eebop.finished}' where end_point='{eebop.new_place}'")
        conn.commit()
    except Exception as e:
        print(e)
    finally:
        cur.close()
        conn.close()

# 修改边
@nete.post('/edit_edge')
async def edit_edge(ee:map):
    try:
        conn = psycopg2.connect(
            dbname = "map",
            user = "postgres",
            password = "0623",
            host = "localhost",
            port = "5432"
        )
        cur = conn.cursor()
        cur.execute(f"update map_edge_{ee.graph_name} set weight={ee.weight} where start_point='{ee.start_point}' and end_point='{ee.end_point}'")
        conn.commit()
        if cur.rowcount==0:
            return {'message':"修改失败！"}
        else:
            return {'message':"修改成功！"}
    except Exception as e:
        print(e)
    finally:
        cur.close()
        conn.close()



if __name__ == '__main__':
    import uvicorn
    uvicorn.run(
        app = "main:nete",
        host = "127.0.0.1",
        port = 12348,
        reload = True,
        workers = 10
    )