from application import app
from flask import render_template, redirect
from application.models import *
from flask.ext.security import login_required
import flask_security.core
from flask import request
import flask.ext.login
from application import db, usermaps, task_defs
from flask import request
import os
import json
import datetime

@app.route('/')
@app.route('/index/')
def index():
    user = flask.ext.login.current_user
    if user.is_authenticated():
        return redirect("/home", code=302)
    else:
        return render_template('info/landing.html', title='Flask-Bootstrap')


@app.route('/home')
@login_required
def home():
    user = flask.ext.login.current_user
    tasks = get_user_tasks(user)
    relevant_task_defs = find_relevant_tasks(tasks)
    print user.email + " : /home"
    return render_template('info/home.html', title='*An', tasks=relevant_task_defs, username=user.email)


@app.route('/annotator/<task_name>')
@login_required
def annotator(task_name):
    tmp = find_relevant_tasks_helper(task_name)
    task_def = tmp[0]
    task_details = task_def['task_details']
    task_type = task_details['type']

    task_to_template_map = {"segmentation":"evan.html", "continuous_annotation":"conan.html"}
    user = flask.ext.login.current_user
    print user.email + " : /annotator/"+task_name

    template_name = task_to_template_map[task_type]
    user = flask.ext.login.current_user
    username = user.email
    return render_template(template_name, task_def=task_def, username=username)











@app.route('/fetch_json_annos')
@login_required
def fetch_json_annos():
    subj = request.args.get('subject')
    videoname = request.args.get('video')
    task_name = request.args.get('task_name')
    annos_obj = read_json_annos(subj, videoname, task_name)

    user = flask.ext.login.current_user
    print user.email + " : /fetch_json_annos : "+task_name+", "+videoname

    return annos_obj
 
def read_json_annos(subj, videoname, task_name):
    data_sink = app.config['DATA_SINK']
    subj_results_dir = os.path.join(data_sink,task_name,subj)
    ensure_dir(subj_results_dir)
    results_file_name = os.path.join(subj_results_dir,videoname+".json")
    if os.path.isfile(results_file_name):
        with open (results_file_name) as tmpfile:
            annos_obj=json.loads(tmpfile.read())
            if not annos_obj.get("annos"):
                annos_obj["annos"]=[]
    else:
        annos_obj = {"video": videoname, "annos":[]}
    print json.dumps(annos_obj)
    return json.dumps(annos_obj)


@app.route('/push_json_annos', methods=['POST'])
@login_required
def push_json_annos():
    subj = request.args.get('subject')
    task_name = request.args.get('task_name')
    my_buffer = request.get_json()
    videoname = my_buffer['video']

    user = flask.ext.login.current_user
    print user.email + " : /fetch_json_annos : "+task_name+", "+videoname

    write_json_annos(subj, videoname, task_name, my_buffer)
    return "Done"


def write_json_annos(subj, videoname, task_name, obj):
    data_sink = app.config['DATA_SINK']
    subj_results_dir = os.path.join(data_sink, task_name, subj)
    ensure_dir(subj_results_dir)
    results_file_name = os.path.join(subj_results_dir,videoname+".json")
    with open(results_file_name, 'w') as outfile:
        json.dump(obj, outfile)









@app.route('/push_csv_annos', methods=['POST'])
@login_required
def push_csv_annos():
    subj = request.args.get('subject')
    task_name = request.args.get('task_name')

    chunk = ""
    tmp=request.get_json();
    mybuffer=tmp["buffer"]
    for obj in mybuffer:
        formattedDate = datetime.datetime.now().strftime("\"%A, %B %d, %Y, %I:%M:%S %p\"")
        chunk_p1 = chunk + formattedDate + ','
        chunk_p2 = chunk_p1 + ','.join([ str(obj[k]) for k in obj.viewkeys()]) + "\n"
        chunk = chunk_p2
        videoname=obj['video']
        dimension=obj['dimension']
    write_csv_chunk(subj,videoname,dimension, task_name, chunk)

    user = flask.ext.login.current_user
    print user.email + " : /push_csv_annos : "+task_name+", "+videoname

    return "success"

def write_csv_chunk(subj, videoname, dimension, task_name, csv):
    data_sink = app.config['DATA_SINK']
    subj_results_dir = os.path.join(data_sink,task_name, subj)
    ensure_dir(subj_results_dir)

    results_file_name = os.path.join(subj_results_dir,videoname + '-' + dimension + ".csv")
    with open(results_file_name, 'a') as outfile:
        outfile.write(csv)

    outfile.close()






def get_user_tasks(user):
    for usermap in usermaps:
        if usermap["email"] == user.email:
            task_list = usermap["tasks"]
            if task_list is None:
                return []
            else:
                return task_list
    return []
    
def find_relevant_tasks_helper(task_name):
    tmp_task_objs = [ t for t in task_defs if t["task_name"] == task_name ]
    return tmp_task_objs

def find_relevant_tasks(task_list):
    task_objs = []
    for task_name in task_list:
        tmp_task_objs = find_relevant_tasks_helper(task_name)
        task_objs += tmp_task_objs
    return task_objs

def ensure_dir(f):
#    d = os.path.dirname(f)
    if not os.path.exists(f):
        os.makedirs(f)



# 404 page not found "route"
@app.errorhandler(404)
def not_found(error):
    title = "404 Page not found"
    return render_template('404.html', title=title), 404


# 500 server error "route"
@app.errorhandler(500)
def server_error(error):
    title = "500 Server Error"
    db.session.rollback()
    return render_template('500.html', title=title), 500
