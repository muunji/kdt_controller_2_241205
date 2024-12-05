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
    //data가 들어오는 곳
    let body = "";
    //form data
    if(req.url === "/text") {
      req.on("data",(chunk)=>{
        body+=chunk.toString('utf-8');
      });
      req.on("end",()=>{
        console.log(body);

        if(body!==""){
          fs.writeFile("text.txt",body,'utf-8',(err)=>{
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

        res.end();
      })
    }
  }
})
.listen(PORT,()=>{
  console.log("http://localhost:3000");
})