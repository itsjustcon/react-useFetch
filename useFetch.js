const { useCallback, useEffect, useRef, useState } = require('react');

const pick = (obj = {}, keys = []) => keys.reduce((memo, key) => Object.assign(memo, { [key]: obj[key] }), {});

const ResponseProperties = [
    'body',
    'bodyUsed',
    'headers',
    'ok',
    'redirected',
    'status',
    'statusText',
    'type',
    'url',
];

async function parseResponseBody(response, forcedBodyType) {
    let bodyType = (forcedBodyType || '').trim().toLowerCase();
    if (!bodyType) {
        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        if (contentType.includes('application/json')) {
            bodyType = 'json';
        } else if (contentType.includes('multipart/form-data')) {
            bodyType = 'formdata';
        } else if (contentType.includes('text')) {
            bodyType = 'text';
        }
    }
    if (bodyType === 'arraybuffer') {
        return await response.arrayBuffer();
    } else if (bodyType === 'blob') {
        return await response.blob();
    } else if (bodyType === 'formdata') {
        return await response.formData();
    } else if (bodyType === 'json') {
        return await response.json();
    } else if (bodyType === 'text') {
        return await response.text();
    } else {
        return response.body;
    }
}



function useFetch(...fetchArgs) {

    const requestRef = useRef();

    const [state, setState] = useState({
        loading: true,
        response: null,
        body: null,
    });

    const executeFetch = useCallback(async (...fetchArgs) => {
        const request = new Request(...(fetchArgs || initialFetchArgs));
        requestRef.current = request;
        const response = await fetch(...fetchArgs);
        if (requestRef.current !== request) return;
        const unreadResponse = response.clone();
        const responseType = (fetchArgs.find((arg) => typeof(arg) === 'object' && 'responseType' in arg) || {}).responseType;
        const body = await parseResponseBody(response, responseType);
        if (requestRef.current !== request) return;
        setState({
            loading: false,
            response: unreadResponse,
            body: body,
        });
    }, []);

    useEffect(() => {
        executeFetch(...fetchArgs);
    }, [executeFetch]);

    return {
        loading: state.loading,
        response: state.response,
        ...pick(state.response || {}, ResponseProperties),
        body: state.body,
    };
}



function useLazyFetch(...fetchArgs) {
    const initialFetchArgs = fetchArgs;

    const requestRef = useRef();

    const [state, setState] = useState({
        loading: false,
        response: null,
        body: null,
    });

    const executeFetch = useCallback(async (...fetchArgs) => {
        fetchArgs = fetchArgs || initialFetchArgs;
        const request = new Request(...(fetchArgs || initialFetchArgs));
        requestRef.current = request;
        setState({
            loading: true,
            response: null,
            body: null,
        });
        const response = await fetch(request);
        const unreadResponse = response.clone();
        const responseType = (fetchArgs.find((arg) => typeof(arg) === 'object' && 'responseType' in arg) || {}).responseType;
        const body = await parseResponseBody(response, responseType);
        if (requestRef.current === request) {
            setState({
                loading: false,
                response: unreadResponse,
                body: body,
            });
        }
        return unreadResponse;
    }, []);

    return [executeFetch, {
        loading: state.loading,
        response: state.response,
        ...pick(state.response || {}, ResponseProperties),
        body: state.body,
    }];
}



module.exports = {
    useFetch: useFetch,
    useLazyFetch: useLazyFetch,
};
