# -*- encoding: utf-8 -*-
"""
License: MIT
Copyright (c) 2019 - present AppSeed.us
"""

from app.graphs.myconstants import *

# Python modules
import math
from . import blueprint
# Flask modules
import plotly.subplots as sp
from flask import render_template, request, url_for, redirect, send_from_directory, jsonify, make_response
from flask_table import Table, Col, LinkCol
from functools import partial
from bson import ObjectId
import json
import time
#from scipy.spatial.distance import pdist
#pw_jaccard_func = partial(pdist, metric='jaccard')
#import scipy.cluster.hierarchy as sch
import random
#from wordcloud import WordCloud, STOPWORDS
from pytimeparse.timeparse import timeparse
#import matplotlib.pyplot as plt
#import pyLDAvis.gensim
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')
nltk.download('wordnet')
from nltk.tokenize import RegexpTokenizer
from gensim import corpora, models
import gensim

from plotly.subplots import make_subplots
import plotly.graph_objs as go
from plotly import exceptions, optional_imports
from plotly.graph_objs import graph_objs
import plotly.express as px
import plotly.figure_factory as ff
from plotly.graph_objs import *
import plotly
from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot
#from chart_studio import plotly as py

import os
from os import path
from time import sleep
from matplotlib.figure import Figure
from dash_holoniq_wordcloud import DashWordcloud
from dash import Dash, dcc, html
from bs4 import BeautifulSoup


import csv
from collections import defaultdict
import string
stop_words = set(stopwords.words("english"))
from collections import OrderedDict

from distinctipy import distinctipy
np = optional_imports.get_module("numpy")
scp = optional_imports.get_module("scipy")
sch = optional_imports.get_module("scipy.cluster.hierarchy")
scs = optional_imports.get_module("scipy.spatial")
import numpy as np
np.random.seed(1)

import pandas as pd
import pickle
import seaborn as sns 
import os
import sys
import pymongo
import pandas as pd
import sklearn
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import subprocess

from scipy.cluster import hierarchy
from scipy.cluster.hierarchy import dendrogram, linkage, cut_tree
from collections import namedtuple
from json import JSONEncoder
from bigtree import Node, print_tree, dataframe_to_tree, tree_to_dataframe
from datetime import datetime
from datetime import timezone
import datetime
import networkx as nx
from scipy.spatial.distance import jaccard, squareform
#from bertopic import BERTopic

global threshold
global glo_dataframes
from eventregistry import *


from dotenv import load_dotenv, set_key
load_dotenv()
from dateutil import tz
import pytz
eastern = pytz.timezone('Europe/Berlin')

threshold = 0.2
dendro_clusters = 0
color_ran = []
selected_event = ""
selected_barrier = ""
dbfileName = 'data/ForPropagationNetworkNew2.csv'
total_clusters = 0
clustered_dataframes = pd.DataFrame()
client = pymongo.MongoClient(os.getenv("DB_URL"))
db = client["test_llm_1"]


KEY = "EVENTR_KEY"
er = EventRegistry(apiKey=KEY)


@blueprint.route('/users.html')
@blueprint.route('/users/<path>')
def index(path):
    content = None
    try:
        return render_template('layouts/default.html', content=render_template('pages/' + path))

    except:
        return render_template('layouts/auth-default.html', content=render_template('pages/404.html'))

@blueprint.route('/simulations')
def simulations():
    content = None
    try:
        return render_template('layouts/default.html', content=render_template('pages/simulations.html'))

    except:
        return render_template('layouts/auth-default.html', content=render_template('pages/404.html'))

# Return sitemap
@blueprint.route('/sitemap.xml')
def sitemap():
    return send_from_directory(os.path.join(app.root_path, '../static'), 'sitemap.xml')

@blueprint.route('/quantitative')
def quantitative():
    #print("ad dashboard")
    return render_template('layouts/default.html', content=render_template('pages/index.html'))


@blueprint.route('/traffic')
def traffic():
    #print("ad dashboard")
    return render_template('layouts/default.html', content=render_template('pages/Traffic.html'))


@blueprint.route('/cascade')
def cascade():
    #print("ad dashboard")
    return render_template('layouts/default.html', content=render_template('pages/Cascade.html'))


@blueprint.route('/followers')
def followers():
    #print("ad dashboard")
    return render_template('layouts/default.html', content=render_template('pages/Followers.html'))


@blueprint.route('/forensic')
def forensic():
    #print("ad dashboard")
    return render_template('layouts/default.html', content=render_template('pages/Forensic.html'))


@blueprint.route('/')
def users():
    #print("ad dashboard")
    return render_template('layouts/default.html', content=render_template('pages/users.html'))

@blueprint.route('/posts')
def posts():
    #print("ad dashboard")
    return render_template('layouts/default.html', content=render_template('pages/posts.html'))

@blueprint.route('/surveys')
def surveys():
    #print("ad dashboard")
    return render_template('layouts/default.html', content=render_template('pages/surveys.html'))

@blueprint.route('/ranker')
def ranker():
    #print("ad dashboard")
    return render_template('layouts/default.html', content=render_template('pages/ranker.html'))

@blueprint.route('/bots')
def bots():
    #print("ad dashboard")
    return render_template('layouts/default.html', content=render_template('pages/bots.html'))



########################### FIRST PAGE ###########################################
@blueprint.route('/usercomparison', methods=['GET', 'POST'])
def usercomparison():
    usersData = pd.DataFrame(list(db.users.find()))
    dfg = usersData.groupby('isAdmin').count().reset_index()
    dfg = dfg.rename(columns={"isAdmin": "User is Admin?", "username": "Total Users"})
    fig = px.bar(dfg,x='User is Admin?',y='Total Users',title='<b>Admin users vs. Other users</b>')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON


@blueprint.route('/postsovertime', methods=['GET', 'POST'])
def postsovertime():
    postsData = pd.DataFrame(list(db.posts.find()))
    postsData['createdAt'] = pd.to_datetime(postsData['createdAt'])
    postsData['createdAt'] = postsData['createdAt'].dt.tz_localize(None)
    start_date = pd.to_datetime('2024-04-22')
    end_date = pd.to_datetime('2024-04-26')
    postsData = postsData[(postsData['createdAt'] >= start_date) & (postsData['createdAt'] <= end_date)]

    postsData.set_index('createdAt', inplace=True)
    postsData.index = postsData.index.tz_localize(pytz.utc).tz_convert(eastern)
    postsData.reset_index(inplace=True)
    postsData['MD'] = postsData['createdAt'].dt.strftime('%Y-%m-%d')
    
    dfg = postsData.groupby('MD').count().reset_index()
    dfg = dfg.rename(columns={"MD": "Time", "desc": "Total Posts"})

    #dfg = dfg.rename(columns={"isAdmin": "User is Admin?", "username": "Total Users"})
    fig = px.bar(dfg, x='Time',y='Total Posts',title='<b>Volume of posts (daily) over time</b>')
    fig.update_layout(font=dict(family="Helvetica", size=18, color="black"))
    
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

