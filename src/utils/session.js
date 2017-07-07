import axios from 'axios'


let _client,
    _onExpired

/**
 * @returns {AxiosInstance} A properly-initialized XHR client
 */
export function getClient() {
    if (!_client) {
        _client = axios.create({
            xsrfCookieName: 'csrf_token',
            xsrfHeaderName: 'X-XSRF-TOKEN',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
            validateStatus(status) {
                if (status === 401 && _onExpired) {
                    _onExpired()
                    _onExpired = null
                }
                return status >= 200 && status < 300
            },
        })
    }

    return _client
}

export function onExpired(func) {
    _onExpired = func
}
