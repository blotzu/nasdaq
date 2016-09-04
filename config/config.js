module.exports = {
    'db' : {
        'client' : 'pg',
        'connection': {
            charset: 'utf8',
            host : '127.0.0.1',
            port : 5432,
            user : 'nasdaq',
            password : 'nasdaq',
            database : 'nasdaq',
        },
        'pool' : {
            'min' : 0,
            'max' : 1,
        },
    },
    'data' : {
        'source': {
            'url' : 'http://www.nasdaq.com/'
        },
        'point' : {
            'interval' : 60 * 1000, // one data point per minute
        }
    },
    'api' : {
        'port' : 3000,
        'defaultTimeInterval' : 30 * 60 * 60 // 30 min
    },
    'entities' : {
        'NasdaqValue' : {
            'tableName' : 'nasdaq_values',
        },
        'NasdaqKey' : {
            'tableName' : 'nasdaq_keys',
        }
    }
};