@blueprint.route('/CaseStudyDoneRoute', methods=['GET', 'POST'])
def CaseStudyDoneRoute():
    activities = pd.DataFrame(list(db.timemes.find()))
    activities = activities.dropna(how='any',axis=0)
    users = pd.DataFrame(list(db.users.find()))
    users = users.rename(columns={"_id": "userId"}) 
    users = users.dropna(subset=['username'], axis=0) 
    
    df_merged = activities.merge(users, on='userId', how = 'right').reset_index()
    df_merged = df_merged[["seconds", "userId","username", "createdAt_x", "page"]]
    df_merged = df_merged[df_merged["page"] == "Home"]
    df_merged = df_merged.sort_values(by='createdAt_x')
    df_merged['createdAt_x'] = pd.to_datetime(df_merged['createdAt_x'])
    start_date = pd.to_datetime('2024-04-22')
    end_date = pd.to_datetime('2024-04-26')
    filtered_df = df_merged[(df_merged['createdAt_x'] >= start_date) & (df_merged['createdAt_x'] <= end_date)]
    filtered_df['seconds'] = filtered_df['seconds'].astype(float).astype(int)
    filtered_df = filtered_df.sort_values(by=['username'])
    filtered2 = filtered_df[filtered_df['seconds'] == filtered_df.groupby('username')['seconds'].shift(-1)]


    df_merged2 = activities.merge(users, on='userId', how = 'right').reset_index()
    df_merged2 = df_merged2[["seconds", "userId","username", "createdAt_x", "page"]]
    df_merged2 = df_merged2[df_merged2["page"] == "DetailPage"]
    df_merged2 = df_merged2.sort_values(by='createdAt_x')
    df_merged2['createdAt_x'] = pd.to_datetime(df_merged2['createdAt_x'])
    filtered_df2 = df_merged2[(df_merged2['createdAt_x'] >= start_date) & (df_merged2['createdAt_x'] <= end_date)]
    filtered_df2['seconds'] = filtered_df2['seconds'].astype(float).astype(int)
    filtered_df2 = filtered_df2.sort_values(by=['username'])
    filtered3 = filtered_df2[filtered_df2['seconds'] == filtered_df2.groupby('username')['seconds'].shift(-1)]
    
    
    filtered_df = pd.concat([filtered2, filtered3], ignore_index=True)
    filtered_df['createdAt_x'] = filtered_df['createdAt_x'].dt.strftime('%Y-%m-%d')

    #filtered_df['createdAt_x2'] = filtered_df.index.strftime('%Y-%m-%d %H:%M:%S')
    result = filtered_df.groupby(['username', 'createdAt_x']).agg({'seconds': 'sum'}).reset_index()
    result['seconds'] = result['seconds'] / 60
    result = result.rename(columns={"createdAt_x": "Days","seconds": "Minutes"})
    user_scores = result.groupby('username')['Minutes'].agg(['count', 'min'])
    filtered_users = user_scores[(user_scores['count'] == 3) & (user_scores['min'] >= 5)]
    filtered_users = filtered_users.reset_index()
    fig = px.bar(filtered_users, x="username",y="min", title='<b>Users who spent at least 8 minutes for three days</b>')
    fig.update_xaxes(tickangle=-45)
    fig.update_layout(font=dict(family="Helvetica", size=18, color="black"))
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON



@blueprint.route('/TotalTimeCaseStudyRoute', methods=['GET', 'POST'])
def TotalTimeCaseStudyRoute():
    activities = pd.DataFrame(list(db.timemes.find()))
    activities = activities.dropna(how='any',axis=0)
    users = pd.DataFrame(list(db.users.find()))
    users = users.rename(columns={"_id": "userId"}) 
    users = users.dropna(subset=['username'], axis=0) 
    
    df_merged = activities.merge(users, on='userId', how = 'right').reset_index()
    df_merged = df_merged[["seconds", "userId","username", "createdAt_x", "page"]]
    df_merged = df_merged[df_merged["page"] == "Home"]
    df_merged = df_merged.sort_values(by='createdAt_x')
    df_merged['createdAt_x'] = pd.to_datetime(df_merged['createdAt_x'])
    start_date = pd.to_datetime('2024-04-22')
    end_date = pd.to_datetime('2024-04-26')
    filtered_df = df_merged[(df_merged['createdAt_x'] >= start_date) & (df_merged['createdAt_x'] <= end_date)]
    filtered_df['seconds'] = filtered_df['seconds'].astype(float).astype(int)
    filtered_df = filtered_df.sort_values(by=['username'])
    filtered2 = filtered_df[filtered_df['seconds'] == filtered_df.groupby('username')['seconds'].shift(-1)]


    df_merged2 = activities.merge(users, on='userId', how = 'right').reset_index()
    df_merged2 = df_merged2[["seconds", "userId","username", "createdAt_x", "page"]]
    df_merged2 = df_merged2[df_merged2["page"] == "DetailPage"]
    df_merged2 = df_merged2.sort_values(by='createdAt_x')
    df_merged2['createdAt_x'] = pd.to_datetime(df_merged2['createdAt_x'])
    filtered_df2 = df_merged2[(df_merged2['createdAt_x'] >= start_date) & (df_merged2['createdAt_x'] <= end_date)]
    filtered_df2['seconds'] = filtered_df2['seconds'].astype(float).astype(int)
    filtered_df2 = filtered_df2.sort_values(by=['username'])
    filtered3 = filtered_df2[filtered_df2['seconds'] == filtered_df2.groupby('username')['seconds'].shift(-1)]
    
    
    filtered_df = pd.concat([filtered2, filtered3], ignore_index=True)
    
    
    
    filtered_df['createdAt_x'] = filtered_df['createdAt_x'].dt.strftime('%Y-%m-%d')

    result = filtered_df.groupby(['username', 'createdAt_x']).agg({'seconds': 'sum'}).reset_index()
    result['seconds'] = result['seconds'] / 60
    result = result.rename(columns={"createdAt_x": "Days"})#,"seconds": "Minutes"})

    #filtered_df['createdAt_x2'] = filtered_df.index.strftime('%Y-%m-%d %H:%M:%S')
    pivot_table = result.pivot_table(values='seconds', index='Days', columns='username', aggfunc='sum')
    pivot_table = pivot_table.fillna(0)

    # Create the heatmap using Plotly Express
    fig = px.imshow(pivot_table, 
                labels=dict(x="username", y="Days", color="seconds"),
                x=pivot_table.columns,
                y=pivot_table.index,
                color_continuous_scale='Viridis')

    fig.update_layout(title='Total minutes spent on each day by the users')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON
    
    
    result = filtered_df.groupby(['username', 'createdAt_x']).agg({'seconds': 'sum'}).reset_index()
    result['seconds'] = result['seconds'] / 60
    result = result.rename(columns={"createdAt_x": "Days","seconds": "Minutes"})
    fig = px.bar(result, x='Days', y='Minutes', color='username', barmode='group',title='<b>Total minutes spent on each day by the users</b>')  
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON


