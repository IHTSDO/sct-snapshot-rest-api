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
    fs.writeFile(appDir + "/public/svg2pngTemp/1.svg", svg.svgContent, function(err) {
        if(err) {
            console.log(err);
        } else {
            svg2png(appDir + "/public/svg2pngTemp/1.svg", appDir +
                "/public/svg2pngTemp/1.png", 3, function (err) {
                if (err) {
                    console.log(err);
                    res.end("Error");
                } else {
                    pngLink = "svg2pngTemp/1.png";
                    res.end(pngLink);
                }
            });

        }
    });
});

router.post('/saveSvg', function(req, res) {
    var pngLink = "";
    var svg = req.body;
    fs.writeFile(appDir + "/public/svg2pngTemp/2.svg", svg.svgContent, function(err) {
        if(err) {
        } else {
            pngLink = "svg2pngTemp/2.svg";
            res.end(pngLink);
        }
    });
});

module.exports = router;