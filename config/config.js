module.exports = {
    'sqlite' : {
        'filename' : 'data/data.db'
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
        'port' : 3000
    }
};