'use strict';

let imports = {
    'BaseController' : require(__commonPath + '/lib/BaseController.class.js')
};

module.exports = class DataPointsContoller extends imports.BaseController {
    datapoints(req, res) {
        return res.end();
    }
}