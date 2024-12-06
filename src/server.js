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

        //파일 존재 여부 확인
        console.log(fs.existsSync(path.join(__dirname,"/text.json")));
        //파일이 없다면 json파일 만들기
        //파일이 있다면 데이터 추가
        if(body!==""){
          fs.writeFile("text.json",JSON.stringify(body),'utf-8',(err)=>{
            if(err){
              console.error(err);
              return;
            }
            console.log("make file");
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