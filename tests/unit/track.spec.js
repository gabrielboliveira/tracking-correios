'use strict'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const chaiSubset = require('chai-subset')

const nock = require('nock')
const path = require('path')

const Tracking = require('../../src/track')
const TrackingError = require('../../src/errors/tracking')

chai.use(chaiAsPromised)
chai.use(chaiSubset)

const expect = chai.expect

describe('tracking-correios (unit)', () => {

     describe('when imported', () => {
        it('should return an object', () => {
            expect(Tracking).to.be.a('object')
        })
        it('should return a "track" method', () => {
            expect(Tracking.track).to.be.a('function')
        })
        it('should return a "validate" method', () => {
            expect(Tracking.validate).to.be.a('function')
        })
        it('should return a "isValid" method', () => {
            expect(Tracking.isValid).to.be.a('function')
        })
        it('should return a "filter" method', () => {
            expect(Tracking.filter).to.be.a('function')
        })
    })

    describe('when "track" invoked', () => {
        it('should return a Promise', () => {
            nock('https://webservice.correios.com.br')
                .post('/service/rastro')
                .replyWithFile(200, path.join(__dirname, '/fixtures/response-valid-one.xml'))

            const trackingCorreios = Tracking.track('DU897123996BR')
            expect(trackingCorreios.then).to.be.a('function')
            expect(trackingCorreios.catch).to.be.a('function')
        })

        describe('with one valid tracking number', () => {
            let testFile = require('../responses/valid-one.json')
            it('should fulfill with correct tracking information using simple string', () => {
                nock('https://webservice.correios.com.br')
                    .post('/service/rastro')
                    .replyWithFile(200, path.join(__dirname, '/fixtures/response-valid-one.xml'))

                return expect(Tracking.track('DU897123996BR')).to.eventually.deep.equal(testFile)
            })
            it('should fulfill with correct tracking information using array', () => {
                nock('https://webservice.correios.com.br')
                    .post('/service/rastro')
                    .replyWithFile(200, path.join(__dirname, '/fixtures/response-valid-one.xml'))

                return expect(Tracking.track(['DU897123996BR'])).to.eventually.deep.equal(testFile)
            })
        })

        describe('with two valid tracking numbers', () => {
            let testFile = require('../responses/valid-two.json')
            it('should fulfill with correct tracking information using array', () => {
                nock('https://webservice.correios.com.br')
                    .post('/service/rastro')
                    .replyWithFile(200, path.join(__dirname, '/fixtures/response-valid-two.xml'))

                return expect(Tracking.track(['DU897123996BR', 'PN273603577BR'])).to.eventually.deep.equal(testFile)
            })
        })

        describe('when Correios API is out of service', () => {
            it('should reject with TrackingError', () => {
                nock('https://webservice.correios.com.br')
                    .post('/service/rastro')
                    .replyWithFile(500, path.join(__dirname, '/fixtures/response-error-one.xml'))

                return expect(Tracking.track('DU897123996BR')).to.eventually
                    .be.rejectedWith("Erro no serviço do Correios.")
                    .and.be.an.instanceOf(TrackingError)
                    .and.have.property('type', 'service_error')
            })
        })
    })

    describe('when "validate" invoked', () => {
        it('should return an object', () => {
            expect(Tracking.validate('DU897123996BR')).to.be.a('object')
        })

        describe('with no parameters', () => {
            it('should return valid and invalid unfilled', () => {
                return expect(Tracking.validate())
                    .to.deep.equal({
                        "valid": [],
                        "invalid": []
                    })
            })
        })

        describe('with empty string as parameter', () => {
            it('should return valid and invalid unfilled', () => {
                return expect(Tracking.validate(""))
                    .to.deep.equal({
                        "valid": [],
                        "invalid": [""]
                    })
            })
        })

        describe('with one valid tracking numbers', () => {
            it('should return valid object filled and invalid unfilled (string)', () => {
                return expect(Tracking.validate('DU897123996BR'))
                    .to.deep.equal({
                        "valid": ['DU897123996BR'],
                        "invalid": []
                    })
            })
            it('should return valid object filled and invalid unfilled (array)', () => {
                return expect(Tracking.validate(['DU897123996BR']))
                    .to.deep.equal({
                        "valid": ['DU897123996BR'],
                        "invalid": []
                    })
            })
        })

        describe('with "n" valid tracking numbers', () => {
            it('should return valid object filled and invalid unfilled', () => {
                return expect(Tracking.validate(['DU897123996BR', 'PN273603577BR', 'PN306956971BR']))
                    .to.deep.equal({
                        "valid": ['DU897123996BR', 'PN273603577BR', 'PN306956971BR'],
                        "invalid": []
                    })
            })
        })

        describe('with 1 valid and 1 invalid tracking numbers', () => {
            it('should return valid object filled with valid and invalid filled with invalid', () => {
                return expect(Tracking.validate(['DU897123996BR', 'ABC' ]))
                    .to.deep.equal({
                        "valid": ['DU897123996BR'],
                        "invalid": ['ABC']
                    })
            })
        })

        describe('with "n" valid and 1 invalid tracking numbers', () => {
            it('should return valid object filled with valid and invalid filled with invalid', () => {
                return expect(Tracking.validate(['DU897123996BR', 'PN273603577BR', 'PN306956971BR', 'ABC' ]))
                    .to.deep.equal({
                        "valid": ['DU897123996BR', 'PN273603577BR', 'PN306956971BR'],
                        "invalid": ['ABC']
                    })
            })
        })

        describe('with 1 valid and "n" invalid tracking numbers', () => {
            it('should return valid object filled with valid and invalid filled with invalid', () => {
                return expect(Tracking.validate(['DU897123996BR', 'AABBBCCCC', 'ASDQ@!#!%!123', 'ABC' ]))
                    .to.deep.equal({
                        "valid": ['DU897123996BR'],
                        "invalid": ['AABBBCCCC', 'ASDQ@!#!%!123', 'ABC']
                    })
            })
        })

        describe('with "n" valid and "n" invalid tracking numbers', () => {
            it('should return valid object filled with valid and invalid filled with invalid', () => {
                return expect(Tracking.validate(['DU897123996BR', 'PN273603577BR', 'PN306956971BR', 'AABBBCCCC', 'ASDQ@!#!%!123', 'ABC' ]))
                    .to.deep.equal({
                        "valid": ['DU897123996BR', 'PN273603577BR', 'PN306956971BR'],
                        "invalid": ['AABBBCCCC', 'ASDQ@!#!%!123', 'ABC']
                    })
            })
        })
    })

    describe('when "isValid" invoked', () => {
        it('should return a boolean', () => {
            expect(Tracking.isValid('DU897123996BR')).to.be.a('boolean')
        })

        describe('with empty value', () => {
            it('should return false', () => {
                expect(Tracking.isValid())
                    .to.deep.equal(false)
            })
        })

        describe('with valid object', () => {
            it('should return true', () => {
                expect(Tracking.isValid('DU897123996BR'))
                    .to.deep.equal(true)
            })
        })

        describe('with invalid object (wrong initials)', () => {
            it('should return false', () => {
                expect(Tracking.isValid('ZZ123123123BR'))
                    .to.deep.equal(false)
            })
        })

        describe('with invalid object (wrong format)', () => {
            it('should return false (simple)', () => {
                expect(Tracking.isValid('AAAAA'))
                    .to.deep.equal(false)
            })
            it('should return false (complex)', () => {
                expect(Tracking.isValid('AAA123123123BR'))
                    .to.deep.equal(false)
            })
        })

        describe('with invalid object (not string)', () => {
            it('should return false (array)', () => {
                expect(Tracking.isValid([]))
                    .to.deep.equal(false)
            })
            it('should return false (object)', () => {
                expect(Tracking.isValid({}))
                    .to.deep.equal(false)
            })
        })
    })

    describe('when "filter" invoked', () => {
        it('should return an array', () => {
            expect(Tracking.filter('DU897123996BR')).to.be.a('array')
        })

        describe('with valid objects', () => {
            it('should return array filled (one)', () => {
                expect(Tracking.filter('DU897123996BR'))
                    .to.deep.equal(['DU897123996BR'])
            })
            it('should return array filled ("n")', () => {
                expect(Tracking.filter(['DU897123996BR', 'PN273603577BR', 'PN306956971BR']))
                    .to.deep.equal(['DU897123996BR', 'PN273603577BR', 'PN306956971BR'])
            })
        })

        describe('with invalid objects', () => {
            it('should return array unfilled (one)', () => {
                expect(Tracking.filter('AAAAA'))
                    .to.deep.equal([])
            })
            it('should return array unfilled ("n")', () => {
                expect(Tracking.filter(['AB123123ABCBR', 'ABCD', '123123123', 'BR', '%$@!$!', 'AB1231234564BR', 'ABR123123123BR', 'AB231234564ABB']))
                    .to.deep.equal([])
            })
        })
    })

})
