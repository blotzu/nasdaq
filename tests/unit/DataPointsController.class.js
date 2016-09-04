'use strict';

require('../../app/bootstrap.js');

let imports = {
    'supertest' : require('supertest'),
    'should' : require('should'),
    'sinon' : require('sinon'),
    'leche' : require('leche'),
    'DataPointsContoller' : require(__commonPath + '/app/controllers/DataPointsController.class.js'),
};

describe('DataPointsContoller', function() {
    let config = {};
    let app = {
        'services' : {
            'config' : function() {
                return config;
            }
        }
    }
    let controller = new imports.DataPointsContoller(app);

    describe('formatResponseObject', function() {
        imports.leche.withData({
            'normal data' : [
                {
                    'key' : 'some key',
                    'time_point' : 123123,
                    'value' : 123.123
                },
                {
                    'name' : 'pretty name',
                },
                {
                    "key": "some key",
                    "name": "pretty name",
                    "time": 123123,
                    "value": 123.123
                }
            ],
            'string data' : [
                {
                    'key' : 'some key',
                    'time_point' : '123123',
                    'value' : '123.123'
                },
                {
                    'name' : 'pretty name',
                },
                {
                    "key": "some key",
                    "name": "pretty name",
                    "time": 123123,
                    "value": 123.123
                }
            ],
            'no data' : [
                {},
                {},
                {
                    "key": '',
                    "name": '',
                    "time": 0,
                    "value": 0
                }
            ]
        }, function(value, key, expected) {
            it('should return the formatted object', function(done) {
                let res = controller.formatResponseObject(value, key);
                res.should.eql(expected);
                done();
            });
        });
    });

    describe('validateArgumentTime', function() {
        imports.leche.withData({
            'normal data' : [
                {
                    'query' : {
                        'time' : 123,
                    }
                },
                'time',
                123
            ],
            'string data' : [
                {
                    'query' : {
                        'time' : '123',
                    }
                },
                'time',
                123
            ],
            'missing data' : [
                {
                    'query' : {
                        'time' : null,
                    }
                },
                'time',
                null
            ],
            'missing key' : [
                {
                    'query' : {}
                },
                'time',
                null
            ],
            'missing query' : [
                {},
                'time',
                null
            ],
        }, function(req, key, expected) {
            it('should validate the time arguments', function(done) {
                let res = controller.validateArgumentTime(req, key);
                imports.should(res).eql(expected);
                done();
            });
        });

        imports.leche.withData({
            'key exists - not number' : [
                {
                    'query' : {
                        'time' : 'asd',
                    }
                },
                'time',
                123
            ],
        }, function(req, key, expected) {
            it('should throw an error', function(done) {
                let e;
                try {
                    let res = controller.validateArgumentTime(req, key);
                    imports.should(true).eql(false);
                } catch(e) {
                    imports.should(e).be.an.instanceOf(Error);
                }
                done();
            });
        });
    });

    describe('validateRequest', function() {
        config = {
            'api' : {
                'defaultTimeInterval' : 100
            },
        };

        imports.leche.withData({
            'normal data' : [
                {
                    'query' : {
                        'key' : 'asd',
                        'time_start' : 123,
                        'time_end' : 125,
                    }
                },
                {
                        'key' : 'asd',
                    'time_start' : 123,
                    'time_end' : 125,
                }
            ],
            'missing time start' : [
                {
                    'query' : {
                        'key' : 'asd',
                        'time_end' : 1000,
                    }
                },
                {
                    'key' : 'asd',
                    'time_start' : 900,
                    'time_end' : 1000,
                }
            ],
            'key not present' : [
                {
                    'query' : {
                        'time_start' : 123,
                        'time_end' : 125,
                    }
                },
                {
                    'time_start' : 123,
                    'time_end' : 125,
                }
            ],
        }, function(req, expected) {
            it('should fill in the time start if missing', function(done) {
                let res = controller.validateRequest(req);
                imports.should(res).eql(expected);
                done();
            });
        });

        imports.leche.withData({
            'invalid time range' : [
                {
                    'query' : {
                        'time_start' : 20,
                        'time_end' : 10,
                    }
                },
                {
                    'time_start' : 20,
                    'time_end' : 10,
                }
            ],
        }, function(req, expected) {
            it('should not allow invalid time ranges', function(done) {
                let e;
                try {
                    let res = controller.validateRequest(req);
                    imports.should(true).eql(false);
                } catch(e) {
                    imports.should(e).be.an.instanceOf(Error);
                }
                done();
            });
        });
    });
});