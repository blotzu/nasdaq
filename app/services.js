'use strict';

let serviceMap = {};

let services = {
    getService : function(name, callback) {
        if (name in serviceMap) {
            return serviceMap[name];
        }
        return callback();
    },
    'config' : function() {
        return require('../config/config.js');
    },
    'db' : function() {
        return this.getService(this.name, () => {
            let config = services.config();
            let knex = require('knex')({
                'client': config['db']['client'],
                'connection': config['db']['connection'],
                'pool': config['db']['pool'],
            });

            return knex;
        });
    },
    'nasdaqValueRepository' : function() {
        return this.getService(this.name, () => {
            let NasdaqValueRepository = require(__commonPath + '/lib/NasdaqValueRepository.class.js');
            return new NasdaqValueRepository(
                services.db(),
                services.config()['entities']['NasdaqValue']['tableName']
            );
        });
    },
    'nasdaqKeyRepository' : function() {
        return this.getService(this.name, () => {
            let NasdaqKeyRepository = require(__commonPath + '/lib/NasdaqKeyRepository.class.js');
            return new NasdaqKeyRepository(
                services.db(),
                services.config()['entities']['NasdaqKey']['tableName']
            );
        });
    },
};

module.exports = services;