'use strict';

let imports = {
    'httpStatusCodes' : require('http-status-codes'),
    'BaseController' : require(__commonPath + '/lib/BaseController.class.js')
};

module.exports = class DataPointsContoller extends imports.BaseController {

    /**
     * Returns a list of nasdaq value data point that match the input criteria
     *
     * @returns [Object]
     */
    datapoints(req, res) {
        let valueRepo = this.app.services.nasdaqValueRepository();
        let keyRepo = this.app.services.nasdaqKeyRepository();

        let responseList = [];
        let nasdaqKeyMap = {};

        // validate the input filters
        let args;
        try {
            args = this.validateRequest(req);
        } catch(e) {
            res.status(imports.httpStatusCodes.BAD_REQUEST);
            return res.json({
                'error' : e.message
            });
        }

        valueRepo.find(args, {'time_point' : 'desc'})
            // get the values
            .then((nasdaqValueList) => {
                for (let value of nasdaqValueList) {
                    if (!(value['key'] in nasdaqKeyMap)) {
                        nasdaqKeyMap[value['key']] = [];
                    }
                    nasdaqKeyMap[value['key']].push(value);
                }

                return keyRepo.findByKey(Object.keys(nasdaqKeyMap));
            })
            // get the key names for those values
            .then((nasdaqKeyList) => {
                for (let nasdaqKey of nasdaqKeyList) {
                    let key = nasdaqKey['key'];
                    for (let nasdaqValue of nasdaqKeyMap[key]) {
                        responseList.push(this.formatResponseObject(nasdaqValue, nasdaqKey));
                    }
                }
            })
            // send the response
            .then(() => {
                res.json(responseList);
            })
            .catch((error) => {
                res.status(imports.httpStatusCodes.INTERNAL_SERVER_ERROR);
                return res.json({
                    'error' : imports.httpStatusCodes.getStatusText(imports.httpStatusCodes.INTERNAL_SERVER_ERROR)
                });
            })
        ;
    }

    /**
     * Validates the request filter
     *
     * @throws Error - if the input request does not contain valid filters
     * @returns Object - a hash map that contains only the allowed key with curated values
     */
    validateRequest(req) {
        let args = {};

        let now = Math.floor((new Date()).getTime() / 1000);

        let timeEnd = this.validateArgumentTime(req, 'time_end');
        let timeStart = this.validateArgumentTime(req, 'time_start');
        let defaultTimeInterval = this.app.services.config()['api']['defaultTimeInterval'];

        // at least one must be present
        if (timeStart === null && timeEnd === null) {
            timeEnd = now;
            timeStart = now - defaultTimeInterval;
        }

        // validate time range
        if (timeStart !== null && timeEnd !== null) {
            if (timeStart > timeEnd) {
                throw new Error('Invalid time range: time_start > time_end');
            }
        }

        // set the time range default values
        if (timeEnd === null) {
            if (now > timeStart) {
                // default range end = now - if time start is in the part
                timeEnd = now;
            } else {
                timeEnd = timeStart;
            }
        } else if (timeStart === null) {
            timeStart = timeEnd - defaultTimeInterval;
        }

        args['time_end'] = timeEnd;
        args['time_start'] = timeStart;

        let key = req.query['key'] || null;
        if (key !== null) {
            args['key'] = key;
        }

        return args;
    }

    /**
     * Returns a curated time argument
     *
     * @throws Error - if the argument exists and is not an integer
     * @returns int|null
     */
    validateArgumentTime(req, key) {
        let value = req.query[key];
        if (value === undefined || value === '' || value === null) {
            return null;
        }

        value = parseInt(value);
        if (isNaN(value)) {
            throw new Error(`Invalid arguments: ${key} must be a valid integer`);
        }

        return value;
    }

    /**
     * Prepares the endpoint output for one nasdaq value and key
     *
     * @returns Object
     */
    formatResponseObject(nasdaqValue, nasdaqKey) {
        return {
            'key' : nasdaqValue['key'],
            'name' : nasdaqKey['name'],
            'time' : parseInt(nasdaqValue['time_point']),
            'value' : nasdaqValue['value'],
        };
    }
}