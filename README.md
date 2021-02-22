# Fork form Excalidraw Portal

Collaboration server for ExcalidrawTest

## Configuration
 PORT = 8101

## Create Credentials File
```
# 生成私钥key文件
openssl genrsa 1024 > /path/to/private.pem
//
# 通过私钥文件生成CSR证书签名
openssl req -new -key /path/to/private.pem -out csr.pem
//
# 通过私钥文件和CSR证书签名生成证书文件
openssl x509 -req -days 365 -in csr.pem -signkey /path/to/private.pem -out /path/to/file.crt
```

## for build 
npm install
npm start build

