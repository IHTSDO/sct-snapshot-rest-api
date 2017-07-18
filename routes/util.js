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
            res.end(err);
        } else {
            fs.readFile(appDir + "/public/svg2pngTemp/" + id + ".svg", "utf8", function(err, sourceBuffer) {
                if(err) {
                    console.log(err);
                    res.end(err);
                } else {
                    var options = { width: 1024, height: 768 };
                    const outputBuffer = svg2png.sync(sourceBuffer, options);
                    fs.writeFile(appDir +
                        "/public/svg2pngTemp/" + id + ".png", outputBuffer);
                    pngLink = "svg2pngTemp/" + id + ".png";
                    res.end(pngLink);
                }
            });
            // svg2png(appDir + "/public/svg2pngTemp/" + id + ".svg", appDir +
            //     "/public/svg2pngTemp/" + id + ".png", function (err) {
            //     if (err) {
            //         console.log(err);
            //         res.end("Error");
            //     } else {
            //         pngLink = "svg2pngTemp/" + id + ".png";
            //         res.end(pngLink);
            //     }
            // });

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