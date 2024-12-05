import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 3000;
const __dirname = path.resolve();

const server = http.createServer((req,res)=> {
  // GET 메소드
  if(req.method==="GET") {
    if(req.url === "/"){
      const pageData = fs.readFileSync(path.join(__dirname,"/public/index.html"),'utf-8',()=>{});
      res.writeHead(200,{"content-type":"text/html"});
      res.write(pageData);
      res.end();
    }
  }
  //POST 메소드
  if(req.method === "POST") {
    //data가 들어오는 곳, json -> 객체
    let body = {};
    //form data
    if(req.url === "/text") {
      req.on("data",(chunk)=>{
        //한글로 받아오기
        const string = decodeURI(chunk.toString());
        const key =string.split('=');
        //배열확인
        console.log(key[0]);
        //객체로 넣기
        // body+=decodeURI(chunk.toString('utf-8'));
        body[key[0]] = key[1];
        console.log(body);
      });
      req.on("end",()=>{
        console.log(body);

        if(body!==""){
          fs.writeFile("text.json",JSON.stringify(body),'utf-8',(err)=>{
            if(err){
              console.error(err);
              return;
            }
            console.log("make JSON file");
          })
        }

      const pageData = fs.readFileSync(path.join(__dirname,"/public/index.html"),'utf-8',()=>{});
      res.writeHead(200,{"content-type":"text/html"});
      res.write(pageData);
      res.end();

        res.end();
      })
    }
  }
})
.listen(PORT,()=>{
  console.log("http://localhost:3000");
})