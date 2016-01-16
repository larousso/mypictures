
const options = {
    credentials: 'include',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};


export default {
    get(url) {
        return fetch(url, {
            method: 'get',
            ...options
        }).then(rep => rep.json());
    },
    post(url, body) {
        return fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            ...options
        }).then(rep => rep.json());
    },
    postData(url, data) {
        return fetch(url, {
            method: 'post',
            body: data,
            credentials: 'include'
        });
    },
    put(url, body) {
        return fetch(url, {
            method: 'put',
            body: JSON.stringify(body),
            ...options
        }).then(rep => rep.json());
    },
    delete(url){
        return fetch(url, {
            method: 'delete',
            ...options
        }).then(rep => rep.json());
    }
}