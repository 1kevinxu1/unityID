var request = require('request');
var baseApi = 'https://www.random.org/integers'
var params  = {
  "num": 6,
  "min": 0,
  "max": 255,
  "base": 10,
  "col": 2,
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

console.log(buildQuery(params))
request(buildQuery(params), function(error, response, body) {
  console.log(response);
  console.log(body);
});
