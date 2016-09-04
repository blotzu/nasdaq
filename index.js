'use strict';

// define the root path 
GLOBAL['__commonPath'] = __dirname;

let imports = {
    'express' : require('express'),
    'services' : require(__commonPath + '/app/services.js'),

    'DataPointsController' : require(__commonPath + '/app/controllers/DataPointsController.class.js'),
};

let app = imports.express();

// define the routes
app.get('/v1/datapoints', (req, res) => {
    let controller = new imports.DataPointsController(app);
    return controller.datapoints(req, res);
});

app.listen(imports.services.config()['api']['port'], () => {
  console.log(`Api up on port: ${imports.services.config()['api']['port']}!`);
});
