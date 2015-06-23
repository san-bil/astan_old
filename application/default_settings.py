import os
from utils.decrypt_string import decrypt_string
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

MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 465
MAIL_USE_SSL = True
MAIL_USERNAME = 'astan.annotation.app'
hashed_password = open('application/private_settings/hashed_email_password.txt').read()
#substring removes the null terminator that read() appends
print "Enter encryption passphrase to unlock password for app email service."
mail_passwd = decrypt_string(hashed_password[0:-1])
MAIL_PASSWORD = mail_passwd



TASK_DESCS_URI = os.path.join(_basedir, 'tasks/descriptions')
USERMAPS = os.path.join(_basedir, 'tasks/usermaps')
DATA_SOURCE_URIS = os.path.join(_basedir, 'tasks/data_source_uris.json')
DATA_SINK = os.path.join(_basedir, 'data')



