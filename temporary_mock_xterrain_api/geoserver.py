import logging
import os

import requests


GEOSERVER_BASE_URL = os.getenv('GEOSERVER_BASE_URL', 'http://localhost:8080/geoserver')
GEOSERVER_USERNAME = os.getenv('GEOSERVER_USERNAME', 'admin')
GEOSERVER_PASSWORD = os.getenv('GEOSERVER_PASSWORD', 'geoserver')


_log = logging.getLogger(__name__)


def create_workspace(name):
    client = _get_client()

    try:
        _log.info('Creating workspace "%s"', name)
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
        _log.debug('Checking if workspace "%s" exists', name)
        response = client.get('{}/rest/workspaces/{}?quietOnNotFound=true'.format(GEOSERVER_BASE_URL, name))
    except requests.ConnectionError:
        raise Unreachable()

    if response.status_code not in (200, 404):
        raise ServerError(response)

    return response.status_code == 200


def publish_geotiff(workspace, file_abspath, title=None, style=None):
    client = _get_client()

    layer_id = os.path.basename(file_abspath)
    try:
        _log.info('Publishing GeoTIFF to GeoServer:\n'
                  '----\n\n'
                  'Workspace: %s\n\n'
                  'Layer ID: %s\n\n'
                  'File Path: %s\n\n'
                  '----', workspace, layer_id, file_abspath)
        response = client.post(
            '{}/rest/workspaces/{}/coveragestores'.format(GEOSERVER_BASE_URL, workspace),
            json={
                'coverageStore': {
                    'enabled': True,
                    'name':    layer_id,
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
            raise ObjectExists('coveragestore', layer_id)
        raise ServerError(response)

    try:
        response = client.post(
            '{}/rest/workspaces/{}/coveragestores/{}/coverages'.format(GEOSERVER_BASE_URL, workspace, layer_id),
            json={
                'coverage': {
                    'name': layer_id,
                    'title': title or layer_id,
                    'srs': 'EPSG:4326',
                    'nativeFormat': 'GeoTIFF',
                    'workspace': {
                        'name': workspace
                    },
                },
            })
    except requests.ConnectionError:
        raise Unreachable()

    if response.status_code != 201:
        if response.status_code == 500 and 'already exists' in response.text:
            raise ObjectExists('coverage', layer_id)
        raise ServerError(response)

    if style:
        set_layer_style(layer_id, style)

    return layer_id


def create_style(name, sld_content):
    client = _get_client()

    try:
        _log.info('Creating style "%s"\n'
                  '----\n\n'
                  'SLD Content:\n\n'
                  '%s\n\n'
                  '----', name, sld_content)
        response = client.post(
            '{}/rest/styles'.format(GEOSERVER_BASE_URL),
            headers={
                'Content-Type': 'application/vnd.ogc.sld+xml',
            },
            params={
                'name': name,
            },
            data=sld_content.strip(),
        )
    except requests.ConnectionError:
        raise Unreachable()

    if response.status_code != 201:
        if response.status_code == 500 and 'already exists' in response.text:
            raise ObjectExists('style', name)
        raise ServerError(response)


def style_exists(name):
    client = _get_client()

    _log.debug('Checking if style "%s" exists', name)
    try:
        response = client.get(
            '{}/rest/styles/{}'.format(GEOSERVER_BASE_URL, name),
            params={
                'quietOnNotFound': True,
            },
        )
    except requests.ConnectionError:
        raise Unreachable()

    if response.status_code not in (200, 404):
        raise ServerError(response)

    return response.status_code == 200


def set_layer_style(layer_id, style):
    client = _get_client()

    _log.info('Setting style "%s" for layer "%s"', style, layer_id)
    try:
        response = client.put(
            '{}/rest/layers/{}.json'.format(GEOSERVER_BASE_URL, layer_id),
            json={
                'layer': {
                    'defaultStyle': style,
                },
            })
    except requests.ConnectionError:
        raise Unreachable()

    if response.status_code != 200:
        raise ServerError(response)


def _get_client():
    """
    :return requests.Session:
    """
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
