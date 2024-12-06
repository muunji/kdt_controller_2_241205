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
        const string = decodeURI(chunk.toString('utf-8'));
        const key =string.split('=');
        console.log(key[0]);
        // console.log(JSON.stringify(key));
        body[key[0]]=key[1];
      });
      req.on("end",()=>{
        console.log(body);

        //변수 i 설정
        let i = 0;
        //i=0일 때 파일 생성
        //i ++
        //i 0이 아닐 때 데이터 더하기
        if(i===0){
          fs.writeFile("text.json",JSON.stringify(body),'utf-8',(err)=>{
            if(err){
              console.error(err);
              return;
            }
            console.log("make file"+i);
          })
          i++
        }
        if(i!==0){
          fs.appendFileSync(path.join(__dirname,"/text.json"),JSON.stringify(body),(err)=>{
            if(err){
              console.error(err);
              return;
            }
            console.log("add data" + i)
          })
        }

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