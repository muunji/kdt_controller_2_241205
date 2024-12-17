import http from "node:http";
import fs, { writeFileSync } from "node:fs";
import path from "node:path";
import querystring from "node:querystring";

const PORT = 3000;
const __dirname = path.resolve();
const filePath = path.join(__dirname,"/text.json");

//JSON 파일 초기화
//초기 데이터
function initial(){
  const initialData = [];
  writeFileSync(filePath,JSON.stringify(initialData,null,2),'utf-8');
  console.log("JSON 파일 초기화")
}

//readfile > func
function pageData(res,url,type){
  const data = fs.readFileSync(path.join(__dirname,url),'utf-8',()=>{});
  res.writeHead(200,{"content-type":type});
  res.write(data);
  res.end();
}

initial();

const server = http.createServer((req,res)=> {
  // GET 메소드
  if(req.method==="GET") {
    if(req.url === "/"){
      pageData(res,"/public/index.html","text/html");
    }
    if(req.url.includes("script")){
      pageData(res,"/public/script.js","application/javascript");
    }
  }
  //POST 메소드
  if(req.method === "POST") {
    //data가 들어오는 곳, json -> 객체
    if(req.url === "/text") {
      let body = "";

      //데이터 누적
      req.on("data",(chunk)=>{
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
        let jsonData=[];
        if(fileCheck) {
          const fileContent = fs.readFileSync(filePath,'utf-8');
          jsonData = JSON.parse(fileContent);
          console.log(jsonData);
        }

        //만약 jsonData가 객체라면 배열로 반환
        if(typeof jsonData === 'object' && !Array.isArray(jsonData)) {
          jsonData=Object.values(jsonData);
        }

        //parseData를 배열로 추가
        jsonData.push(parseData);

        fs.writeFileSync(filePath,JSON.stringify(jsonData,null,2),'utf-8');
        console.log("save file");

        //응답
        res.writeHead(302,{"Location":"/"});
        res.end();
      })
    }
    if(req.url === "/reset"){
      //JSON 파일 초기화
      initial();

      res.writeHead(200,{"content-type":"application/json"});
      res.end(JSON.stringify({success:true}));
    }
  }
})
.listen(PORT,()=>{
  console.log("http://localhost:3000");
})