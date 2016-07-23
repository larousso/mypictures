import clientConfig from '../clientConfig'

const options = {
    credentials: 'include',
    mode: 'cors',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};

const getOptions = sessionData => {
    if(sessionData) {
        const cookie = `_sessiondata=${sessionData};`;
        const headers = {cookie, ...options.headers};
        return {headers, credentials: 'include', mode: 'cors'};
    } else {
        return options;
    }
};

const buildUrl = (path) => {
    return clientConfig.api.baseUrl + path;
};

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

export default {
    get(url, sessionData) {
        return fetch(buildUrl(url), {
            method: 'get',
            ...getOptions(sessionData)
        })
        .then(handleErrors)
        .then(rep => rep.json());
    },
    post(url, body, sessionData) {
        return this.rawPost(url, body, sessionData).then(rep => rep.json());
    },
    rawPost(url, body, sessionData) {
        const theOptions = getOptions(sessionData);
        console.log('posting {} to {} with {}', body, url, theOptions);
        return fetch(buildUrl(url), {
            method: 'post',
            body: JSON.stringify(body),
            ...theOptions
        })
        .then(handleErrors);
    },
    postData(url, data, sessionData) {
        let headers = {};
        if(sessionData) {
            headers.cookie = `_sessiondata=${sessionData};`;
        }
        return fetch(buildUrl(url), {
            method: 'post',
            body: data,
            credentials: 'include',
            headers
        })
        .then(handleErrors)
        .then(rep => rep.json());
    },
    put(url, body, sessionData) {
        return fetch(buildUrl(url), {
            method: 'put',
            body: JSON.stringify(body),
            ...getOptions(sessionData)
        })
        .then(handleErrors)
        .then(rep => rep.json());
    },
    delete(url, sessionData){
        return fetch(buildUrl(url), {
            method: 'delete',
            ...getOptions(sessionData)
        })
        .then(handleErrors)
        .then(rep => rep.json());
    }
}