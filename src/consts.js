export const requestOptions = {
    queryMethod: 'body',
    method: 'post',
    baseURL: 'https://cors-anywhere.herokuapp.com/https://api-v3.igdb.com',
    headers: {
        'user-key': 'b384d3c23f1d42a552d8c30f5e68464c',
        'Accept': 'application/json'
    },
    responseType: 'json',
    timeout: 20000,
};
