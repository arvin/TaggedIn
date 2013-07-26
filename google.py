#!/usr/bin/python
import gflags

import httplib2
import sys

from apiclient.discovery import build
from oauth2client.file import Storage
from oauth2client.client import AccessTokenRefreshError
from oauth2client.client import flow_from_clientsecrets 
from oauth2client.tools import run

FLAGS = gflags.FLAGS

class Google:
  
  def auth(self):
    scope = 'https://www.googleapis.com/auth/calendar.readonly'

    flow = flow_from_clientsecrets(
      'client_secrets.json',
      scope='https://www.googleapis.com/auth/calendar.readonly',
      redirect_uri='http://example.com/auth_return')


    #FLAGS.auth_local_webserver = False

    # Get a storage object in case we want to store creds
    storage = Storage('google_calendar.dat')
    credentials = storage.get()
    if credentials is None or credentials.invalid == True:
      credentials = run(flow, storage)

    print 'this is where I\'m getting to???'
    http = httplib2.Http()
    http = credentials.authorize(http)

    service = build(serviceName='calendar', version='v3', http=http,
        developerKey='AIzaSyCt63-RVJXegq6G-w_qYzHZDWLBSvih5ao')

  def storeCreds(self):
    pass
