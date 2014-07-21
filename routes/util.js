var express = require('express');
var router = express.Router();
var svg2png = require('svg2png');
var fs = require('fs');


router.post('/svg2png', function(req, res) {
    var pngLink = "";
    var svg = req.body;
    fs.writeFile("public/svg2pngTemp/1.svg", svg.svgContent, function(err) {
        if(err) {
        } else {
            svg2png("public/svg2pngTemp/1.svg", "public/svg2pngTemp/1.png", function (err) {
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
    fs.writeFile("public/svg2pngTemp/2.svg", svg.svgContent, function(err) {
        if(err) {
        } else {
            pngLink = "svg2pngTemp/2.svg";
            res.end(pngLink);
        }
    });
});

module.exports = router;