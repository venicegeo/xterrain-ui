import os

import requests


GEOSERVER_BASE_URL = os.getenv('GEOSERVER_BASE_URL', 'http://localhost:8080/geoserver')
GEOSERVER_USERNAME = os.getenv('GEOSERVER_USERNAME', 'admin')
GEOSERVER_PASSWORD = os.getenv('GEOSERVER_PASSWORD', 'geoserver')


def create_workspace(name):
    client = _get_client()

    try:
        response = client.post('{}/rest/workspaces'.format(GEOSERVER_BASE_URL),
                               json={'workspace': {'name': name}})
    except requests.ConnectionError:
        raise Unreachable()

    if response.status_code != 201:
        if response.status_code == 500 and 'already exists' in response.text:
            raise ObjectExists('workspace', name)

        raise ServerError(response)


def workspace_exists(name):
    client = _get_client()

    try:
        response = client.get('{}/rest/workspaces/{}?quietOnNotFound=true'.format(GEOSERVER_BASE_URL, name))
    except requests.ConnectionError:
        raise Unreachable()

    if response.status_code not in (200, 404):
        raise ServerError(response)

    return response.status_code == 200


def publish_geotiff(workspace, file_abspath, title=None):
    client = _get_client()

    file_basename = os.path.basename(file_abspath)
    try:
        response = client.post(
            '{}/rest/workspaces/{}/coveragestores'.format(GEOSERVER_BASE_URL, workspace),
            json={
                'coverageStore': {
                    'enabled': True,
                    'name':    file_basename,
                    'type':    'GeoTIFF',
                    'url':     'file://{}'.format(file_abspath),
                    'workspace': {
                        'name': workspace,
                    },
                },
            })
    except requests.ConnectionError:
        raise Unreachable()

    if response.status_code != 201:
        if response.status_code == 500 and 'already exists' in response.text:
            raise ObjectExists('coveragestore', file_basename)
        raise ServerError(response)

    try:
        response = client.post(
            '{}/rest/workspaces/{}/coveragestores/{}/coverages'.format(GEOSERVER_BASE_URL, workspace, file_basename),
            json={
                'coverage': {
                    'name': file_basename,
                    'title': title or file_basename,
                    'srs': 'EPSG:4326',
                    'nativeFormat': 'GeoTIFF',
                    'workspace': {
                        'name': workspace
                    },
                    'parameters': {
                        'entry': [
                            {
                                'string': [
                                    'InputTransparentColor',
                                    '#000000',
                                ],
                            }
                        ],
                    },
                },
            })
    except requests.ConnectionError:
        raise Unreachable()

    if response.status_code != 201:
        if response.status_code == 500 and 'already exists' in response.text:
            raise ObjectExists('coverage', file_basename)
        raise ServerError(response)

    return file_basename  # Layer ID


def _get_client():
    for key in ('GEOSERVER_BASE_URL', 'GEOSERVER_USERNAME', 'GEOSERVER_PASSWORD'):
        if not globals().get(key, None):
            raise ValueError('In settings, "{}" cannot be blank'.format(key))

    client = requests.Session()
    client.auth = (GEOSERVER_USERNAME, GEOSERVER_PASSWORD)

    return client


class Error(Exception):
    pass


class ServerError(Error):
    def __init__(self, response):
        Error.__init__(self, 'HTTP %d for %s "%s"' % (response.status_code, response.request.method, response.request.url))
        self.response_text = response.text


class Unreachable(Error):
    def __init__(self):
        Error.__init__(self, 'GeoServer is unreachable')


class ObjectExists(Error):
    def __init__(self, item_type, item_name):
        Error.__init__(self, 'GeoServer %s "%s" already exists' % (item_type, item_name))