@blueprint.route('/userssovertime', methods=['GET', 'POST'])
def userssovertime():
    postsData = pd.DataFrame(list(db.users.find()))
    postsData['createdAt'] = pd.to_datetime(postsData['createdAt'])
    postsData['createdAt'] = postsData['createdAt'].dt.tz_localize(None)
    start_date = pd.to_datetime('2024-04-22')
    end_date = pd.to_datetime('2024-04-26')
    postsData = postsData[(postsData['createdAt'] >= start_date) & (postsData['createdAt'] <= end_date)]
    
    postsData['createdAt'] = postsData['createdAt'].astype('datetime64[ns]')
    postsData['MD'] = postsData['createdAt'].dt.strftime('%Y-%m-%d')
    
    dfg = postsData.groupby('MD').count().reset_index()
    dfg = dfg.rename(columns={"MD": "Time", "username": "Total Users"})

    #dfg = dfg.rename(columns={"isAdmin": "User is Admin?", "username": "Total Users"})
    fig = px.bar(dfg, x='Time',y='Total Users',title='<b>Volume of users (daily) over time</b>')
    fig.update_layout(font=dict(family="Helvetica", size=18, color="black"))
    
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

@blueprint.route('/postsbyUsers', methods=['GET', 'POST'])
def postsbyUsers():
    postsData = pd.DataFrame(list(db.posts.find()))
    print(postsData)
    postsData = postsData.rename(columns={"_id": "postId"}) 
    postsData = postsData.dropna(subset=['postId'], axis=0)
    postsData = postsData.dropna(subset=['userId'], axis=0)
    postsData = postsData.dropna(subset=['desc'], axis=0)
    
    users = pd.DataFrame(list(db.users.find()))
    users = users.rename(columns={"_id": "userId"}) 
    users = users.dropna(subset=['username'], axis=0)
    users = users.dropna(subset=['userId'], axis=0)
    
    users = users.dropna(subset=['userId'], axis=0)
    postsData['userId'] = postsData['userId'].astype(str)
    users['userId'] = users['userId'].astype(str)
    
    users = users[["userId", "username"]].reset_index(drop=True)
    postsData = postsData[["postId", "userId","desc"]].reset_index(drop=True)
    
    df_merged = pd.merge(users, postsData, on ='userId', how ="left")
    dfg = df_merged.groupby(['username', "postId"]).count().reset_index()
    dfg = dfg.rename(columns={"username": "Username", "desc":"Total Posts"})
    
    fig = px.bar(dfg, x="Username",y="Total Posts", title='<b>Total posts</b>')
    fig.update_xaxes(tickangle=-45)
    fig.update_layout(font=dict(family="Helvetica", size=18, color="black"))
    
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

@blueprint.route('/viewershipsOfPosts', methods=['GET', 'POST'])
def viewershipsOfPosts():
    
    readposts = pd.DataFrame(list(db.readposts.find()))
    if len(readposts) <1:
        return ""
    readposts = readposts.dropna(subset=['userId'], axis=0)
    readposts = readposts[["postId", "userId"]].reset_index(drop=True)
    
    users = pd.DataFrame(list(db.users.find()))
    users = users.rename(columns={"_id": "userId"}) 
    users = users.dropna(subset=['username'], axis=0)
    users = users.dropna(subset=['userId'], axis=0)
    
    users = users.dropna(subset=['userId'], axis=0)
    readposts['userId'] = readposts['userId'].astype(str)
    users['userId'] = users['userId'].astype(str)
    
    users = users[["userId", "username"]].reset_index(drop=True)
    readposts = readposts[["postId", "userId"]].reset_index(drop=True)
    
    df_merged = pd.merge(users,readposts , on ='userId', how ="left")
    totalViewership = df_merged.groupby(['username', "userId", "postId"]).size().reset_index(name='Count')
    totalViewership = totalViewership.rename(columns={"username":"Username", "Count":"Total posts read"})
    print(totalViewership.columns)
    try:
        fig = px.bar(totalViewership, x="Username",y="Total posts read", title='<b>Total posts read by each user</b>')
        fig.update_xaxes(tickangle=-45)
        fig.update_layout(font=dict(family="Helvetica", size=18, color="black"))
    
        graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        return graphJSON
    except:
        return ""


@blueprint.route('/userActivityHome', methods=['GET', 'POST'])
def userActivityHome():
    activities = pd.DataFrame(list(db.timemes.find()))
    activities = activities.dropna(how='any',axis=0)
    activities = activities[activities["page"] == "Home"]  
    
    users = pd.DataFrame(list(db.users.find()))
    users = users.rename(columns={"_id": "userId"}) 
    users = users.dropna(subset=['username'], axis=0) 
    
    df_merged = activities.merge(users, on='userId', how = 'left').reset_index()
    df_merged = df_merged[["seconds", "userId","username", "createdAt_x", "page"]] 
    
    start_date = pd.to_datetime('2024-04-22')
    end_date = pd.to_datetime('2024-04-26')
    df_merged = df_merged[(df_merged['createdAt_x'] >= start_date) & (df_merged['createdAt_x'] <= end_date)]
    
    df_merged.set_index('createdAt_x', inplace=True)
    df_merged.index = df_merged.index.tz_localize(pytz.utc).tz_convert(eastern)
    df_merged.reset_index(inplace=True)
    #df_merged['MD'] = df_merged.index.strftime('%Y-%m-%d %H:%M:%S')

    df_merged['seconds'] = df_merged['seconds'].astype(float).astype(int)
    #df_merged['datetime'] = pd.to_datetime(df_merged['seconds'], unit='s')
    #df_merged['datetime_string'] = df_merged['datetime'].dt.strftime('%S')
    
    #df_merged["MD"] = df_merged["MD"].astype('datetime64[ns]')
    df_merged = df_merged.rename(columns={"createdAt_x": "Time", "seconds": "Time Spent (seconds)"})
    pivot_table = df_merged.pivot_table(values='Time Spent (seconds)', index='Time', columns='username', aggfunc='sum')
    pivot_table = pivot_table.fillna(0)

    # Create the heatmap using Plotly Express
    fig = px.imshow(pivot_table, 
                labels=dict(x="username", y="Time", color="Time Spent (seconds)"),
                x=pivot_table.columns,
                y=pivot_table.index,
                color_continuous_scale='Viridis')

    fig.update_layout(title='Time spent by each user on home screen')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON
    
    
    dfg = df_merged.groupby(['Time', 'Time Spent (seconds)', 'username']).count().reset_index()
    fig = px.line(dfg, x="Time", y="Time Spent (seconds)", color='username',title='<b>Time spent by each user on home screen</b>', line_shape='linear')
    fig.update_layout(font=dict(family="Helvetica", size=18, color="black"))
    
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

