const _filter = require('lodash/filter');
const _extend = require('lodash/assignIn');
const _difference = require('lodash/difference');

const TrackingError = require('./errors/tracking');
const { fetchTracking } = require('./services/correios');
const { isValid, category } = require('./utils/tracking-helpers');
const { arrayOf } = require('./utils/helpers');
const { MAX_OBJECTS_CORREIOS } = require('./utils/consts');

function track (objects, configParams = {}) {

    // default params
    configParams = _extend({
        username: 'ECT',
        password: 'SRO',
        type: 'L',
        result: 'T',
        language: '101',
        limit: 5000,
        filter: true,
    }, configParams);

    return new Promise((resolve, reject) => {

        Promise.resolve({ objects, configParams })
            .then(validateParams)
            .then(filterObjects)
            .then(validateObjects)
            .then(fetchFromCorreios)
            .then(resolvePromise)
            .catch(rejectWithError);

        function resolvePromise (objects) {
            resolve(objects);
        }

        function rejectWithError (error) {
            reject(new TrackingError({
                message: error.message,
                type: error.type,
                errors: error.errors,
            }));
        }

        function validateParams (params) {
            if (params.configParams.type && params.configParams.result &&
                    params.configParams.language && params.configParams.limit > 0 &&
                    params.configParams.limit <= MAX_OBJECTS_CORREIOS &&
                    typeof params.configParams.filter === 'boolean') {
                return params;
            }

            throw new TrackingError({
                message: 'Erro ao validar os parâmetros.',
                type: 'validation_error',
                errors: [{
                    message: 'Type, result e language não podem ser undefined, filter deve ser boolean',
                    service: 'param_validation',
                }],
            });
        }

        function filterObjects (params) {
            params.objects = arrayOf(params.objects);

            if (params.configParams.filter) {
                params.objects = filter(params.objects);
            }

            return params;
        }

        function validateObjects (params) {
            if (params.objects.length > 0) {
                return params;
            }

            throw new TrackingError({
                message: 'Erro ao validar os objetos.',
                type: 'validation_error',
                errors: [{
                    message: 'Nenhum objeto válido para pesquisa.',
                    service: 'objects_validation',
                }],
            });
        }

        function fetchFromCorreios (params) {
            return fetchTracking(params.objects, params.configParams);
        }
    });
}

function validate (objects) {
    objects = arrayOf(objects);
    let filtered = filter(objects);

    return {
        valid: filtered,
        invalid: _difference(objects, filtered),
    };
}

function filter (objects) {
    objects = arrayOf(objects);

    return _filter(objects, isValid);
}

module.exports = {
    track,
    validate,
    isValid,
    category,
    filter,
};
