#!/usr/bin/env python3

import argparse
import datetime
import logging
import os
import random
import traceback

from bottle import run, request, response, redirect, post, get, static_file

import legion
import geoserver


API_KEY = '1234'
SECRET_KEY = 'secret'

DEFAULT_STYLE_ID = 'binary'

DEFAULT_STYLE_DEFINITION = """
<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
    xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
    xmlns="http://www.opengis.net/sld"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>Viewshed Binary</Name>
    <UserStyle>
      <Title>Viewshed Binary Style</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <ColorMap>
              <ColorMapEntry color="#008000" quantity="0"  opacity="0.0"/>
              <ColorMapEntry color="#00FF00" quantity="1"  opacity="0.50"/>
            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
"""


_analytics = []


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='localhost')
    parser.add_argument('--port', default=3001, type=int)
    opts = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(levelname)-5s %(message)s')

    _initialize_geoserver_workspaces()
    _initialize_geoserver_styles()

    run(host=opts.host, port=opts.port, debug=True, reloader=True)


@get('/api/sources')
def list_sources():
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}

    response.set_header('Cache-Control', 'max-age=86400')

    return {
        'sources': legion.get_sources(),
    }


@get('/api/sources/<source>')
def get_source_footprint(source):
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}

    response.set_header('Cache-Control', 'max-age=86400')

    return legion.get_source_footprint(source)


@post('/api/viewshed/create_analytic')
def create_viewshed():
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}

    try:
        reader = PayloadReader(request.json)
        name            = reader.string('name', min_length=1)
        source          = reader.string('source', min_length=1)
        latitude        = reader.number('latitude', min_value=-90, max_value=90)
        longitude       = reader.number('longitude', min_value=-180, max_value=180)
        target_height   = reader.number('target_height')
        observer_height = reader.number('observer_height', min_value=0)
        outer_radius    = reader.number('outer_radius', min_value=1)
    except PayloadReader.Error as err:
        response.status = 400
        return {'error': 'Invalid payload: {}'.format(err)}

    analytic_id = '{:05}'.format(len(_analytics))
    layer_id = os.urandom(5).hex()

    layer = {
        'id': layer_id,
        'geoserver_id': None,
        'name': 'Viewshed ({} @ {}, {})'.format(source, round(latitude, 3), round(longitude, 3)),
        'operation': 'viewshed',
        'status': 'Ready',
        'processing_started_on': _create_timestamp(),
        'processing_ended_on': None,
    }

    analytic = {
        'id': analytic_id,
        'name': name,
        'status': 'Ready',
        'created_on': _create_timestamp(),
        'layers': [layer],
    }

    try:
        tiff_path = legion.execute(
            operation='LegionViewshedOperation',
            source=source,
            format_='GEOTIFF',
            params={
                'observerCoord': '{longitude}+{latitude}'.format(longitude=longitude, latitude=latitude),
                'observerHeight': observer_height,
                'targetHeight': target_height,
                'outerRadius': outer_radius,
                'normalizeScaleValue': 255,  # This magic number looks like it's required by Legion Core for... reasons?
            },
            context=analytic['id'],
        )

        layer['geoserver_id'] = geoserver.publish_geotiff('viewshed', tiff_path, title=name, style=DEFAULT_STYLE_ID)
    except geoserver.ObjectExists:
        layer['geoserver_id'] = os.path.basename(tiff_path)  # HACK
    except legion.ExecutionFailed as err:
        response.status = err.status
        return {'error': 'Legion execution failed: {}'.format(err)}
    except Exception as err:
        print('!' * 120,
              'Execution Error: {}'.format(err),
              traceback.format_exc(),
              '!' * 120,
              sep='\n\n')
        response.status = 500
        return {'error': 'Unknown error occurred'.format(err)}

    layer['processing_ended_on'] = _create_timestamp()

    _analytics.append(analytic)

    response.status = 201

    return {'analytic': analytic}


