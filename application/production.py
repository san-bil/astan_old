import os

DEBUG = False
RELOAD = False
CSRF_ENABLED = True
SECRET_KEY = 'notmysecretkey'
SQLALCHEMY_DATABASE_URI = str(os.environ.get('DATABASE_URL', 'postgresql://localhost/myproddatabase'))


#SECURITY_CONFIRMABLE = False
#SECURITY_TRACKABLE = True
