#!/usr/bin/env python3

import argparse
import logging
import os

from bottle import route, run, request, response, redirect

import legion
import geoserver


SECRET_KEY = 'secret'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='localhost')
    parser.add_argument('--port', default=3001, type=int)
    opts = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(levelname)-5s %(message)s')

    run(host=opts.host, port=opts.port, debug=True)


@route('/api/analytics')
def list_analytics():
    return {
        'analytics': [],
    }


@route('/auth/login')
def login():
    return """
        <h1>Simulating OAuth 2 auth</h1>
        <ul>
            <li><a href="/auth/login/callback">/auth/login/callback</a></li>
            <li><a href="/auth/logout">/auth/logout</a></li>
            <li><a href="/auth/whoami">/auth/whoami</a></li>
        </ul>

        <h2>Session Cookie Value</h2>
        <pre>{cookie}</pre>
    """.format(
        cookie=request.get_cookie('mock_session'),
    )


@route('/auth/login/callback')
def login_callback():
    response.set_cookie('mock_session', os.urandom(8), secret=SECRET_KEY, path='/', httponly=True, max_age=3600)
    return redirect('/auth/whoami')


@route('/auth/logout')
def logout():
    response.delete_cookie('mock_session', path='/', httponly=True)
    return redirect('/auth/login')


@route('/auth/whoami')
def whoami():
    if not request.get_cookie('mock_session'):
        response.status = 401
        return {'error': 'You are not logged in'}
    return {
        'user': {
            'user_id': 'default_user',
            'name': 'DEFAULT_USER',
        },
    }


if __name__ == '__main__':
    main()
