// curl -H "Accept-Language: en" http://localhost:8888/jsonapi/node/page/97368b15-ccdd-4c80-a106-fc952d44eb96 | python -m json.tool
// curl -v -X POST -d '[{"requestId": "req-1", "uri": "/jsonapi/node/page/97368b15-ccdd-4c80-a106-fc952d44eb96", "action": "view", "headers": {"Accept-Language": "de;q=1"}}]' -H "Content-Type: application/json" -H "Accept: application/json" -H "Accept-Language: de;q=1" http://localhost:8888/subrequests

const fs = require('fs');
const https = require('https');
const axios = require('axios');

const httpsAgent = new https.Agent({
  key: fs.readFileSync(`../client_cert/service_api.key`),
  cert: fs.readFileSync(`../client_cert/service_api.crt`)
});

const basic_auth = "Basic " + new Buffer("SERVICE_API_USER" + ":" + process.env['BASIC_AUTH_PASS']).toString("base64");

const ac = axios.create({
  httpsAgent,
  baseURL: `https://drupal-dev.example.com`,
  headers: {
    'Authorization': basic_auth
  }
});

const data = [
  {
    "requestId": "req-1",
    "uri": `/jsonapi/block/block?filter[theme]=drupal`,
    "action": "view",
    "headers": {
      "Accept": "application/json"
    }
  },
  {
    "requestId": "req-2",
    "uri": `/jsonapi/menu/menu`,
    "action": "view",
    "headers": {
      "Accept": "application/json"
    }
  },
  {
    "requestId": "req-3",
    "waitFor": ["req-2"],
    "uri": `/jsonapi/menu_link_content/{{req-2.body@$.data[*].attributes.drupal_internal__id}}`,
    "action": "view",
    "headers": {
      "Accept": "application/json"
    }
  },
  {
    "requestId": "req-4",
    "uri": `/jsonapi/block_content_type/block_content_type`,
    "action": "view",
    "headers": {
      "Accept": "application/json"
    }
  },
  {
    "requestId": "req-5",
    "waitFor": ["req-4"],
    "uri": `/jsonapi/block_content/{{req-4.body@$.data[*].attributes.drupal_internal__id}}`,
    "action": "view",
    "headers": {
      "Accept": "application/json"
    }
  }
];

function parseResponse(responseBody) {
  const boundary = responseBody.split('\n')[0].trim()
  const responses = responseBody.split(boundary).filter(v => v !== "" && v !== '--').map(v => {
    var [headers, content] = v.split('\r\n\r\n');
    headers = headers.split('\r\n').filter(h => !!h).reduce((headers, line) => {
      const [key, value] = line.split(':');
      return { ...headers, [key]: value.trim() };
    }, {});
    return { headers, ...JSON.parse(content) }
  })
  return responses
}

ac.post('/subrequests', data).then(response => {
  console.log(JSON.stringify(parseResponse(response.data), null, 2));
}).catch(error => {
  console.log(error);
})
