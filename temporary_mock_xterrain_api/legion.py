import datetime as dt
import json
import logging
import os
import urllib.parse
import re
import xml.etree.ElementTree as et

import requests


LEGION_SCHEME = os.getenv('LEGION_SCHEME', 'http')
LEGION_HOST = os.getenv('LEGION_HOST')
LEGION_TOKEN = os.getenv('LEGION_TOKEN')
LEGION_CACHE_DIR = os.getenv('LEGION_CACHE_DIR', os.path.join(os.path.dirname(__file__), 'cache'))

READ_SIZE = 8192

FORMAT_KML     = 'KML'
FORMAT_GEOTIFF = 'GEOTIFF'
FORMAT_PNG     = 'PNG'


_log = logging.getLogger(__name__)


def execute(operation, source, format_, params, context=None):
    """
    :type operation: unicode
    :type source: unicode
    :type format_: unicode
    :type params: dict
    :type context: unicode
    :rtype: unicode
    """

    _check_settings()

    serialized_params = ','.join(':'.join([k, str(v)]) for k, v in sorted(params.items()))

    cachefile_path = _create_filepath(operation, source, format_, serialized_params)

    if os.path.exists(cachefile_path):
        _log.info('[%s] Read "%s" from cache', context, os.path.basename(cachefile_path))
        return cachefile_path

    url = '{}://{}/legion?{}'.format(
        LEGION_SCHEME,
        LEGION_HOST,
        urllib.parse.urlencode({
            'REQUEST': 'Execute',
            'FORMAT': format_,
            'DataSource': source,
            'Operation': operation,
            'Parameters': serialized_params,
            'token': LEGION_TOKEN,
        }),
    )

    _log.info('[%s] Execute "%s"', context, url)

    try:
        response = requests.get(url, stream=True)
    except requests.ConnectionError as err:
        _log.error('[%s] Legion is unreachable'
                   '---\n\n'
                   'Error: %s\n\n'
                   'URL: %s\n\n'
                   '---',
                   context, err, url)
        raise Error('Legion is unreachable: {}'.format(err))

    if not response.ok:
        _log.error('[%s] Execution failed: Legion returned HTTP %s:\n'
                   '---\n'
                   'Response: %s\n'
                   '---',
                   context, response.status_code, response.text)
        raise ExecutionFailed(response)

    with open(cachefile_path, 'wb') as f:
        for chunk in response.iter_content(READ_SIZE):
            f.write(chunk)

    return cachefile_path


def get_sources():
    _check_settings()

    url = '{}://{}/legion?{}'.format(
        LEGION_SCHEME,
        LEGION_HOST,
        urllib.parse.urlencode({
            'REQUEST': 'DataSources',
            'FORMAT': 'JSON',
            'token': LEGION_TOKEN,
        }),
    )

    cachefile_path = os.path.join(LEGION_CACHE_DIR, 'DATASOURCES_{:%Y%m%d}.JSON'.format(dt.datetime.utcnow()))
    if os.path.exists(cachefile_path):
        _log.info('Read "%s" from cache', os.path.basename(cachefile_path))
        with open(cachefile_path) as f:
            return json.load(f)

    _log.info('Looking up available datasources via "%s"', url)
    try:
        response = requests.get(url)
    except requests.ConnectionError as err:
        _log.error('Legion is unreachable'
                   '---\n\n'
                   'Error: %s\n\n'
                   '---', err)
        raise Error('Legion is unreachable: {}'.format(err))

    if not response.ok:
        _log.error('Could not look up datasources: Legion returned HTTP %s:\n'
                   '---\n'
                   'Response: %s\n'
                   '---',
                   response.status_code, response.text)
        raise Error('Legion returned HTTP {}'.format(response.status_code))

    sources = []
    try:
        for descriptor in response.json()['DataSources']:
            sources.append({
                'id':           descriptor['label'],
                'name':         descriptor['label'].upper().replace('_', ' '),
                'description':  descriptor['description'],
                'bbox':         [float(s.strip()) for s in descriptor['bbox'].split(',')],
                'group_id':     descriptor['subtype'],
                'last_checked': dt.datetime.utcnow().isoformat() + 'Z',
            })
    except KeyError:
        _log.error('Legion returned malformed datasource listing:\n'
                   '---\n'
                   'Response: %s\n'
                   '---',
                   response.text)
        raise Error('malformed response')

    with open(cachefile_path, 'w') as f:
        json.dump(sources, f, indent=4)

    return sources


def get_source_footprint(source):
    url = '{}://{}/legion?{}'.format(
        LEGION_SCHEME,
        LEGION_HOST,
        urllib.parse.urlencode({
            'REQUEST': 'Footprint',
            'DATASOURCE': source,
            'token': LEGION_TOKEN,
        }),
    )

    cachefile_path = os.path.join(LEGION_CACHE_DIR, 'DATASOURCE_FOOTPRINT_{}.JSON'.format(source))
    if os.path.exists(cachefile_path):
        _log.info('Read "%s" from cache', os.path.basename(cachefile_path))
        with open(cachefile_path) as f:
            return json.load(f)

    _log.info('Fetching footprint for datasource "%s" via "%s"', source, url)
    try:
        response = requests.get(url)
    except requests.ConnectionError as err:
        _log.error('Legion is unreachable'
                   '---\n\n'
                   'Error: %s\n\n'
                   '---', err)
        raise Error('Legion is unreachable: {}'.format(err))

    if not response.ok:
        _log.error('Lookup failed: Legion returned HTTP %s:\n'
                   '---\n'
                   'Response: %s\n'
                   '---',
                   response.status_code, response.text)
        raise Error('Legion returned HTTP {}'.format(response.status_code))

    xmlns = {
        'kml': 'http://www.opengis.net/kml/2.2',
    }

    doc = et.fromstring(response.text)

    properties = None
    for d in get_sources():
        if d['id'] == source:
            properties = d

    coordinates = []
    for node in doc.findall('.//kml:LinearRing/kml:coordinates', xmlns):
        coordinates.append([[float(coord) for coord in pairs.split(',')] for pairs in node.text.strip().split()])

    feature = {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': coordinates,
        },
        'properties': properties,
    }

    with open(cachefile_path, 'w') as f:
        json.dump(feature, f, indent=4)

    return feature


class Error(Exception):
    pass


class ExecutionFailed(Error):
    def __init__(self, response):
        super(Error, self).__init__('execution failed with HTTP {}'.format(response.status_code))
        self.status = response.status_code
        self.body = response.text


#
# Helpers
#


def _check_settings():
    errors = []

    for key in ('LEGION_CACHE_DIR',
                'LEGION_HOST',
                'LEGION_SCHEME',
                'LEGION_TOKEN'):
        if not globals().get(key, None):
            errors.append('{} cannot be blank'.format(key))

    if not os.path.isdir(LEGION_CACHE_DIR):
        errors.append('{} is not a directory'.format(LEGION_CACHE_DIR))

    if errors:
        raise Error(''.join(errors))


def _create_filepath(operation, source, format_, params):
    filename = '{operation}___{source}___{params}.{extension}'.format(
        operation=operation, source=source,
        params=re.sub(r'[^\w.]', '_', params.replace(',', '___')),
        extension=re.sub(r'^GEO', '', format_).upper(),
    )
    return os.path.join(LEGION_CACHE_DIR, filename.upper())
