from flask import Flask, render_template, session
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.security import Security, SQLAlchemyUserDatastore
import os  
import json
from flask_mail import Mail


# Create the app and configuration
# Read the configuration file
app = Flask(__name__)
app.config.from_object('application.default_settings')
app.config.from_envvar('PRODUCTION_SETTINGS', silent=True)



mail = Mail(app)

# Connect to database with sqlalchemy.
db = SQLAlchemy(app)


from application.models import User, Role
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore)



# Create a user to test with
@app.before_first_request
def create_user():
	db_uri = app.config['SQLALCHEMY_DATABASE_URI']
	db_file_uri = db_uri.split("sqlite:////")[1]
	if not os.path.isfile(db_file_uri):
		print "making new db"
		db.create_all()
		user_datastore.create_user(email='test@test.com', password='test')
		db.session.commit()


def get_task_defs():
	task_defs_obj = read_all_json_configs(app.config['TASK_DESCS_URI'])
	task_defs_list_lol = [ task_defs_obj[k]["task_defs"] for k in range(0, len(task_defs_obj))]
	task_defs_list = [y for x in task_defs_list_lol for y in x]

	data_uris = get_data_uris()
	updated_task_defs_list = join_tasks_with_uris(task_defs_list, data_uris)
	return updated_task_defs_list
	
def get_usermaps():
	tmp = read_all_json_configs(app.config['USERMAPS'])
	tmp1 = [ tmp[k]["users"] for k in range(0, len(tmp))]
	users_list = [y for x in tmp1 for y in x]
	return users_list

def get_data_uris():
	with open (app.config['DATA_SOURCE_URIS']) as tmpfile:
		tmpdata=json.loads(tmpfile.read())
		return tmpdata

def join_tasks_with_uris(task_defs, data_uris):
    updated_task_defs = []
    for task in task_defs:
        task.update(data_uri=data_uris[task["data_source_name"]])
        updated_task_defs.append(task)
    return updated_task_defs

def read_all_json_configs(tmppath):
	all_configs = []
	for root, directories, filenames in os.walk(tmppath):
		for filename in filenames: 
			with open (os.path.join(root,filename)) as tmpfile:
				tmpdata=json.loads(tmpfile.read())
				all_configs.append(tmpdata)
	return all_configs

task_defs = get_task_defs()
usermaps = get_usermaps()

import application.manager
