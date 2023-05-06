from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from sklearn import manifold
from sklearn.manifold import MDS
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://127.0.0.1:5500"]}})

dataset = "heart_disease_cleaned.csv"
df_global = pd.read_csv(dataset)
data_frame = pd.read_csv(dataset, usecols = ["Age","CigsPerDay","Total Cholestrol","Systolic BP","Diastolic BP","BMI","Heart Rate","Glucose", "Current Smoker", "Diabetes", "BP Meds", "Prevalent Hypertension"])
std_scaler = StandardScaler()
min_max_scaler = MinMaxScaler()
data_copy = data_frame.copy()
data2_copy = data_frame.copy()
data_copy = pd.DataFrame(std_scaler.fit_transform(data_copy), columns = data_copy.columns)
data_copy = pd.DataFrame(min_max_scaler.fit_transform(data_copy), columns = data_copy.columns)
data_copy.head()
kmeans_res = []
kmeans = KMeans(n_clusters= 4)
kmeans_res = kmeans.fit_predict(data2_copy)
kmeans_data = data2_copy
kmeans_data['color'] = kmeans_res


@app.route("/barchart") 
def getBarChartData():
    varx = request.args['varX']
    vary = request.args['varY']
    
    df = pd.concat([df_global[varx], df_global[vary]], axis=1)
    df = df.reset_index()
    df_global.reset_index()

    dict = {}
    for i in df.index:
        if df[varx][i] in dict:
            dict[df[varx][i]] += df[vary][i]
        else:
            dict[df[varx][i]] = df[vary][i]
    
    values_json = {"x_axis": varx, "y_axis": vary, "data":[]}
    for key, value in dict.items():
        values_json['data'].append({"x_axis": key, "y_axis": value})
    json_data = json.dumps(values_json, default=np_encoder)
    return json_data
   
def np_encoder(object):
    if isinstance(object, np.generic):
        return object.item()
    
def binningAge(age):
    return int(age/5) - 5

def binningBMI(BMI):
    return int(BMI/5) - 2

@app.route("/heatmap") 
def getHeatMapData():
    varx = request.args['varX']
    vary = request.args['varY']
    varz = request.args['varZ']

    df = df_global    
    dict = {}
    
    for i in df.index:
        key_str = str(binningBMI(df[varx][i])) + ":" + str(binningAge(df[vary][i]))
        if df['Current Smoker'][i] == 0:
            continue
        if key_str in dict:
            dict[key_str] = [dict[key_str][0] + df[varz][i], dict[key_str][1] + 1]
        else:
            dict[key_str] = [df[varz][i], 1]
        
    values_json = {"x_axis": varx, "y_axis": vary, "data":[]}
    for key, value in dict.items():
        keys = key.split(':')
        values_json['data'].append({"group": keys[0], "variable": keys[1], "value": value[0]/value[1]})
    
    json_data = json.dumps(values_json, default=np_encoder)
    return json_data

@app.route("/piechart") 
def getPieChartData():
    varx = request.args['varX']
    vary = request.args['varY']
    df_global.reset_index()
    # df = pd.concat([df_global[varx], df_global[vary]], axis=1)
    df = df_global
    # df_global.reset_index()

    if(vary == 'None'):
        dict = {}
        dict['Yes'] = 0
        dict['No'] = 0
        for i in df.index:
            if df[varx][i] == 'yes':
                dict['Yes'] += 1
            else:
                dict['No'] += 1
        values_json = {"x_axis": varx, "y_axis": vary, "data":[]}
        print(dict)
        for key, value in dict.items():
            values_json['data'].append({key :value})
    else:
        dict = {}
        dict['Yes'] = 0
        dict['No'] = 0
        for i in df.index:
            if df[vary][i] == 0:
                continue
            if df[varx][i] == 'yes':
                dict['Yes'] += 1
            else:
                dict['No'] += 1
        values_json = {"x_axis": varx, "y_axis": vary, "data":[]}
        print(dict)
        for key, value in dict.items():
            values_json['data'].append({key :value})
    json_data = json.dumps(values_json, default=np_encoder)
    return json_data

@app.route("/pcp") 
def getPCPData():
    cols = ["Age","CigsPerDay","Total Cholestrol","Gender","Systolic BP", "Heart Stroke", "Diastolic BP","BMI","Heart Rate","Prevalent Stroke","Glucose", "Education"]
    df_global.reset_index()
    df = df_global
    
    values_json = {"cols": cols, "data":[]}
    for i in df.index:
        dict = {}
        for attribute in cols:
            dict[attribute] = df[attribute][i]
        dict['clusters'] = df['Heart Stroke'][i]
        values_json['data'].append(dict)
    json_data = json.dumps(values_json, default=np_encoder)
    return json_data

@app.route("/radarchart") 
def getRadarChartData():
    cols = ["Age","CigsPerDay","Total Cholestrol","Systolic BP","Diastolic BP","BMI","Heart Rate","Glucose"]
    df_global.reset_index()
    df = df_global
    values_json = []
    for i in range(10):
        value = []
        for attribute in cols:
            # dict.append({"axis": attribute, "value":df[attribute][i]})
            dict = {}
            dict['axis'] = attribute
            dict['value'] = df[attribute][i]
            value.append(dict)
        values_json.append(value)
    json_data = json.dumps(values_json, default=np_encoder)
    return json_data

@app.route("/scatterplot") 
def getScatterPlotData():

    varx = request.args['varX']
    vary = request.args['varY']
    varz = request.args['varZ']
    df_global.reset_index()
    df = df_global    
    dict = {}
    
    for i in df.index:
        key_str = df[varx][i].astype(str) + ":" + df[vary][i].astype(str)
        if key_str in dict:
            dict[key_str] += df[varz][i]
        else:
            dict[key_str] = df[varz][i]
        
    values_json = {"x_axis": varx, "y_axis": vary, "data":[]}
    for key, value in dict.items():
        keys = key.split(':')
        values_json['data'].append({"x_axis": keys[0], "y_axis": keys[1], "Heart Stroke": value})

    json_data = json.dumps(values_json, default=np_encoder)
    return json_data

df_mds_corr = None
country_avg_df = None

@app.route('/mds')
def getMDSData():
    mdsvariable = data2_copy
    no_cluster = mdsvariable.loc[:, mdsvariable.columns != 'color']
    mdsvariable = 1 - abs(no_cluster.corr())
    mds_data = manifold.MDS(n_components = 2, metric = True, dissimilarity = 'precomputed').fit_transform(mdsvariable)
    data_frame = np.hstack((mds_data,mdsvariable.columns.to_numpy().reshape(12,1)))
    data_frame = pd.DataFrame(data = data_frame, columns = ['xvalue', 'yvalue', 'name'])
    return json.dumps(data_frame.to_json())