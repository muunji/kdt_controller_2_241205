window.addEventListener("unload",function(event){
  fetch("/fileReset",{method:"DELETE"})
  .then((response)=>{if(response.ok){console.log("file reset")}})
  .catch((error)=> {console.error("error",error)});


  //페이지를 떠날 때 아무런 동작도 없도록 반환값 설정
  return undefined;
});