@blueprint.route('/postDetailActivity', methods=['GET', 'POST'])
def postDetailActivity():
    activities = pd.DataFrame(list(db.timemes.find()))
    activities = activities.dropna(how='any',axis=0)
    activities = activities[activities["page"] == "DetailPage"]  
    
    users = pd.DataFrame(list(db.users.find()))
    users = users.rename(columns={"_id": "userId"}) 
    users = users.dropna(subset=['username'], axis=0) 
    
    df_merged = activities.merge(users, on='userId', how = 'left').reset_index()
    df_merged = df_merged[["seconds", "userId","username", "createdAt_x", "page"]] 
    
    start_date = pd.to_datetime('2024-04-22')
    end_date = pd.to_datetime('2024-04-26')
    df_merged = df_merged[(df_merged['createdAt_x'] >= start_date) & (df_merged['createdAt_x'] <= end_date)]
    
    df_merged.set_index('createdAt_x', inplace=True)
    df_merged.index = df_merged.index.tz_localize(pytz.utc).tz_convert(eastern)
    df_merged.reset_index(inplace=True)
    
    df_merged['seconds'] = df_merged['seconds'].astype(float).astype(int)
    
    #df_merged['datetime'] = pd.to_datetime(df_merged['seconds'], unit='s')
    #df_merged['datetime_string'] = df_merged['datetime'].dt.strftime('%S')
    
    #df_merged['createdAt_x'] = df_merged['createdAt_x'].astype('datetime64[ns]')
    df_merged = df_merged.rename(columns={"createdAt_x": "Time", "seconds": "Time Spent (seconds)"})
    pivot_table = df_merged.pivot_table(values='Time Spent (seconds)', index='Time', columns='username', aggfunc='sum')
    pivot_table = pivot_table.fillna(0)

    # Create the heatmap using Plotly Express
    fig = px.imshow(pivot_table, 
                labels=dict(x="username", y="Time", color="Time Spent (seconds)"),
                x=pivot_table.columns,
                y=pivot_table.index,
                color_continuous_scale='Viridis')

    fig.update_layout(title='Time spent by each user on home screen')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON
    
    
    
    dfg = df_merged.groupby(['Time', 'Time Spent (seconds)', 'username']).count().reset_index()
    fig = px.line(dfg, x="Time", y="Time Spent (seconds)", color='username',title='<b>Time spent by each user on Detail screen</b>', line_shape='linear')
    fig.update_layout(font=dict(family="Helvetica", size=18, color="black"))
    
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON



@blueprint.route('/postviewovertime', methods=['GET', 'POST'])
def postviewovertime():
    postsData = pd.DataFrame(list(db.posts.find()))
    postsData['createdAt'] = postsData['createdAt'].astype('datetime64[ns]')
    
    start_date = pd.to_datetime('2024-04-22')
    end_date = pd.to_datetime('2024-04-26')
    postsData = postsData[(postsData['createdAt'] >= start_date) & (postsData['createdAt'] <= end_date)]
    
    postsData['MD'] = postsData['createdAt'].dt.strftime('%Y-%m-%d')
    
    dfg = postsData.groupby('MD').count().reset_index()
    dfg = dfg.rename(columns={"MD": "Time", "desc": "Total Posts"})

    #dfg = dfg.rename(columns={"isAdmin": "User is Admin?", "username": "Total Users"})
    fig = px.bar(dfg, x='Time',y='Total Posts',title='Volume of posts over time')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

@blueprint.route('/postreadovertime', methods=['GET', 'POST'])
def postreadovertime():
    postsData = pd.DataFrame(list(db.posts.find()))
    postsData['createdAt'] = postsData['createdAt'].astype('datetime64[ns]')
    postsData['MD'] = postsData['createdAt'].dt.strftime('%Y-%m-%d')
    
    start_date = pd.to_datetime('2024-04-22')
    end_date = pd.to_datetime('2024-04-26')
    postsData = postsData[(postsData['createdAt'] >= start_date) & (postsData['createdAt'] <= end_date)]
    
    dfg = postsData.groupby('MD').count().reset_index()
    dfg = dfg.rename(columns={"MD": "Time", "desc": "Total Posts"})

    #dfg = dfg.rename(columns={"isAdmin": "User is Admin?", "username": "Total Users"})
    fig = px.bar(dfg, x='Time',y='Total Posts',title='Volume of posts over time')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

@blueprint.route('/presurveysubmissiontime', methods=['GET', 'POST'])
def presurveysubmissiontime():
    usersData = pd.DataFrame(list(db.users.find()))
    presurData = pd.DataFrame(list(db.presurveys.find()))
    usersData['uniqueId'] = usersData['uniqueId'].astype(str)
    presurData['uniqueId'] = presurData['uniqueId'].astype(str)
    usersData = usersData[["_id", "username", "uniqueId"]].reset_index(drop=True)
    presurData = presurData[["uniqueId", "createdAt"]].reset_index(drop=True)
    
    start_date = pd.to_datetime('2024-04-22')
    end_date = pd.to_datetime('2024-04-26')
    presurData = presurData[(presurData['createdAt'] >= start_date) & (presurData['createdAt'] <= end_date)]
    
    df_merged = pd.merge(presurData, usersData, on ='uniqueId', how ="left")
    
    df_merged.set_index('createdAt', inplace=True)
    df_merged.index = df_merged.index.tz_localize(pytz.utc).tz_convert(eastern)
    df_merged.reset_index(inplace=True)
    
    df_merged = df_merged.rename(columns={"createdAt":"time"})
    fig = px.bar(df_merged, x="username",y="time", title='Users who submitted the pre-survey?')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

@blueprint.route('/postsurveysubmissiontime', methods=['GET', 'POST'])
def postsurveysubmissiontime():
    usersData = pd.DataFrame(list(db.users.find()))
    presurData = pd.DataFrame(list(db.postsurveys.find()))
    usersData['_id'] = usersData['_id'].astype(str)
    presurData['userId'] = presurData['userId'].astype(str)
    usersData = usersData[["_id", "username", "uniqueId"]].reset_index(drop=True)
    usersData = usersData.rename(columns={"_id":"userId"})
    presurData['createdAt'] = pd.to_datetime(presurData['createdAt'])
    presurData = presurData[["userId", "createdAt"]].reset_index(drop=True)
    df_merged = pd.merge(presurData, usersData, on ='userId', how ="left")
    start_date = pd.to_datetime('2024-04-22')
    end_date = pd.to_datetime('2024-04-26')
    presurData = presurData[(presurData['createdAt'] >= start_date) & (presurData['createdAt'] <= end_date)]
    
    df_merged.set_index('createdAt', inplace=True)
    df_merged.index = df_merged.index.tz_localize(pytz.utc).tz_convert(eastern)
    df_merged.reset_index(inplace=True)
    
    df_merged = df_merged.rename(columns={"createdAt":"time"})
    fig = px.bar(df_merged, x="username",y="time", title='Users who submitted the post-survey?')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

