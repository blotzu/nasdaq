'use strict';

let services = {
    'config' : function() {
        return require('../config/config.js');
    },
    'db' : function() {
        let config = services.config();
        let knex = require('knex')({
            'dialect': 'sqlite3',
            'connection': {
                filename: config['sqlite']['filename']
            },
            'useNullAsDefault' : true
        });

        return knex;
    }
};

module.exports = services;