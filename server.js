var server = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    cwd = process.cwd();

function responseError(response, code, msg) {
    response.writeHead(code, {
        'Content-Type': 'text/plain'
    });
    response.write(msg);
    response.end();
}

function serverHandler(request, response) {
    var uri = url.parse(request.url).pathname,
        filename = path.join(cwd, uri);

    var stats;

    filename = path.resolve(filename);
    if (filename.indexOf(cwd) !== 0) {
        responseError(response, 404, 
            '404 Not Found: ' + path.join('/', uri) + '\n');
        return;
    }

    try {
        stats = fs.lstatSync(filename);
    } catch (e) {
        responseError(response, 404, 
            '404 Not Found: ' + path.join('/', uri) + '\n');
        return;
    }
    
    if (fs.statSync(filename).isDirectory()) {
        filename += '/index.html';
    }

    var contentType;
    if(filename.indexOf('.html') !== -1) {
        contentType = {
            'Content-Type': 'text/html'
        };
    }


    fs.readFile(filename, 'binary', function(err, file) {
        if (err) {
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            response.write(err + '\n');
            response.end();
            return;
        }

        response.writeHead(200, contentType);
        response.write(file, 'binary');
        response.end();
    });
}

var app = server.createServer(serverHandler);

app = app.listen(process.env.PORT || 9002, process.env.IP || "0.0.0.0", function() {
    var addr = app.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});