@blueprint.route('/totalRankedPosts', methods=['GET', 'POST'])
def totalRankedPosts():
    ppl_flower = pd.DataFrame(list(db.posts.find()))
    ppl_flower['userId'] = ppl_flower['userId'].astype(str)
    usersData = pd.DataFrame(list(db.users.find()))
    usersData['_id'] = usersData['_id'].astype(str)
    usersData = usersData.rename(columns={"_id":"userId"})

    df_merged = pd.merge(ppl_flower, usersData, on ='userId', how ="left")
    
    df_sorted = df_merged.sort_values(by='updatedAt_x', ascending=False)
    
    df_sorted.set_index('updatedAt_x', inplace=True)
    df_sorted.index = df_sorted.index.tz_localize(pytz.utc).tz_convert(eastern)
    df_sorted.reset_index(inplace=True)
    
    df_sorted['MD'] = df_sorted['updatedAt_x'].dt.strftime('%Y-%m-%dT%H:%M')
    df_sorted = df_sorted.rename(columns={"MD":"Time"})
    #df_sorted = df_sorted[df_sorted['rank'] != 0.0]
    pivot_table = df_sorted.pivot_table(values='rank', index='Time', columns='username', aggfunc='sum')
    pivot_table = pivot_table.fillna(0)

    # Create the heatmap using Plotly Express
    fig = px.imshow(pivot_table, 
                labels=dict(x="username", y="Time", color="rank"),
                x=pivot_table.columns,
                y=pivot_table.index,
                color_continuous_scale='Viridis')

    fig.update_layout(title='The latest ranked posts')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON


    df_sorted = df_sorted.head(10)
    fig = px.bar(df_sorted, x='Time', y='rank', color='username', title='The latest ranked posts')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON
    



