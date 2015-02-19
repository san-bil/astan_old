import os

# Get application base dir.
_basedir = os.path.abspath(os.path.dirname(__file__))

DEBUG = True
RELOAD = True
SECRET_KEY = 'mysecretkeyvalue'
SQLALCHEMY_DATABASE_URI = 'sqlite:////' + os.path.join(_basedir, 'db/app_dev.db')

SECURITY_CONFIRMABLE = False
SECURITY_TRACKABLE = True
SECURITY_POST_LOGIN_VIEW = '/home'
SECURITY_RECOVERABLE = True
SECURITY_CHANGEABLE = True
SECURITY_REGISTERABLE = True
SECURITY_CHANGEABLE = True
SECURITY_CONFIRMABLE = True
SECURITY_EMAIL_SENDER = "*An"
SECURITY_PASSWORD_HASH = 'bcrypt'
SECURITY_PASSWORD_SALT = 'team_astana'

TASK_DESCS_URI = os.path.join(_basedir, 'tasks/descriptions')

USERMAPS = os.path.join(_basedir, 'tasks/usermaps')

DATA_SOURCE_URIS = os.path.join(_basedir, 'tasks/data_source_uris.json')

DATA_SINK = os.path.join(_basedir, 'data')

