const revokeButton=document.getElementById("revoke");
if(revokeButton){
  revokeButton.addEventListener("click",async()=>{
    const result=document.getElementById("result");
    revokeButton.disabled=true;
    result.textContent="Отправляем запрос на удаление…";
    try{
      const response=await window.kuruTelemetry?.revoke?.();
      if(response?.removed){
        result.textContent="Согласие отозвано. Сервер подтвердил удаление данных, связанных с этим браузером.";
        console.info("[Kuru Telemetry] Запрос удаления завершён успешно");
      }else{
        result.textContent="Согласие отозвано локально, но сервер не подтвердил удаление. Попробуйте ещё раз позже.";
        console.warn("[Kuru Telemetry] Сервер не подтвердил удаление данных");
      }
    }catch(error){
      result.textContent="Не удалось завершить запрос. Проверьте соединение и попробуйте снова.";
      console.error("[Kuru Telemetry] Ошибка отзыва согласия",String(error));
    }finally{revokeButton.disabled=false;}
  });
}