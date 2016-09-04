'use strict';

require('./app/bootstrap.js');

let imports = {
    'gulp' : require('gulp'),
    'child_process' : require('child_process'),
    'gulpUtil' : require('gulp-util'),
    'scrapy' : require('node-scrapy'),
    'services' : require('./app/services.js'),
};

// scrape nasdqa
imports.gulp.task('scrape', () => {
    let url = imports.services.config()['data']['source']['url'];
    let db = imports.services.db();    
    let dataInterval = imports.services.config()['data']['point']['interval'];

    let handler = () => {
        let timeNow = (new Date()).getTime();
        let timePoint = (timeNow - (timeNow % dataInterval)) / 1000;

        imports.gulpUtil.log(`Starting scrape batch for timepoint ${timePoint}`);

        imports.scrapy.scrape(url, {
            'script' : {
                selector: '#indexTable script'
            },
        }, (err, data) => {
            if (err) return imports.gulpUtil.error(err);

            let scriptContent = data.script;
            if (!scriptContent) {
                return imports.gulpUtil.error('Could not get script contents');
            }

            // extract CDATA
            let regexCdata = new RegExp('.*'
                +'\\<\\!\\[CDATA\\[' // being cdata
                +'(.*)' // content
                +'\\/\\/\\]\\]\\>' // end cdata
                +'.*',
            'g');
            let matches = regexCdata.exec(scriptContent);
            if (!matches || !matches[1]) {
                return imports.gulpUtil.error('Invalid graph CDATA contents');
            }

            // parse the CDATA
            let cdata = matches[1];
            let regexLines = new RegExp('storeIndexInfo[\\(]([^\\)]*)[\\)]', 'g');
            let graphData = {};
            let line;
            while (line = regexLines.exec(cdata)) {
                let lineValues = line[1].split(",");
                let key = lineValues[0].replace(/"/g, '');
                let value = parseFloat(lineValues[1].replace(/"/g, '')) || 0;
                graphData[key] = value;
            }

            let names = Object.keys(graphData);
            for (let name of names) {
                // cleanup the name a bit;
                let key = name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^[\-]+)|([\-]+)$/g, '');

                // add the latest pretty names
                imports.services.nasdaqKeyRepository()
                // create the key
                .upsert(key,name)
                // add the data point
                .then(() => {
                    imports.gulpUtil.log(`Upserted ${key} = ${name} key`);

                    return imports.services.nasdaqValueRepository()
                    .upsert(key, timePoint, graphData[name]);
                }).then(() => {
                    imports.gulpUtil.log(`Upserted ${key} = ${graphData[name]} as time point ${timePoint}`);
                });
            }
        });
    };

    handler();
    setInterval(handler, dataInterval / 2); // scrape twice as often as the data point interval - in order to avoid missing data points if the script takes too long
});

// initialize the db schema
imports.gulp.task('init-db', () => {
    // create the db
    let dbName = imports.services.config()['db']['connection']['database'];
    let dbUser = imports.services.config()['db']['connection']['user'];
    let dbPassword = imports.services.config()['db']['connection']['password'];
    
    // create the user
    imports.child_process.execSync(`echo "create user ${dbUser} with password '${dbPassword}'" | psql -U postgres`);
    imports.child_process.execSync(`createdb -U postgres --owner=${dbUser} ${dbName}`);

    // create the tables
    let db = imports.services.db();
    db.schema.createTableIfNotExists('nasdaq_keys', function(table) {
        table.string('key');
        table.string('name');

        table.primary(['key']);
    }).then(() => {
        imports.gulpUtil.log('Created table nasdaq_keys');

        return db.schema.createTableIfNotExists('nasdaq_values', function(table) {
            table.string('key').references('key').inTable('nasdaq_keys');
            table.bigint('time_point');
            table.float('value');

            table.primary(['key', 'time_point']);
        });
    }).then(() => {
        imports.gulpUtil.log('Created table nasdaq_values');
        process.exit(0);
    });
});
