'use strict';
var express = require('express');
var session = require('express-session');
var Sequelize = require('sequelize');
var router = express.Router();

var sequelizeCon = new Sequelize(process.env.dbname, process.env.dbusername, process.env.dbpasswd, {
    host: process.env.dbhostname,
    dialect: 'mssql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    dialectOptions: {
        encrypt: true
    }
});

////var sequelizeCon = new Sequelize('dbname', 'dbusername', 'dbpassword', {
////    host: 'dbserver.database.windows.net',
////    dialect: 'mssql',
////    pool: {
////        max: 5,
////        min: 0,
////        idle: 10000
////    },
////    dialectOptions: {
////        encrypt: true
////    }
////});

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
});

router.post('/regen', function (req, res) {
    req.session.regenerate(function (err) {
        // will have a new session here
    })
    return res.send(req.sessionID);
});

router.post('/practice', function(req, res) {
    var knotname = req.param('knotname');
    if (req.sessionID) {
        var userid = req.sessionID;
    } else {
        userid = '';
    }
    var labelid = req.param('labelid');
    var labeltime = new Date().toISOString();

    var sql = "INSERT dbo.PracticeKnotLabel(knotname, userid, labelid, labeltime) VALUES ('"
        + knotname + "', '" + userid + "', '" + labelid + "', '" + labeltime + "')";

    var respondWith = 'failed';

    sequelizeCon.query(sql, { type: sequelizeCon.QueryTypes.INSERT }).spread((results, metadata) => {
        // Results will be an empty array and metadata will contain the number of affected rows.
        if (metadata === 0) {
            res.status(500).send("An error has occurred -- " + respondWith);
        } else {
            respondWith = 'success';
            res.status(200);
            return res.send(respondWith);
        }
    })
});

router.post('/label', function (req, res) {
    var knotname = req.param('knotname');
    if (req.sessionID) {
        var userid = req.sessionID;
    } else {
        userid = '';
    }
    var labelid = req.param('labelid');
    var labeltime = new Date().toISOString();
    
    var isbadexample = req.param('isbadexample');
    
    var sql = "INSERT dbo.UserKnotLabel(knotname, userid, labelid, labeltime, is_bad_example) VALUES ('"
        + knotname + "', '" + userid + "', '" + labelid + "', '" + labeltime + "', '" + isbadexample + "')";

    var respondWith = 'failed';

    sequelizeCon.query(sql, { type: sequelizeCon.QueryTypes.INSERT }).spread((results, metadata) => {
        // Results will be an empty array and metadata will contain the number of affected rows.
        if (metadata === 0) {
            res.status(500).send("An error has occurred -- " + respondWith);
        } else {
            respondWith = 'success';
            res.status(200);
            return res.send(respondWith);
        }
    })
});

router.get('/finish', function (req, res) {
    var prevSessionID = req.sessionID;
    req.session.destroy(function (err) { });
    return res.send(prevSessionID);
});

module.exports = router;