@post('/api/connected_viewshed/create_analytic')
def create_connected_viewshed():
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}

    try:
        reader = PayloadReader(request.json)
        name            = reader.string('name', min_length=1)
        source          = reader.string('source', min_length=1)
        linestring      = reader.array('linestring', min_length=2)
        bbox            = reader.array('bbox', min_length=4, max_length=4)
        start_azimuth   = reader.number('start_azimuth', min_value=0, max_value=360)
        end_azimuth     = reader.number('end_azimuth', min_value=0, max_value=360)
        target_height   = reader.number('target_height')
        observer_height = reader.number('observer_height', min_value=0)
        inner_radius    = reader.number('inner_radius', min_value=1)
        outer_radius    = reader.number('outer_radius', min_value=1)
    except PayloadReader.Error as err:
        response.status = 400
        return {'error': 'Invalid payload: {}'.format(err)}

    analytic_id = '{:05}'.format(len(_analytics))
    layer_id = os.urandom(5).hex()

    layer = {
        'id': layer_id,
        'geoserver_id': None,
        'name': 'Connected Viewshed ({} @ {})'.format(source, ', '.join(str(round(n, 2)) for n in bbox)),
        'operation': 'connected_viewshed',
        'status': 'Ready',
        'processing_started_on': _create_timestamp(),
        'processing_ended_on': None,
    }

    analytic = {
        'id': analytic_id,
        'name': name,
        'status': 'Ready',
        'created_on': _create_timestamp(),
        'layers': [layer],
    }

    try:
        tiff_path = legion.execute(
            operation='LegionConnectedViewshedOperation',
            source=source,
            format_='GEOTIFF',
            bbox=','.join(str(n) for n in bbox),
            params={
                'polyline': '+'.join('{longitude}+{latitude}'.format(**p) for p in linestring),
                'startAzimuth': start_azimuth,
                'endAzimuth': end_azimuth,
                'observerHeight': observer_height,
                'targetHeight': target_height,
                'innerRadius': inner_radius,
                'outerRadius': outer_radius,
                'normalize': 'RADIUS',  # This magic string looks like it's required by Legion Core for... reasons?
                'normalizeScaleValue': 255,  # This magic number looks like it's required by Legion Core for... reasons?
            },
            context=analytic['id'],
        )

        layer['geoserver_id'] = geoserver.publish_geotiff('connected_viewshed', tiff_path, title=name, style=DEFAULT_STYLE_ID)
    except geoserver.ObjectExists:
        layer['geoserver_id'] = os.path.basename(tiff_path)  # HACK
    except legion.ExecutionFailed as err:
        response.status = err.status
        return {'error': 'Legion execution failed: {}'.format(err)}
    except Exception as err:
        print('!' * 120,
              'Execution Error: {}'.format(err),
              traceback.format_exc(),
              '!' * 120,
              sep='\n\n')
        response.status = 500
        return {'error': 'Unknown error occurred'.format(err)}

    layer['processing_ended_on'] = _create_timestamp()

    _analytics.append(analytic)

    response.status = 201

    return {'analytic': analytic}


@get('/api/<operation>/downloads/<layer_id>.TIF')
def download_tiff(operation, layer_id):
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}

    layer = None
    for a in _analytics:
        for l in a['layers']:
            if l['id'] == layer_id:
                layer = l
                break

    if not layer:
        response.status = 404
        return {'error': 'Layer "{}" not found'.format(layer_id)}

    return static_file(layer['geoserver_id'], legion.LEGION_CACHE_DIR, mimetype='image/tiff')


@get('/api/analytics')
def list_analytics():
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}

    _extend_session()

    if _analytics:
        return {'analytics': _analytics}

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


@get('/api/georing/files')
def list_georing_files():
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}
    return {
        'files': [
            {
                'id': '1234',
                'name': 'FIXTURE.FILE',
                'size': 999999999,
            }
        ],
    }


@get('/api/georing/aggregates')
def list_georing_aggregates():
    if not _logged_in():
        response.status = 401
        return {'error': 'You are not logged in'}
    return {
        'aggregates': [
            {
                'identifier': 'FIXTURE_IDENT_01',
                'points': [[30, 30], [0, 0], [0, 15], [15, 15]],
                'file_names': ['something.txt'],
                'count': 4,
            },
        ],
        'total_count': 4,
        'criteria': {
            'file_name': request.GET.get('file_name', ''),
            'identifier': request.GET.get('identifier', ''),
            'min_date': request.GET.get('min_date'),
            'max_date': request.GET.get('max_date'),
        },
    }


