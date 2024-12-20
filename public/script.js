//navigation 타입 데이터
const reTry = performance.getEntriesByType('navigation');

//새로고침 / f5 눌렀을 때
if(reTry.length>0 && reTry[0].type === 'reload'){
  //새로고침 요청 감지
  fetch('/reset',{method:"POST"})
    .then((res)=>res.json())
    .then((data)=>{
      if(data.success){
        console.log('데이터 초기화 완료');
        //데이터 재요청 후 UI 갱신
        fetchDataAndUpdateUI();
      }else{
        console.error('데이터 초기화 실패',data.error);
      }
    })
    .catch((err)=>console.error("요청 실패",err));
};

//서버와 웹소켓 연결
//클라이언트에서 서버로 메시지를 보내는 코드
const socket = new WebSocket("ws://localhost:3000");

//서버에서 데이터 전송 시
//클라이언트에서 서버로부터 메시지를 받는 코드
socket.addEventListener("message",(event)=>{
  //서버에서 받은 데이터 파싱
  const data = JSON.parse(event.data);
  console.log("new data:",data);

  //데이터를 HTML에 실시간으로 출력
  const dataDiv = document.getElementById('data');
  //기존 내용 초기화
  dataDiv.innerHTML='';

  data.forEach((value)=>{
    const p =document.createElement("p");
    //저장된 데이터 중 'about' 값 출력
    p.textContent = `${value.id} : ${value.about}`;
    dataDiv.appendChild(p);
  });
});