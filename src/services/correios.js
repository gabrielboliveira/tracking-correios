'use strict'

const Promise = require("bluebird")

const fetch = require('isomorphic-fetch')
fetch.Promise = Promise

const _extend = require('lodash.assignin')
const _get = require('lodash.get')
const _chunk = require('lodash.chunk')
const _flatten = require('lodash.flatten')

const xml2js = require('xml2js')

const Helpers = require('../utils/helpers')

const TrackingError = require('../errors/tracking')

const parseXMLString = xml2js.parseString

const url = 'https://webservice.correios.com.br/service/rastro'

function fetchTracking (objects, configParams) {

    return new Promise( (resolve, reject) => {

        Promise.resolve(objects)
            .then(fetchFromCorreios)
            .then(parseFetchOutput)
            .then(resolvePromise)
            .catch(rejectWithError)

        function fetchFromCorreios (objects) {
            let callsChunked = _chunk(objects, configParams.limit)

            return Promise.map(callsChunked, fetchFromAPI)
        }

        function fetchFromAPI (objects) {
            const options = {
                method: 'POST',
                body: createSOAPEnvelope(objects),
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'cache-control': 'no-cache'
                }
            }

            return fetch(url, options)
        }

        function parseFetchOutput(responses) {
            return Promise.all(responses.map(parseSingleFetch))
                    .then(mergeAllResponses)
        }

        function mergeAllResponses (responses) {
            return _flatten(responses)
        }

        function parseSingleFetch (response) {
            if (response.ok) {
                return response.text()
                        .then(parseXML)
                        .then(extractSuccessObject)
                        .then(fixEvent)
            }

            return response.text()
                    .then(parseXML)
                    .then(extractErrorObject)
                    .then(throwErrorObject)
        }

        function parseXML (text) {
            return new Promise( (resolve, reject) => {
                parseXMLString(text, (err, object) => {
                    if(!err) {
                        resolve(object)
                    } else {
                        reject(new TrackingError({
                            message: 'Não foi possível interpretar o XML de resposta.',
                            type: 'service_error',
                            errors: [{
                                message: 'Ocorreu um erro ao tratar o XML retornado pela API dos Correios.',
                                service: 'parsing_error'
                            }]
                        }))
                    }
                })
            })
        }

        function extractSuccessObject (object) {
            return _get(
                object,
                'soapenv:Envelope.soapenv:Body[0].ns2:buscaEventosListaResponse[0].return[0].objeto'
            ).map(Helpers.expand)
        }

        function extractErrorObject (object) {
            return Helpers.expand(_get(object, 'soapenv:Envelope.soapenv:Body[0].soapenv:Fault[0].faultstring[0]'))
        }

        function fixEvent(object) {
            return object.map(item => {
                item.evento = Helpers.arrayOf(item.evento)
                return item
            })
        }

        function throwErrorObject (faultString) {
            throw new TrackingError({
                message: 'Erro no serviço do Correios.',
                type: 'service_error',
                errors: [{
                    message: `O serviço do Correios retornou o seguinte erro: ${ faultString }`,
                    service: 'service_error'
                }]
            })
        }

        function createSOAPEnvelope (objects) {
            let envelope = `<?xml version="1.0"?>\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://resource.webservice.correios.com.br/">\n   <soapenv:Header/>\n   <soapenv:Body>\n      <res:buscaEventosLista>\n`

            if(configParams.username && configParams.password) {
                envelope += `         <usuario>${configParams.username}</usuario>\n         <senha>${configParams.password}</senha>\n`
            }

            envelope += `         <tipo>${ configParams.type }</tipo>\n         <resultado>${ configParams.result }</resultado>\n         <lingua>${ configParams.language }</lingua>\n`

            objects.forEach((object) => {
                envelope += `         <objetos>${ object }</objetos>\n`
            })

            envelope += `      </res:buscaEventosLista>\n   </soapenv:Body>\n</soapenv:Envelope>`
            return envelope
        }

        function resolvePromise (objects) {
            resolve(objects)
        }

        function rejectWithError (error = {}) {
            const trackingError = new TrackingError({
                message: error.message,
                type: error.type,
                errors: error.errors
            })

            if (error.name === 'FetchError') {
                trackingError.message = 'Erro ao se conectar ao o serviço dos Correios.'
                trackingError.errors = [{
                    message: `Ocorreu um erro ao se conectar ao serviço dos Correios: ${ error.message }`,
                    service: 'service_error'
                }]
            }

            reject(trackingError)
        }
    })

}

module.exports = {
    fetchTracking
}