@blueprint.route('/BotsTotalRepliesRoute', methods=['GET', 'POST'])
def BotsTotalRepliesRoute():
    
    one = db.users.find({'username': bot1})
    two = db.users.find({'username': bot2})
    three = db.users.find({'username': bot3})
    four = db.users.find({'username': bot4})
    five = db.users.find({'username': bot5})
    six = db.users.find({'username': bot6})
    seven = db.users.find({'username': bot7})
    eight = db.users.find({'username': bot8})
    nine = db.users.find({'username': bot9})
    ten = db.users.find({'username': bot10})
    ele = db.users.find({'username': bot11})
    twe = db.users.find({'username': bot12})
    thir = db.users.find({'username': bot13})
    fou = db.users.find({'username': bot14})
    fif = db.users.find({'username': bot15})
    s16 = db.users.find({'username': bot16})
    s17 = db.users.find({'username': bot17})
    s18 = db.users.find({'username': bot18})
    s19 = db.users.find({'username': bot19})
    s20 = db.users.find({'username': bot20})
    s21 = db.users.find({'username': bot21})
    s22 = db.users.find({'username': bot22})
    s23 = db.users.find({'username': bot23})
    s24 = db.users.find({'username': bot24})
    
    
    one_latest = pd.DataFrame()
    two_latest = pd.DataFrame()
    three_latest = pd.DataFrame()
    four_latest = pd.DataFrame()
    five_latest = pd.DataFrame()
    six_latest = pd.DataFrame()
    seven_latest = pd.DataFrame()
    eight_latest = pd.DataFrame()
    nine_latest = pd.DataFrame()
    ten_latest = pd.DataFrame()
    ele_latest = pd.DataFrame()
    twe_latest = pd.DataFrame()
    thir_latest = pd.DataFrame()
    fou_latest = pd.DataFrame()
    fif_latest = pd.DataFrame()
    s16_latest = pd.DataFrame()
    s17_latest = pd.DataFrame()
    s18_latest = pd.DataFrame()
    s19_latest = pd.DataFrame()
    s20_latest = pd.DataFrame()
    s21_latest = pd.DataFrame()
    s22_latest = pd.DataFrame()
    s23_latest = pd.DataFrame()
    s24_latest = pd.DataFrame()
    
    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":one[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        one_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":two[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        two_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":three[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        three_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":four[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        four_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":five[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        five_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":six[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        six_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
        
        
    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":seven[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        seven_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":eight[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        eight_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":nine[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        nine_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":ten[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        ten_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":ele[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        ele_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":twe[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        twe_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
        
    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":thir[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        thir_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":fou[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        fou_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":fif[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        fif_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
        
    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":s16[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s16_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":s17[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s17_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":s18[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s18_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":s19[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s19_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":s20[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s20_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":s21[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s21_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
        
    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":s22[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s22_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":s23[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s23_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.comments.find({"userId":s24[0]["_id"]})))
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s24_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
        
        
    try:
        dfs = [one_latest, two_latest, three_latest, four_latest, five_latest, six_latest, seven_latest, eight_latest, nine_latest, ten_latest, ele_latest, twe_latest, thir_latest, fou_latest, fif_latest, s16_latest, s17_latest, s18_latest, s19_latest, s20_latest, s21_latest, s22_latest, s23_latest, s24_latest]
        dfs_defined = [df for df in dfs if df is not None] 

        if dfs_defined:
            concatenated_df = pd.concat(dfs_defined)
            concatenated_df.reset_index(drop=True, inplace=True)
            concatenated_df['index'] = concatenated_df.reset_index().index + 1
            print(len(concatenated_df))
            if len(concatenated_df) > 0:
                print(concatenated_df.columns)
                concatenated_df = concatenated_df.sort_values(by='updatedAt', ascending=False)
                
                concatenated_df.set_index('updatedAt', inplace=True)
                concatenated_df.index = concatenated_df.index.tz_localize(pytz.utc).tz_convert(eastern)
                concatenated_df.reset_index(inplace=True)
        
                latest_updates = concatenated_df.groupby('username').tail(5)
                latest_updates['MD'] = latest_updates['updatedAt'].dt.strftime('%Y-%m-%dT%H:%M')
                latest_updates = latest_updates.rename(columns={"MD":"Time"})
                latest_updates = latest_updates.head(15)
                fig = px.bar(latest_updates, x='Time', y='index', color='username', barmode='group', title='The most recent comments on posts')
                graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
                return graphJSON
            else:
                return ""
    except Exception as e:
        print("An error occurred:", e) 
        return ""
        
        
@blueprint.route('/BotsTotalPostsRoute', methods=['GET', 'POST'])
def BotsTotalPostsRoute():
    one = db.users.find({'username': bot1})
    two = db.users.find({'username': bot2})
    three = db.users.find({'username': bot3})
    four = db.users.find({'username': bot4})
    five = db.users.find({'username': bot5})
    six = db.users.find({'username': bot6})
    seven = db.users.find({'username': bot7})
    eight = db.users.find({'username': bot8})
    nine = db.users.find({'username': bot9})
    ten = db.users.find({'username': bot10})
    ele = db.users.find({'username': bot11})
    twe = db.users.find({'username': bot12})
    thir = db.users.find({'username': bot13})
    fou = db.users.find({'username': bot14})
    fif = db.users.find({'username': bot15})
    s16 = db.users.find({'username': bot16})
    s17 = db.users.find({'username': bot17})
    s18 = db.users.find({'username': bot18})
    s19 = db.users.find({'username': bot19})
    s20 = db.users.find({'username': bot20})
    s21 = db.users.find({'username': bot21})
    s22 = db.users.find({'username': bot22})
    s23 = db.users.find({'username': bot23})
    s24 = db.users.find({'username': bot24})
    
    one_latest = pd.DataFrame()
    two_latest = pd.DataFrame()
    three_latest = pd.DataFrame()
    four_latest = pd.DataFrame()
    five_latest = pd.DataFrame()
    six_latest = pd.DataFrame()
    seven_latest = pd.DataFrame()
    eight_latest = pd.DataFrame()
    nine_latest = pd.DataFrame()
    ten_latest = pd.DataFrame()
    ele_latest = pd.DataFrame()
    twe_latest = pd.DataFrame()
    thir_latest = pd.DataFrame()
    fou_latest = pd.DataFrame()
    fif_latest = pd.DataFrame()
    s16_latest = pd.DataFrame()
    s17_latest = pd.DataFrame()
    s18_latest = pd.DataFrame()
    s19_latest = pd.DataFrame()
    s20_latest = pd.DataFrame()
    s21_latest = pd.DataFrame()
    s22_latest = pd.DataFrame()
    s23_latest = pd.DataFrame()
    s24_latest = pd.DataFrame()
    
    print(one[0]["_id"])
    print(two[0]["_id"])
    print(three[0]["_id"])
    print(four[0]["_id"])
    print(five[0]["_id"])
    print(seven[0]["_id"])
    print(eight[0]["_id"])
    print(nine[0]["_id"])
    print(ten[0]["_id"])
    print(ele[0]["_id"])
    print(twe[0]["_id"])
    print(thir[0]["_id"])
    print(fou[0]["_id"])
    print(fif[0]["_id"])
    
    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(one[0]["_id"])})))
        ppl_flower["username"] = bot1
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        one_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(two[0]["_id"])})))
        ppl_flower["username"] = bot2
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        two_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(three[0]["_id"])})))
        ppl_flower["username"] = bot3
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        three_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(four[0]["_id"])})))
        ppl_flower["username"] = bot4
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        four_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(five[0]["_id"])})))
        ppl_flower["username"] = bot5
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        five_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(six[0]["_id"])})))
        ppl_flower["username"] = bot6
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        six_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
        
        
    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(seven[0]["_id"])})))
        ppl_flower["username"] = bot7
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        seven_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(eight[0]["_id"])})))
        ppl_flower["username"] = bot8
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        eight_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(nine[0]["_id"])})))
        ppl_flower["username"] = bot9
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        nine_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(ten[0]["_id"])})))
        ppl_flower["username"] = bot10
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        ten_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(ele[0]["_id"])})))
        ppl_flower["username"] = bot11
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        ele_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(twe[0]["_id"])})))
        ppl_flower["username"] = bot12
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        twe_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
        
    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(thir[0]["_id"])})))
        ppl_flower["username"] = bot13
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        thir_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(fou[0]["_id"])})))
        ppl_flower["username"] = bot14
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        fou_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(fif[0]["_id"])})))
        ppl_flower["username"] = bot15
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        fif_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(s16[0]["_id"])})))
        ppl_flower["username"] = bot16
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        s16_latest = df_sorted.head(2)
    except Exception as e:
        print("here here An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(s17[0]["_id"])})))
        ppl_flower["username"] = bot17
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        s17_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(s18[0]["_id"])})))
        ppl_flower["username"] = bot18
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        s18_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(s19[0]["_id"])})))
        ppl_flower["username"] = bot19
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        s19_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(s20[0]["_id"])})))
        ppl_flower["username"] = bot20
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        s20_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(s21[0]["_id"])})))
        ppl_flower["username"] = bot21
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        s21_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
        
    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(s22[0]["_id"])})))
        ppl_flower["username"] = bot22
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        s22_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(s23[0]["_id"])})))
        ppl_flower["username"] = bot23
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        s23_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.posts.find({"userId":str(s24[0]["_id"])})))
        ppl_flower["username"] = bot24
        df_sorted = ppl_flower.sort_values(by='createdAt', ascending=False)
        s24_latest = df_sorted.head(2)
    except Exception as e:
        print("An error occurred:", e)
        
        
    try:
        dfs = [one_latest, two_latest, three_latest, four_latest, five_latest, six_latest, seven_latest, eight_latest, nine_latest, ten_latest, ele_latest, twe_latest, thir_latest, fou_latest, fif_latest, s16_latest, s17_latest, s18_latest, s19_latest, s20_latest, s21_latest, s22_latest, s23_latest, s24_latest]
        dfs_defined = [df for df in dfs if df is not None] 
        
        print("Booooooooooooooots  Pooooooosts")
        print(len(one_latest))
        print(len(two_latest))
        print(len(three_latest))
        print(len(four_latest))
        print(len(five_latest))
        print(len(six_latest))
        print(len(seven_latest))
        print(len(eight_latest))
        print(len(nine_latest))
        print(len(ten_latest))
        print(len(ele_latest))
        print(len(twe_latest))
        print(len(thir_latest))
        print(len(fou_latest))
        print(len(fif_latest))
        print(len(s16_latest))
        print(len(s17_latest))
        print(len(s18_latest))
        print(len(s19_latest))
        print(len(s20_latest))
        print(len(s21_latest))
        print(len(s22_latest))
        print(len(s23_latest))
        print(len(s24_latest))

        if dfs_defined:
            concatenated_df = pd.concat(dfs_defined)
            concatenated_df.reset_index(drop=True, inplace=True)
            concatenated_df['index'] = concatenated_df.reset_index().index + 1
            print(concatenated_df.columns)
            print(len(concatenated_df))
            if len(concatenated_df) > 0:
                
                concatenated_df = concatenated_df.sort_values(by='createdAt', ascending=False)
                concatenated_df.set_index('createdAt', inplace=True)
                concatenated_df.index = concatenated_df.index.tz_localize(pytz.utc).tz_convert(eastern)
                concatenated_df.reset_index(inplace=True)
        
                latest_updates = concatenated_df.groupby('username').tail(5)
                latest_updates['MD'] = latest_updates['createdAt'].dt.strftime('%Y-%m-%dT%H:%M')
                latest_updates = latest_updates.rename(columns={"MD":"Time"})
                latest_updates = latest_updates.head(15)
                fig = px.bar(latest_updates, x='Time', y='index', color='username', barmode='group', title='The most recent posts')
                graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
                return graphJSON
            else:
                return ""
    except Exception as e:
        print("An error occurred:", e) 
        return ""
    
        
