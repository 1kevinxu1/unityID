var request = require('browser-request');
var baseApi = 'https://www.random.org/integers'
var params  = {
  "num": 10*10*3,
  "min": 0,
  "max": 255,
  "base": 10,
  "col": 3,
  "format": "plain",
  "rnd": "new"
}

function buildQuery(params) {
  var queryString = "/?";
  for (var key in params){
    queryString += key + "=" + params[key] + "&"
  };
  return baseApi + queryString
};

function fetchRandomIntegers() {
  request(buildQuery(params), function(error, response, body) {
    return body;
  });
};
