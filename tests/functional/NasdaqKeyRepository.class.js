'use strict';

require('../../app/bootstrap.js');

let imports = {
    'supertest' : require('supertest'),
    'should' : require('should'),
    'sinon' : require('sinon'),
    'NasdaqKeyRepository' : require(__commonPath + '/lib/NasdaqKeyRepository.class.js'),
};

describe('NasdaqKeyRepository', function() {
    let tableName = 'some_table';
    let db;
    db = imports.sinon.spy(function(table) {
        table.should.equal(tableName);
        return db;
    });

    let repo = new imports.NasdaqKeyRepository(db, tableName);

    beforeEach(function() {
        db.select = imports.sinon.spy(function() {return db; });
        db.where = imports.sinon.spy(function() {return db; });
        db.insert = imports.sinon.spy(function() {return db; });
        db.orderBy = imports.sinon.spy(function() {return db; });
        db.then = imports.sinon.spy(function() {return db; });
        db.catch = imports.sinon.spy(function() {return db; });
    });

    describe('upsert', function() {
        it('upsert should try to insert', function(done) {
            let res = repo.upsert();
            db.insert.callCount.should.be.eql(1);
            done();
        });
    });

    describe('findByKey', function() {
        it('should select and fiter', function(done) {
            let res = repo.findByKey(['key1', 'key2']);
            db.select.callCount.should.be.eql(1);
            db.where.callCount.should.be.eql(1);
            done();
        });
    });
});