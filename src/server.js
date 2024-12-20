import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import querystring from "node:querystring";
//websocket
import {WebSocketServer}  from "ws";
//sqlite
import sqlite3 from 'sqlite3';

const PORT = 3000;
const __dirname = path.resolve();
const filePath = path.join(__dirname,"/text.json");
const dbPath = path.join(__dirname,"data.db");

//db 파일 초기화
async function initial(){
  const db = new sqlite3.Database(dbPath,(err)=>{
    if(err){
      console.error("연결 실패",err);
    }else {
      console.error("연결 성공")
    }
  });

  //기존 테이블 삭제
  await new Promise((resolve,reject)=>{
    db.run("DROP TABLE IF EXISTS data",(err)=>{
      if(err) reject(err);
      else resolve();
    });
  });
  //테이블 새로 생성
  await new Promise((resolve,reject)=>{
    db.run(
      `CREATE TABLE IF NOT EXISTS data(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      about TEXT
      )`, 
      (err)=>{
        if(err) reject(err);
        else resolve();
      }
    );
  });
  
  console.log("초기화 완료");

  db.close();
}


//readfile > func
function pageData(res,url,type){
  const data = fs.readFileSync(path.join(__dirname,url),'utf-8',()=>{});
  res.writeHead(200,{"content-type":type,"Cache-Control":"no-store"});
  res.write(data);
  res.end();
}

let InitializedData = false;

(async()=>{
  try{
    //데이터베이스 초기화
    console.log("db 초기화 시작")
    await initial();
    console.log("db 초기화 완료");
    InitializedData = true;

    //새로고침 로그
    console.log("InitializedData 상태 :",InitializedData);

    //서버시작
    server.listen(PORT,()=>{
      console.log(`서버 실행 중 : http://localhost:${PORT}`)
    });
  }catch(err){
    console.error("초기화 중 오류",err);
  }
})();

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
  const db = new sqlite3.Database(dbPath,(err)=>{
    if(err){
      console.error("db 연결 실패",err);
    }else {
      console.log("db 연결 성공");
    }
  });
  return db;
}

const server = http.createServer(async(req,res)=> {
  //브라우저 캐시 무효화
  //캐시를 사용하지 않도록 설정정
  res.setHeader("Cache-Control","no-store");

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
    if(!InitializedData) {
      res.writeHead(503,{"content-type":"application/json"});
      res.end(JSON.stringify({success:false,error:"서버 초기화 중"}));
      return;
    }
    if(req.url === "/text") {
      let body = "";

      //데이터 누적
      req.on("data",(chunk)=>{
        body += chunk.toString();
      });

      req.on("end",async()=>{

        //데이터 파싱
        const parseData= querystring.parse(body);

        //데이터베이스 연결
        const db = await connect();

        //데이터베이스에 삽입
        try {
          await asyncOpen(db,"INSERT INTO data (about) VALUES (?)",[parseData.about]);
          console.log('데이터베이스에 저장');
          res.writeHead(302,{"Location":"/"});
          res.end();
        }catch (err) {
          console.error("데이터 삽입 중 오류",err);
          res.writeHead(500,{"content-type":"applicatioin/json"});
          res.end(JSON.stringify({success:false,error:err.message}))
        } finally {
          db.close();
        }
      });
    }

    if(req.url === "/reset"){
      //데이터 베이스 초기화
      //서버 초기화 후 클라이언트 데이터 갱신신
      try{
        //데이터 초기화
        const db = await connect();
        await new Promise((resolve,reject)=>{
          db.run("DELETE FROM data",(err)=>{
            if(err) reject(err);
            else resolve(); 
          });
        });

        console.log("데이터 초기화 완료");
        res.writeHead(200,{"content-type":"application/json"});
        //초기화 완료 후 신호 반환
        res.end(JSON.stringify({success:true}));
      } catch(err){
        console.error("초기화 중 오류",err);
        res.writeHead(500,{"content-type":"application/json"});
        res.end(JSON.stringify({success:false,error:err.message}));
      }f
    }
  }
});

//웹소켓 서버 생성
const wss = new WebSocketServer({server});

//웹소켓 연결 수락
wss.on("connection",async (ws)=>{
  if(!InitializedData){
    ws.send(JSON.stringify({error:"서버 초기화 중"}));
    ws.close();
    return;
  }
  
  console.log("웹소켓 : 연결 완료");
  
  //데이터베이스에서 데이터 읽기
  const db =   await connect();

  try{
    //데이터 조회
    const rows = await new Promise((resolve, reject)=>{
      db.all("SELECT * FROM data",(err,rows)=>{
        if(err) reject(err);
        resolve(rows);
      });
    });

    console.log("전송할 데이터", rows);
    //클라이언트에 데이터 전송
    ws.send(JSON.stringify(rows)); 
  } catch (err) {
    console.log("data 조회 오류",err);
  }finally {
    db.close();
  }

    //클라이언트가 메시지를 보낼 때
    ws.on("message",(message)=>{
      console.log("받은 메시지:",message);
    });
  });