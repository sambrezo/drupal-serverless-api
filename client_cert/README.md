# Add the following files for SSL client authentication with Drupal
* service_api.crt
  * Client certificate signed by your CA
* service_api.key
  * Private Key

# Generate certs
Adjust `days` for security and convenience

## CA for webserver
```
# CA private key
$ openssl genrsa -des3 -out ca.key 2048

# CA certificate
$ openssl req -new -x509 -days 3650 -key ca.key -out ca.crt
```

## Client certificate for API and Drupal admins
```
# Private key
$ openssl genrsa -out service_api.key 2048

# CSR
$ openssl req -new -key service_api.key -out service_api.csr

# Certificate
$ openssl x509 -req -days 3650 -in service_api.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out service_api.crt
```
