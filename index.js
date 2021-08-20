const http = require('http');
const fs = require('fs');
const JSZip = require('jszip');
const fetch = require('node-fetch');

function fstream(filename,res){
    if(!res)return fs.createReadStream(filename)
    fs.createReadStream(filename).pipe(res)
}

function addFilesFromDirectoryToZip (BasePath, zip, ZipPath='') {
    fs.readdirSync(BasePath).forEach(filename=> {
        let filePath = `${BasePath}${filename}`;
        let savePath = `${ZipPath}${filename}`;
        if (fs.lstatSync(filePath).isFile()) {
            zip.file(savePath, fstream(filePath));
        }else
            addFilesFromDirectoryToZip(filePath+'/', zip, savePath+'/');
    });
};

port=80;
cnt=0;

if(process.argv[2]=='-p'){
    port=process.argv[3];
}

server=http.createServer((req,res)=>{
    id=cnt++;
    console.log(id,"connect");
    zip=new JSZip();
    addFilesFromDirectoryToZip("./",zip);
    res.on('close',()=>{
        console.log(id,"disconnect.")
    })
    zip.generateNodeStream().pipe(res);
}).listen(8080);

console.log(`uploader listening on http://127.0.0.1:${port}/`);
ipshow();

async function ipshow(){
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    Object.keys(nets).forEach(name=>{
        ips=[];
        nets[name].forEach(net=> {
            if (net.family === 'IPv4' && !net.internal) {
                ips.push(net.address);
            }
        })
        if(ips.length){
            console.log(ips,name)
        }
    })
    try{
        let res=await fetch('https://api.ipify.org/')
        let ip=await res.text();
        console.log([ip],'api.ipify.org')
    }catch(err){
        console.log('public ip not found')
    }
}