@blueprint.route('/BotsTotalLikedComentsRoute', methods=['GET', 'POST'])
def BotsTotalLikedComentsRoute():
    one = db.users.find({'username': bot1})
    two = db.users.find({'username': bot2})
    three = db.users.find({'username': bot3})
    four = db.users.find({'username': bot4})
    five = db.users.find({'username': bot5})
    six = db.users.find({'username': bot6})
    seven = db.users.find({'username': bot7})
    eight = db.users.find({'username': bot8})
    nine = db.users.find({'username': bot9})
    ten = db.users.find({'username': bot10})
    ele = db.users.find({'username': bot11})
    twe = db.users.find({'username': bot12})
    thir = db.users.find({'username': bot13})
    fou = db.users.find({'username': bot14})
    fif = db.users.find({'username': bot15})
    s16 = db.users.find({'username': bot16})
    s17 = db.users.find({'username': bot17})
    s18 = db.users.find({'username': bot18})
    s19 = db.users.find({'username': bot19})
    s20 = db.users.find({'username': bot20})
    s21 = db.users.find({'username': bot21})
    s22 = db.users.find({'username': bot22})
    s23 = db.users.find({'username': bot23})
    s24 = db.users.find({'username': bot24})
    
    one_latest = pd.DataFrame()
    two_latest = pd.DataFrame()
    three_latest = pd.DataFrame()
    four_latest = pd.DataFrame()
    five_latest = pd.DataFrame()
    six_latest = pd.DataFrame()
    seven_latest = pd.DataFrame()
    eight_latest = pd.DataFrame()
    nine_latest = pd.DataFrame()
    ten_latest = pd.DataFrame()
    ele_latest = pd.DataFrame()
    twe_latest = pd.DataFrame()
    thir_latest = pd.DataFrame()
    fou_latest = pd.DataFrame()
    fif_latest = pd.DataFrame()
    s16_latest = pd.DataFrame()
    s17_latest = pd.DataFrame()
    s18_latest = pd.DataFrame()
    s19_latest = pd.DataFrame()
    s20_latest = pd.DataFrame()
    s21_latest = pd.DataFrame()
    s22_latest = pd.DataFrame()
    s23_latest = pd.DataFrame()
    s24_latest = pd.DataFrame()
    
    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":one[0]["_id"]})))
        ppl_flower["username"] = bot1
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        one_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":two[0]["_id"]})))
        ppl_flower["username"] = bot2
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        two_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":three[0]["_id"]})))
        ppl_flower["username"] = bot3
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        three_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":four[0]["_id"]})))
        ppl_flower["username"] = bot4
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        four_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":five[0]["_id"]})))
        ppl_flower["username"] = bot5
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        five_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":six[0]["_id"]})))
        ppl_flower["username"] = bot6
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        six_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
        
        
    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":seven[0]["_id"]})))
        ppl_flower["username"] = bot7
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        seven_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":eight[0]["_id"]})))
        ppl_flower["username"] = bot8
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        eight_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":nine[0]["_id"]})))
        ppl_flower["username"] = bot9
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        nine_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":ten[0]["_id"]})))
        ppl_flower["username"] = bot10
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        ten_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":ele[0]["_id"]})))
        ppl_flower["username"] = bot11
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        ele_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":twe[0]["_id"]})))
        ppl_flower["username"] = bot12
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        twe_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
        
    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":thir[0]["_id"]})))
        ppl_flower["username"] = bot13
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        thir_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":fou[0]["_id"]})))
        ppl_flower["username"] = bot14
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        fou_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":fif[0]["_id"]})))
        ppl_flower["username"] = bot15
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        fif_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
        
        
    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":s16[0]["_id"]})))
        ppl_flower["username"] = bot16
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s16_latest = df_sorted.head(1)
    except Exception as e:
        print("Check An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":s17[0]["_id"]})))
        ppl_flower["username"] = bot17
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s17_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":s18[0]["_id"]})))
        ppl_flower["username"] = bot18
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s18_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":s19[0]["_id"]})))
        ppl_flower["username"] = bot19
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s19_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":s20[0]["_id"]})))
        ppl_flower["username"] = bot20
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s20_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":s21[0]["_id"]})))
        ppl_flower["username"] = bot21
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s21_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
        
    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":s22[0]["_id"]})))
        ppl_flower["username"] = bot22
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s22_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":s23[0]["_id"]})))
        ppl_flower["username"] = bot23
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s23_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.commentlikes.find({"userId":s24[0]["_id"]})))
        ppl_flower["username"] = bot24
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s24_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
        
        
        
        
    try:
        dfs = [one_latest, two_latest, three_latest, four_latest, five_latest, six_latest, seven_latest, eight_latest, nine_latest, ten_latest, ele_latest, twe_latest, thir_latest, fou_latest, fif_latest, s16_latest, s17_latest, s18_latest, s19_latest, s20_latest, s21_latest, s22_latest, s23_latest, s24_latest]
        dfs_defined = [df for df in dfs if df is not None] 

        if dfs_defined:
            concatenated_df = pd.concat(dfs_defined)
            concatenated_df.reset_index(drop=True, inplace=True)
            concatenated_df['index'] = concatenated_df.reset_index().index + 1
            print(len(concatenated_df))
            if len(concatenated_df) > 0:
                print("Check")
                print(concatenated_df.columns)
                concatenated_df = concatenated_df.sort_values(by='updatedAt', ascending=False)
                concatenated_df.set_index('updatedAt', inplace=True)
                concatenated_df.index = concatenated_df.index.tz_localize(pytz.utc).tz_convert(eastern)
                concatenated_df.reset_index(inplace=True)
        
                latest_updates = concatenated_df.groupby('username').tail(5)
                latest_updates['MD'] = latest_updates['updatedAt'].dt.strftime('%Y-%m-%dT%H:%M')
                latest_updates = latest_updates.rename(columns={"MD":"Time"})
                latest_updates = latest_updates.head(15)
                fig = px.bar(latest_updates, x='Time', y='index', color='username', barmode='group', title='The most recent likes on comments')
                
                graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
                return graphJSON
            else:
                return ""
    except Exception as e:
        print("An error occurred:", e)
        return ""


