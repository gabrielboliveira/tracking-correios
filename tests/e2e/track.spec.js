const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');

const Tracking = require('../../src/track');
const TrackingError = require('../../src/errors/tracking');

chai.use(chaiAsPromised);
chai.use(chaiSubset);

const expect = chai.expect;

describe('tracking-correios (E2E)', () => {

    describe('when invoked with valid tracking number', () => {
        describe('with one', () => {
            const testFile = require('../responses/valid-one.json');

            it('should fulfill with correct tracking information (string)', done => {
                expect(Tracking.track('DU897123996BR')).to.eventually.deep.equal(testFile).notify(done);
            });

            it('should fulfill with correct tracking information (array)', done => {
                expect(Tracking.track(['DU897123996BR'])).to.eventually.deep.equal(testFile).notify(done);
            });
        });

        describe('with "n"', () => {
            const testFile = require('../responses/valid-two.json');

            it('should fulfill with correct tracking information', done => {
                expect(Tracking.track(['DU897123996BR', 'PN273603577BR'])).to.eventually.deep.equal(testFile).notify(done);
            });
        });
    });

    describe('when invoked with invalid tracking number', () => {
        it('should reject with a validation_error type with empty call', () => {
            Tracking.track()
                .catch(error => expect(error)
                    .to.be.an.instanceOf(TrackingError)
                    .and.containSubset({
                        name: 'TrackingError',
                        message: 'Erro ao validar os objetos.',
                        type: 'validation_error',
                        errors: [{
                            message: 'Nenhum objeto válido para pesquisa.',
                            service: 'objects_validation',
                        }],
                    }));
        });

        it('should reject with a validation_error type (one)', () => {
            Tracking.track(['AB123123ABCBR'])
                .catch(error => expect(error)
                    .to.be.an.instanceOf(TrackingError)
                    .and.containSubset({
                        name: 'TrackingError',
                        message: 'Erro ao validar os objetos.',
                        type: 'validation_error',
                        errors: [{
                            message: 'Nenhum objeto válido para pesquisa.',
                            service: 'objects_validation',
                        }],
                    }));
        });

        it('should reject with a validation_error type (several)', () => {
            Tracking.track(['AB123123ABCBR', 'ABCD', '123123123', 'BR', '%$@!$!', 'AB1231234564BR', 'ABR123123123BR', 'AB231234564ABB'])
                .catch(error => expect(error)
                    .to.be.an.instanceOf(TrackingError)
                    .and.containSubset({
                        name: 'TrackingError',
                        message: 'Erro ao validar os objetos.',
                        type: 'validation_error',
                        errors: [{
                            message: 'Nenhum objeto válido para pesquisa.',
                            service: 'objects_validation',
                        }],
                    }));
        });
    });
});
