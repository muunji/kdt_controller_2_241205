window.addEventListener("beforeunload",function(event){
  fetch("/fileReset",{method:"DELETE"})
  .then((response)=>console.log("file reset"))
  .catch((error)=> console.error("error",error));
});