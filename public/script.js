//navigation 타입 데이터
const reTry = performance.getEntriesByType('navigation');

//새로고침 / f5 눌렀을 때
if(reTry.length>0 && reTry[0].type === 'reload'){

  //새로고침 요청 감지지
  fetch('/reset',{method:"POST"})
    .then(()=>console.log("새로고침 요청 보냄"))
    .catch((err)=>console.error("요청 실패",err));
};