@blueprint.route('/BotsTotalLikedPostsRoute', methods=['GET', 'POST'])
def BotsTotalLikedPostsRoute():
    one = db.users.find({'username': bot1})
    two = db.users.find({'username': bot2})
    three = db.users.find({'username': bot3})
    four = db.users.find({'username': bot4})
    five = db.users.find({'username': bot5})
    six = db.users.find({'username': bot6})
    seven = db.users.find({'username': bot7})
    eight = db.users.find({'username': bot8})
    nine = db.users.find({'username': bot9})
    ten = db.users.find({'username': bot10})
    ele = db.users.find({'username': bot11})
    twe = db.users.find({'username': bot12})
    thir = db.users.find({'username': bot13})
    fou = db.users.find({'username': bot14})
    fif = db.users.find({'username': bot15})
    s16 = db.users.find({'username': bot16})
    s17 = db.users.find({'username': bot17})
    s18 = db.users.find({'username': bot18})
    s19 = db.users.find({'username': bot19})
    s20 = db.users.find({'username': bot20})
    s21 = db.users.find({'username': bot21})
    s22 = db.users.find({'username': bot22})
    s23 = db.users.find({'username': bot23})
    s24 = db.users.find({'username': bot24})
    
    one_latest = pd.DataFrame()
    two_latest = pd.DataFrame()
    three_latest = pd.DataFrame()
    four_latest = pd.DataFrame()
    five_latest = pd.DataFrame()
    six_latest = pd.DataFrame()
    seven_latest = pd.DataFrame()
    eight_latest = pd.DataFrame()
    nine_latest = pd.DataFrame()
    ten_latest = pd.DataFrame()
    ele_latest = pd.DataFrame()
    twe_latest = pd.DataFrame()
    thir_latest = pd.DataFrame()
    fou_latest = pd.DataFrame()
    fif_latest = pd.DataFrame()
    s16_latest = pd.DataFrame()
    s17_latest = pd.DataFrame()
    s18_latest = pd.DataFrame()
    s19_latest = pd.DataFrame()
    s20_latest = pd.DataFrame()
    s21_latest = pd.DataFrame()
    s22_latest = pd.DataFrame()
    s23_latest = pd.DataFrame()
    s24_latest = pd.DataFrame()
    
    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":one[0]["_id"]})))
        ppl_flower["username"] = bot1
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        one_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":two[0]["_id"]})))
        ppl_flower["username"] = bot2
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        two_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":three[0]["_id"]})))
        ppl_flower["username"] = bot3
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        three_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":four[0]["_id"]})))
        ppl_flower["username"] = bot4
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        four_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":five[0]["_id"]})))
        ppl_flower["username"] = bot5
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        five_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":six[0]["_id"]})))
        ppl_flower["username"] = bot6
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        six_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
        
        
    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":seven[0]["_id"]})))
        ppl_flower["username"] = bot7
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        seven_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":eight[0]["_id"]})))
        ppl_flower["username"] = bot8
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        eight_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":nine[0]["_id"]})))
        ppl_flower["username"] = bot9
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        nine_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":ten[0]["_id"]})))
        ppl_flower["username"] = bot10
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        ten_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":ele[0]["_id"]})))
        ppl_flower["username"] = bot11
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        ele_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":twe[0]["_id"]})))
        ppl_flower["username"] = bot12
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        twe_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
        
    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":thir[0]["_id"]})))
        ppl_flower["username"] = bot13
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        thir_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":fou[0]["_id"]})))
        ppl_flower["username"] = bot14
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        fou_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":fif[0]["_id"]})))
        ppl_flower["username"] = bot15
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        fif_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
        
        
        
        
    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":s16[0]["_id"]})))
        ppl_flower["username"] = bot16
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s16_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
    
    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":s17[0]["_id"]})))
        ppl_flower["username"] = bot17
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s17_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":s18[0]["_id"]})))
        ppl_flower["username"] = bot18
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s18_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":s19[0]["_id"]})))
        ppl_flower["username"] = bot19
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s19_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":s20[0]["_id"]})))
        ppl_flower["username"] = bot20
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s20_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":s21[0]["_id"]})))
        ppl_flower["username"] = bot21
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s21_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
        
    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":s22[0]["_id"]})))
        ppl_flower["username"] = bot22
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s22_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":s23[0]["_id"]})))
        ppl_flower["username"] = bot23
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s23_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)

    try:
        ppl_flower = pd.DataFrame(list(db.postlikes.find({"userId":s24[0]["_id"]})))
        ppl_flower["username"] = bot24
        df_sorted = ppl_flower.sort_values(by='updatedAt', ascending=False)
        s24_latest = df_sorted.head(1)
    except Exception as e:
        print("An error occurred:", e)
    
        
    try:
        dfs = [one_latest, two_latest, three_latest, four_latest, five_latest, six_latest, seven_latest, eight_latest, nine_latest, ten_latest, ele_latest, twe_latest, thir_latest, fou_latest, fif_latest, s16_latest, s17_latest, s18_latest, s19_latest, s20_latest, s21_latest, s22_latest, s23_latest, s24_latest]
        dfs_defined = [df for df in dfs if df is not None] 

        if dfs_defined:
            concatenated_df = pd.concat(dfs_defined)
            concatenated_df.reset_index(drop=True, inplace=True)
            concatenated_df['index'] = concatenated_df.reset_index().index + 1
            print(len(concatenated_df))
            if len(concatenated_df) > 0:
                print(concatenated_df.columns)
                concatenated_df = concatenated_df.sort_values(by='updatedAt', ascending=False)
                concatenated_df.set_index('updatedAt', inplace=True)
                concatenated_df.index = concatenated_df.index.tz_localize(pytz.utc).tz_convert(eastern)
                concatenated_df.reset_index(inplace=True)
        
                latest_updates = concatenated_df.groupby('username').tail(5)
                latest_updates['MD'] = latest_updates['updatedAt'].dt.strftime('%Y-%m-%dT%H:%M')
                latest_updates = latest_updates.rename(columns={"MD":"Time"})
                latest_updates = latest_updates.head(15)
                fig = px.bar(latest_updates, x='Time', y='index', color='username', barmode='group', title='The most recent likes on posts')
                graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
                return graphJSON
            else:
                return ""
        
    except Exception as e:
        print("An error occurred:", e) 
        return ""   
    

@blueprint.route("/runsimulation", methods=["POST"])
def runsimulation():
    print("runsimulation endpoint hit")  # Debugging line
    try:
        # Get topic from request
        data = request.get_json()
        print("Received data:", data) 

        topic = data.get('topic', '')
        model = data.get('model', '')
        num_of_loops = int(data.get('num_of_loops', ''))
        
        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        if not model:
            return jsonify({"error": "Model is required"}), 400

        if not num_of_loops:
            return jsonify({"error": "Number of posts is required"}), 400
        
        print(f"Topic: {topic}, Model: {model}, Loops: {num_of_loops}")

        # Get the path to the .env file
        env_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env')

        # Load the .env file
        load_dotenv(dotenv_path=env_path)

        # Set a new topic
        set_key(env_path, 'topic', topic)
        set_key(env_path, 'model', model)
        set_key(env_path, 'num_of_loops', str(num_of_loops))
        num_of_agents = int(os.getenv('num_of_agents',5))

        print(num_of_agents)
        # Run Scheduler Experiment
        try:
            env_directory = os.path.join(os.path.dirname(__file__), '..', '..', '..')
            subprocess.run(["make", "run_schedular_experiment"], check=True, cwd=env_directory)
        except subprocess.CalledProcessError as e:
            print(f"Subprocess error: {e}")
            return jsonify({"error": f"Subprocess failed: {e}"}), 500

        return jsonify({"message": "Simulation completed!"}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Step failed: {str(e)}"}), 500

@blueprint.route("/generatenetworks", methods=["POST"])
def generatenetworks():
    try:

        # Get topic from request
        data = request.get_json()
        num_of_agents = int(data.get('num_of_agents', ''))

          # Get the path to the .env file
        env_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env')

        # Load the .env file
        load_dotenv(dotenv_path=env_path)
        print(num_of_agents)
        set_key(env_path, 'num_of_agents', str(num_of_agents))
        #subprocess.run(["bash", "-c", f"num_of_agents={num_of_agents}"], check=True, cwd="..")
        # Step 1: Clear Database
        subprocess.run(["make", "cleardb"], check=True, cwd='..')

        # Step 2: Generate Networks
        subprocess.run(["bash", "-c", f"num_of_agents={num_of_agents} && make generate_networks"], check=True, cwd="..")

        return jsonify({"message": "Network generated!"}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Step failed: {str(e)}"}), 500