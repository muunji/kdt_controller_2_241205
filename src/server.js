import http from "node:http";
import fs, { writeFileSync } from "node:fs";
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
        //객체로 넣기
        body[key[0]] = key[1];
      });
      req.on("end",()=>{
        console.log(body);

        let existData = [];

        //파일이 존재한다면
        if(fs.existsSync("text.json")){
          const fileContent = fs.readFileSync("text.json","utf-8");
          existData += JSON.parse(fileContent);
          return existData;
        }

        //기존 파일에 데이터 추가
        existData.push(body);

        //파일에 json 데이터 저장
        fs.writeFileSync("text.json",JSON.stringify(existData),"utf-8",(err)=>{
          if(err){
            console.error(err);
            return
          }
          console.log("make JSON file");
        });
        res.writeHead(200,{"content-type":"application/json"});
        res.end();

      const pageData = fs.readFileSync(path.join(__dirname,"/public/index.html"),'utf-8',()=>{});
      res.writeHead(200,{"content-type":"text/html"});
      res.write(pageData);
      res.end();
      })
    }
  }
})
.listen(PORT,()=>{
  console.log("http://localhost:3000");
})