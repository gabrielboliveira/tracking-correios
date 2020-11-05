const axios = require('axios');

const _get = require('lodash/get');
const _chunk = require('lodash/chunk');
const _flatten = require('lodash/flatten');

const { parseStringPromise } = require('xml2js');

const { expand, arrayOf } = require('../utils/helpers');
const TrackingError = require('../errors/tracking');
const { CORREIOS_URL } = require('../utils/consts');

function fetchTracking (objects, configParams) {

    return new Promise((resolve, reject) => {

        Promise.resolve(objects)
            .then(fetchFromCorreios)
            .then(parseFetchOutput)
            .then(resolvePromise)
            .catch(rejectWithError);

        function fetchFromCorreios (objects) {
            let callsChunked = _chunk(objects, configParams.limit);

            return Promise.all(callsChunked.map(fetchFromAPI));
        }

        function fetchFromAPI (objects) {
            const options = {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'Cache-Control': 'no-cache',
                },
            };

            return axios.post(
                CORREIOS_URL,
                createSOAPEnvelope(objects),
                options,
            );
        }

        function parseFetchOutput (responses) {
            return Promise.all(responses.map(parseSingleFetch))
                .then(mergeAllResponses);
        }

        function mergeAllResponses (responses) {
            return _flatten(responses);
        }

        function parseSingleFetch (response) {
            if (response.status === 200) {
                return Promise.resolve(response.data)
                    .then(parseXml)
                    .then(extractSuccessObject)
                    .then(fixEvent);
            }

            return Promise.resolve(response.data)
                .then(parseXml)
                .then(extractErrorObject)
                .then(throwErrorObject);
        }

        function parseXml (text) {
            return parseStringPromise(text)
                .catch(() => new TrackingError({
                    message: 'Não foi possível interpretar o XML de resposta.',
                    type: 'service_error',
                    errors: [{
                        message: 'Ocorreu um erro ao tratar o XML retornado pela API dos Correios.',
                        service: 'parsing_error',
                    }],
                }));
        }

        function extractSuccessObject (object) {
            return _get(
                object,
                'soapenv:Envelope.soapenv:Body[0].ns2:buscaEventosListaResponse[0].return[0].objeto',
            ).map(expand);
        }

        function extractErrorObject (object) {
            return expand(_get(object, 'soapenv:Envelope.soapenv:Body[0].soapenv:Fault[0].faultstring[0]'));
        }

        function fixEvent (object) {
            return object.map(item => {
                item.evento = arrayOf(item.evento);
                return item;
            });
        }

        function throwErrorObject (faultString) {
            throw new TrackingError({
                message: 'Erro no serviço do Correios.',
                type: 'service_error',
                errors: [{
                    message: `O serviço do Correios retornou o seguinte erro: ${ faultString }`,
                    service: 'service_error',
                }],
            });
        }

        function createSOAPEnvelope (objects) {
            let envelope = `<?xml version="1.0"?>\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://resource.webservice.correios.com.br/">\n   <soapenv:Header/>\n   <soapenv:Body>\n      <res:buscaEventosLista>\n`;

            if (configParams.username && configParams.password) {
                envelope += `         <usuario>${configParams.username}</usuario>\n         <senha>${configParams.password}</senha>\n`;
            }

            envelope += `         <tipo>${ configParams.type }</tipo>\n         <resultado>${ configParams.result }</resultado>\n         <lingua>${ configParams.language }</lingua>\n`;

            objects.forEach(object => {
                envelope += `         <objetos>${ object }</objetos>\n`;
            });

            envelope += `      </res:buscaEventosLista>\n   </soapenv:Body>\n</soapenv:Envelope>`;
            return envelope;
        }

        function resolvePromise (objects) {
            resolve(objects);
        }

        function rejectWithError (error = {}) {
            const trackingError = new TrackingError({
                message: error.message,
                type: error.type,
                errors: error.errors,
            });

            if (error.isAxiosError && _get(error, 'response.status') === 500) {
                trackingError.message = 'Erro ao se conectar ao o serviço dos Correios.';
                trackingError.type = 'service_error';
                trackingError.errors = [{
                    message: `Ocorreu um erro ao se conectar ao serviço dos Correios: ${ error.message }`,
                    service: 'service_error',
                }];
            }

            reject(trackingError);
        }
    });

}

module.exports = {
    fetchTracking,
};
