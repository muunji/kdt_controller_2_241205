import http from "node:http";
import fs, { writeFileSync } from "node:fs";
import path from "node:path";
import querystring from "node:querystring";
//websocket
import {WebSocketServer}  from "ws";
//sqlite
import sqlite3 from 'sqlite3';

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

//sqlite 데이터베이스 연결
//promise 래핑을 위한 헬퍼
function asyncOpen (db,query,params=[]){
  return new Promise((resolve,reject)=>{
    db.run(query,params,function(err){
      if(err){
        reject(err);
      } else {
        // this는 쿼리 결과로 삽입된 행 ID등을 포함함
        resolve(this);
      }
    });
  });
}
//데이터베이스 연결
async function connect () {
  const db = new sqlite3.Database('./data.db',(err)=>{
    if(err){
      console.error("연결 실패",err);
    }else {
      console.log("연결 성공");
    }
  });

  //테이블 없으면 생성
  await asyncOpen(db,`
    CREATE TABLE IF NOT EXISTS data(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      about TEXT
    )
  `);

  return db;
}

const server = http.createServer(async(req,res)=> {
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

      req.on("end",async()=>{

        //데이터 파싱
        const parseData= querystring.parse(body);
        console.log("parseData: ",parseData);

        //데이터베이스 연결
        const db = await connect();

        //데이터베이스에 삽입
        const {about} = parseData;
        await db.run("INSERT INTO data (about) VALUES (?)",[about]);

        console.log('데이터베이스에 저장');

        //응답
        res.writeHead(302,{"Location":"/"});
        res.end();
      })
    }
    if(req.url === "/reset"){
      
      //데이터 베이스 초기화
      const db = await connect();
      await db.run("DELETE FROM data");

      res.writeHead(200,{"content-type":"application/json"});
      res.end(JSON.stringify({success:true}));
    }
  }
});
//웹소켓 서버 생성
const wss = new WebSocketServer({server});

//웹소켓 연결 수락
wss.on("connection",async (ws)=>{
  console.log("웹소켓 : 연결");

  //데이터베이스에서 데이터 읽기
  const db =   await connect();
  const rows = await new Promise((resolve, reject)=>{
    db.all("SELECT * FROM data",(err,rows)=>{
      if(err) reject(err);
      resolve(rows);
    });
  }) 
  
  console.log("전송할 데이터", rows);
  //클라이언트에 데이터 전송
  ws.send(JSON.stringify(rows));

    //클라이언트가 메시지를 보낼 때
    ws.on("message",(message)=>{
      console.log("받은 메시지:",message);
    });
  });

server.listen(PORT,()=>{
  console.log(`http://localhost:${PORT}`);

});