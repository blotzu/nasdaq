'use strict';

require('./app/bootstrap.js');

let imports = {
    'express' : require('express'),
    'services' : require(__commonPath + '/app/services.js'),

    'DataPointsController' : require(__commonPath + '/app/controllers/DataPointsController.class.js'),
};

let app = imports.express();

// bind the service container to the app
app.services = imports.services;

// define the routes
app.get('/v1/datapoints', (req, res) => {
    let controller = new imports.DataPointsController(app);
    return controller.datapoints(req, res);
});

app.listen(imports.services.config()['api']['port'], () => {
  console.log(`Api up on port: ${imports.services.config()['api']['port']}!`);
});
