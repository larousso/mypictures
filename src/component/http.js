
const options = {
    credentials: 'include',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};

const getOptions = sessionData => {
    if(sessionData) {
        const cookie = `_sessiondata=${sessionData};`;
        const headers = {cookie, ...options.headers};
        return {headers, credentials: 'include'};
    } else {
        return options;
    }
};

export default {
    get(url, sessionData) {
        return fetch(url, {
            method: 'get',
            ...getOptions(sessionData)
        }).then(rep => rep.json());
    },
    post(url, body) {
        return fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            ...getOptions(sessionData)
        }).then(rep => rep.json());
    },
    postData(url, data, sessionData) {
        let headers = {};
        if(sessionData) {
            headers.cookie = `_sessiondata=${sessionData};`;
        }
        return fetch(url, {
            method: 'post',
            body: data,
            credentials: 'include',
            headers
        })
        .then(rep => rep.json());
    },
    put(url, body, sessionData) {
        return fetch(url, {
            method: 'put',
            body: JSON.stringify(body),
            ...getOptions(sessionData)
        }).then(rep => rep.json());
    },
    delete(url, sessionData){
        return fetch(url, {
            method: 'delete',
            ...getOptions(sessionData)
        }).then(rep => rep.json());
    }
}