#!/usr/bin/env python3

import argparse
import datetime
import logging
import os
import random

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
        'analytics': [
            {
                'id': 'FIXTURE_GEORING_01',
                'name': 'FIXTURE_GEORING_01',
                'status': 'Ready',
                'created_on': '2017-07-10T14:49:13.774Z',
                'layers': [
                    {
                        'status': 'Ready',
                        'name': '004CC6139C00001E',
                        'processing_started_on': '2017-06-23T14:59:33.654Z',
                        'operation': 'georing',
                        'processing_ended_on': '2017-06-23T15:00:01.333Z',
                        'geoserver_id': '559f69ad1b584fec99b2e92751f2265a.TIF',
                        'id': '559f69ad1b584fec99b2e92751f2265a'
                    },
                    {
                        'status': 'Ready',
                        'name': '004CC6139C000007',
                        'processing_started_on': '2017-06-23T14:59:30.333Z',
                        'operation': 'georing',
                        'processing_ended_on': '2017-06-23T15:00:03.783Z',
                        'geoserver_id': 'd851330ba8d045e8a1ae0f341e82e3a9.TIF',
                        'id': 'd851330ba8d045e8a1ae0f341e82e3a9'
                    },
                    {
                        'status': 'Ready',
                        'name': '004CC6139C000010',
                        'processing_started_on': '2017-06-23T14:59:31.784Z',
                        'operation': 'georing',
                        'processing_ended_on': '2017-06-23T15:00:08.940Z',
                        'geoserver_id': '71c97f4497aa4a29958d6140e4cbbe40.TIF',
                        'id': '71c97f4497aa4a29958d6140e4cbbe40'
                    },
                    {
                        'status': 'Ready',
                        'name': '004CC6139C00001C',
                        'processing_started_on': '2017-06-23T14:59:32Z',
                        'operation': 'georing',
                        'processing_ended_on': '2017-06-23T14:59:54Z',
                        'geoserver_id': 'b7784d9372a14578810af64ed45e8edd.TIF',
                        'id': 'b7784d9372a14578810af64ed45e8edd'
                    },
                ],
            },
            {
                'id': 'FIXTURE_GEORING_02',
                'name': 'FIXTURE_GEORING_02',
                'status': 'Pending',
                'created_on': '2017-07-10T14:49:13.774Z',
                'layers': [
                    {
                        'status': 'Pending',
                        'name': 'ED4173B63293C',
                        'processing_started_on': None,
                        'operation': 'georing',
                        'processing_ended_on': None,
                        'geoserver_id': '',
                        'id': '1ec9ed90712948d184309874f08e2902',
                    }
                ],
            },
            {
                'id': 'FIXTURE_GEORING_03',
                'name': 'FIXTURE_GEORING_03',
                'status': 'Processing',
                'created_on': '2017-07-10T15:07:38.612Z',
                'layers': [
                    {
                        'status': 'Ready',
                        'name': os.urandom(10).hex().upper()[0:13],
                        'processing_started_on': '2017-07-10T11:10:00Z',
                        'operation': 'georing',
                        'processing_ended_on': '2017-07-10T11:13:00Z',
                        'geoserver_id': '',
                        'id': '7eda82118717435b81f4df441d9a6cd0',
                    },
                    {
                        'status': 'Ready',
                        'name': os.urandom(10).hex().upper()[0:13],
                        'processing_started_on': '2017-07-10T11:10:00Z',
                        'operation': 'georing',
                        'processing_ended_on': '2017-07-10T11:13:00Z',
                        'geoserver_id': '',
                        'id': 'd279e5cd02f74ddca62276bf61f4ff0a',
                    },
                    {
                        'status': 'Ready',
                        'name': os.urandom(10).hex().upper()[0:13],
                        'processing_started_on': '2017-07-10T11:10:00Z',
                        'operation': 'georing',
                        'processing_ended_on': '2017-07-10T11:13:00Z',
                        'geoserver_id': '',
                        'id': 'f6309807f2c946bfafb272b47549f640',
                    },
                    {
                        'status': 'Processing',
                        'name': os.urandom(10).hex().upper()[0:13],
                        'processing_started_on': '2017-07-10T11:10:00Z',
                        'operation': 'georing',
                        'processing_ended_on': None,
                        'geoserver_id': '',
                        'id': '025901bcbf3946f484aea55b664a35a9',
                    },
                    {
                        'status': 'Processing',
                        'name': os.urandom(10).hex().upper()[0:13],
                        'processing_started_on': '2017-07-10T11:10:00Z',
                        'operation': 'georing',
                        'processing_ended_on': None,
                        'geoserver_id': '',
                        'id': 'edcb9bf255eb424ca3ad4ebc08cebff9',
                    }
                ],
            },
            {
                'id': 'FIXTURE_VIEWSHED_04',
                'name': 'FIXTURE_VIEWSHED_04',
                'status': 'Pending',
                'created_on': '2017-07-10T14:49:13.774Z',
                'layers': [
                    {
                        'status': 'Pending',
                        'name': 'VS_30.123_30.456',
                        'processing_started_on': None,
                        'operation': 'viewshed',
                        'processing_ended_on': None,
                        'geoserver_id': '',
                        'id': '1ec9ed90712948d184309874f08e2902',
                    }
                ],
            },
        ],
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


def _create_timestamp(min_seconds=5, max_seconds=3000):
    return (datetime.datetime.utcnow() -
            datetime.timedelta(seconds=random.randint(min_seconds, max_seconds))).isoformat() + 'Z'


def _logged_in():
    return request.get_cookie('mock_session', secret=SECRET_KEY) is not None


if __name__ == '__main__':
    main()
