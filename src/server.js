import http from "node:http";
import fs, { writeFileSync } from "node:fs";
import path from "node:path";
import querystring from "node:querystring";

const PORT = 3000;
const __dirname = path.resolve();
const filePath = path.join(__dirname,"/text.json");

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
    let body = "";
    
    if(req.url === "/text") {
      req.on("data",(chunk)=>{
        //데이터 누적
        body += chunk.toString();
        console.log("body:"+body);
      });

      req.on("end",()=>{

        //데이터 파싱
        const parseData= querystring.parse(body);
        console.log("parseData: ",parseData);

        //파일 처리
        const fileCheck = fs.existsSync(filePath);
        console.log("fileCheck : "+ fileCheck); //true, false

        //파일이 존재하면 내용을 읽고 JSON 객체로 변환
        let jsonData;

        if(fileCheck) {
          const fileContent = fs.readFileSync(filePath,'utf-8');
          jsonData = JSON.parse(fileContent);
        }
        //파일이 없다면 빈 객체로 초기화
        else {
          jsonData = {};
        }
        
        //기본 데이터와 새로운 데이터 합치기
        jsonData = {...jsonData,...parseData};

        fs.writeFileSync(filePath,JSON.stringify(jsonData,null,2),'utf-8');
        console.log("save file");

        //응답
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