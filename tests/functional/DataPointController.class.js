'use strict';

// start the app
let app = require('../../index.js');

let imports = {
    'supertest' : require('supertest'),
    'should' : require('should')
};

describe('GET /', function() {
    it('unknown routes should return 404', function(done) {
        imports.supertest(app)
            .get('/')
            .expect(404, {}, done);
    });
});

describe('GET /v1/datapoints', function() {
    it('data points should be ordered by time desc', function(done) {
        imports.supertest(app)
            .get('/v1/datapoints?key=nasdaq')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                let points = res.body;

                points.length.should.greaterThan(0);

                // points should be ordered desc by time
                let minTime = null;
                for (let i=0; i<points.length; i++) {
                    if (minTime === null) {
                        minTime = points[i]['time'];
                    } else {
                        minTime.should.greaterThan(points[i]['time']);
                    }

                    minTime = points[i]['time'];
                }
                done();
            });
    });

    it('requests with no key should return multiple keys', function(done) {
        imports.supertest(app)
            .get('/v1/datapoints')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);

                let points = res.body;

                points.length.should.greaterThan(0);

                // points should be ordered desc by time
                let minTime = null;
                let keys = {};
                for (let i=0; i<points.length; i++) {
                    if (!(points[i]['key'] in keys)) {
                        keys[points[i]['key']] = 1;
                    }
                }

                Object.keys(keys).length.should.greaterThan(1);

                done();
            });
    });

    it('invalid time ranges should fail', function(done) {
        imports.supertest(app)
            .get('/v1/datapoints?time_start=2&time_end=1')
            .expect(400)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });
});