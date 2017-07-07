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

    run(host=opts.host, port=opts.port, debug=True, reloader=True)


@route('/api/analytics')
def list_analytics():
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}
    return {
        'analytics': [],
    }


@route('/api/georing/files')
def list_georing_files():
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}
    return {
        'files': [],
    }


@route('/api/georing/aggregates')
def list_georing_aggregates():
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}
    return {
        'aggregates': [],
        'total_count': 0,
        'criteria': {
            'file_name': '',
            'identifier': '',
            'min_date': None,
            'max_date': None,
        },
    }


@route('/auth/login')
def login():
    return """
        <h1>fake-geoaxis</h1>
        <p>
            In a production environment, this endpoint would redirect to GeoAxis'
            OAuth 2 authorization page where the user would input credentials.
        </p>
        <ul>
            <li><a href="/auth/login/callback">/auth/login/callback</a></li>
            <li><a href="/auth/logout">/auth/logout</a></li>
            <li><a href="/auth/whoami">/auth/whoami</a></li>
        </ul>

        <h2>Cookie Values</h2>
        <pre>mock_session = {session}\ncsrf_token = {csrf_token}</pre>
    """.format(
        session=request.get_cookie('mock_session'),
        csrf_token=request.get_cookie('csrf_token')
    )


@route('/auth/login/callback')
def login_callback():
    response.set_cookie('mock_session', os.urandom(8), secret=SECRET_KEY, path='/', httponly=True, max_age=3600)
    response.set_cookie('csrf_token', os.urandom(8).hex(), path='/')
    return redirect('/')


@route('/auth/logout')
def logout():
    response.delete_cookie('mock_session', path='/', httponly=True)
    response.delete_cookie('csrf_token', path='/')
    return redirect('/')


@route('/')
@route('/auth/whoami')
def whoami():
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}
    return {
        'user': {
            'id': 'carol_cartographer',
            'name': 'Carol Cartographer',
        },
    }


def _logged_in():
    return request.get_cookie('mock_session', secret=SECRET_KEY) is not None


if __name__ == '__main__':
    main()
