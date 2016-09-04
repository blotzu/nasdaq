'use strict';

require('../../app/bootstrap.js');

let imports = {
    'supertest' : require('supertest'),
    'should' : require('should'),
    'sinon' : require('sinon'),
    'NasdaqValueRepository' : require(__commonPath + '/lib/NasdaqValueRepository.class.js'),
};

describe('NasdaqValueRepository', function() {
    let tableName = 'some_table';
    let db;
    db = imports.sinon.spy(function(table) {
        table.should.equal(tableName);
        return db;
    });

    let repo = new imports.NasdaqValueRepository(db, tableName);

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

    describe('find', function() {
        it('should select and filter', function(done) {
            let res = repo.find({
                'key' : 'asd'
            });
            db.select.callCount.should.be.eql(1);
            db.where.callCount.should.be.eql(1);
            done();
        });

        it('should sort', function(done) {
            let res = repo.find({}, {
                'col1' : 'asc',
                'col2' : 'desc'
            });
            db.select.callCount.should.be.eql(1);
            db.orderBy.callCount.should.be.eql(2);
            done();
        });
    });
});