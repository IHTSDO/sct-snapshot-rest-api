var express = require('express');
var router = express.Router();
var svg2png = require('svg2png');
var fs = require('fs');

var path = require('path');
// find the first module to be loaded
var topModule = module;
while(topModule.parent)
    topModule = topModule.parent;
var appDir = path.dirname(topModule.filename);


router.post('/svg2png', function(req, res) {
    var pngLink = "";
    var svg = req.body;
    var id = guid();
    fs.writeFile(appDir + "/public/svg2pngTemp/" + id + ".svg", svg.svgContent, function(err) {
        if(err) {
            console.log(err);
        } else {
            svg2png(appDir + "/public/svg2pngTemp/" + id + ".svg", appDir +
                "/public/svg2pngTemp/" + id + ".png", 3, function (err) {
                if (err) {
                    console.log(err);
                    res.end("Error");
                } else {
                    pngLink = "svg2pngTemp/" + id + ".png";
                    res.end(pngLink);
                }
            });

        }
    });
});

router.post('/saveSvg', function(req, res) {
    var pngLink = "";
    var id = guid();
    var svg = req.body;
    fs.writeFile(appDir + "/public/svg2pngTemp/" + id + ".svg", svg.svgContent, function(err) {
        if(err) {
        } else {
            pngLink = "svg2pngTemp/" + id + ".svg";
            res.end(pngLink);
        }
    });
});

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

module.exports = router;