@post('/api/georing/files')
def index():
    return {
        'file': {
            'id': os.urandom(5).hex(),
            'name': 'wat',
            'size': 12345,
        }
    }


@get('/auth/login')
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


@get('/auth/login/callback')
def login_callback():
    response.set_cookie('mock_session', os.urandom(8), secret=SECRET_KEY, path='/', httponly=True, max_age=3600)
    response.set_cookie('csrf_token', os.urandom(8).hex(), path='/')
    return redirect('/')


@get('/auth/logout')
def logout():
    response.delete_cookie('mock_session', path='/', httponly=True)
    response.delete_cookie('csrf_token', path='/')
    return redirect('/')


@get('/')  # DEBUG
@get('/auth/whoami')
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


def _create_timestamp(min_seconds=0, max_seconds=0):
    return (datetime.datetime.utcnow() -
            datetime.timedelta(seconds=random.randint(min_seconds, max_seconds))).isoformat() + 'Z'


def _extend_session():
    cookie = request.get_cookie('mock_session', secret=SECRET_KEY)
    if not cookie:
        return
    response.set_cookie('mock_session', cookie, secret=SECRET_KEY, path='/', httponly=True, max_age=3600)


def _initialize_geoserver_workspaces():
    for workspace in ('connected_viewshed', 'viewshed', 'georing',):
        if geoserver.workspace_exists(workspace):
            continue
        geoserver.create_workspace(workspace)


def _initialize_geoserver_styles():
    if geoserver.style_exists(DEFAULT_STYLE_ID):
        return
    geoserver.create_style(DEFAULT_STYLE_ID, DEFAULT_STYLE_DEFINITION)


def _logged_in():
    return request.get_cookie('mock_session', secret=SECRET_KEY) is not None\
           or request.auth == (API_KEY, '')


class PayloadReader:
    class Error(Exception):
        pass

    def __init__(self, payload):
        if not isinstance(payload, dict):
            raise self.Error('payload must be a dictionary')
        self._payload = payload

    def _read(self, key, optional):
        value = self._payload.get(key)
        if value is None and not optional:
            raise self.Error('"{}" is not set'.format(key))
        return value

    def array(self, key, min_length=None, max_length=None, optional=False):
        value = self._read(key, optional)

        if not isinstance(value, list):
            raise self.Error('"{}" must be a list'.format(key))

        if min_length is not None and max_length is not None and not min_length <= len(value) <= max_length:
            raise self.Error('"{}" must be a list of between {} and {} items'.format(key, min_length, max_length))

        if min_length is not None and len(value) < min_length:
            raise self.Error('"{}" must be a list of {} or more items'.format(key, min_length))

        if max_length is not None and len(value) > max_length:
            raise self.Error('"{}" must be a list of {} or less items'.format(key, max_length))

        return value

    def string(self, key, min_length=0, max_length=256, optional=False):
        value = self._read(key, optional)

        value = str(value).strip()

        if min_length is not None and max_length is not None and not min_length <= len(value) <= max_length:
            raise self.Error('"{}" must be a string between {} and {} chars in length'.format(key, min_length, max_length))

        return value

    def bool(self, key, optional=False):
        value = self._read(key, optional)

        if not isinstance(value, bool):
            raise self.Error('"{}" must be a boolean'.format(key))

        return value

    def number(self, key, type_=float, min_value=None, max_value=None, optional=False):
        value = self._read(key, optional)

        try:
            value = type_(value)
        except:
            raise self.Error('"{}" is not a valid {}'.format(key, type_.__name__))

        if min_value is not None and max_value is not None and not min_value <= value <= max_value:
            raise self.Error('"{}" must be a {} between {} and {}'.format(key, type_.__name__, min_value, max_value))

        if min_value is not None and value < min_value:
            raise self.Error('"{}" must be a {} gte {}'.format(key, type_.__name__, min_value))

        if max_value is not None and value > max_value:
            raise self.Error('"{}" must be a {} lte {}'.format(key, type_.__name__, max_value))

        return value


if __name__ == '__main__':
    main()
