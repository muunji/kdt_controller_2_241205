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
    let body = "";
    //form data
    if(req.url === "/text") {
      req.on("data",(chunk)=>{
       //데이터 누적
       body += chunk.toString();
      });
      req.on("end",()=>{
        console.log("body:"+body);
        //데이터 파싱
        const parseData = body.split('&').reduce((acc,pair)=>{
          const [key, value] = pair.split('=').map(decodeURIComponent);
          acc[key]=value;
          return acc;
        },{});
        console.log("parseData : "+pageData);
        
        //파일 존재 여부 확인
        const fileCheck = fs.existsSync(path.join(__dirname,"/text.json"))
        console.log(fileCheck); //true, false
        //파일이 없다면 json파일 만들기
        if(!fileCheck){
          //false -> 파일 만들어짐
          fs.writeFile("text.json",JSON.stringify(body),'utf-8',(err)=>{
            if(err){
              console.error(err);
              return;
            }
            console.log("make file");
          })
        }
        //파일이 있다면 데이터 추가 -> 안됨
        if(fileCheck){
          //파일 읽기
          const existData = fs.readFileSync(path.join(__dirname,"/text.json"));
          // const jsonData = JSON.parse(existData); //JSON 문자열 객체로 변환
          console.log("existdata : "+existData);
          // console.log("jsondata : "+jsonData);

          //데이터 추가
          const update = {...existData, ...body};

          //파일 쓰기
          fs.writeFile(path.join(__dirname,"/text.json"),JSON.stringify(update),'utf-8',(err)=>{
            if(err){
              console.error(err);
              return;
            }
            console.log("updated file");
          });
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