const revokeButton=document.getElementById("revoke");
if(revokeButton){
  revokeButton.addEventListener("click",async()=>{
    const result=document.getElementById("result");
    revokeButton.disabled=true;
    result.textContent="Sending deletion request…";
    try{
      const response=await window.kuruTelemetry?.revoke?.();
      if(response?.removed){
        result.textContent="Consent withdrawn. The server confirmed deletion of the data associated with this browser.";
        console.info("[Kuru Telemetry] Deletion request completed successfully");
      }else{
        result.textContent="Consent was withdrawn locally, but the server did not confirm deletion. Please try again later.";
        console.warn("[Kuru Telemetry] The server did not confirm data deletion");
      }
    }catch(error){
      result.textContent="The request could not be completed. Check your connection and try again.";
      console.error("[Kuru Telemetry] Consent withdrawal failed",String(error));
    }finally{revokeButton.disabled=false;}
  });
}