/* Explore Bharat — GitHub Pages install and offline worker registration. */
document.addEventListener("DOMContentLoaded",()=>{
 "use strict";
 const status=document.createElement("div");
 status.className="bharat-network-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
 status.textContent="You are offline. Previously cached parts of Explore Bharat remain available.";
 document.body.appendChild(status);
 function updateNetwork(){status.classList.toggle("is-visible",!navigator.onLine);}
 addEventListener("online",updateNetwork);addEventListener("offline",updateNetwork);updateNetwork();

 if("serviceWorker" in navigator && location.protocol==="https:"){
   navigator.serviceWorker.register("./service-worker.js",{scope:"./"}).catch(error=>{
     console.warn("Explore Bharat offline support could not be registered.",error);
   });
 }
 let deferredPrompt=null;
 addEventListener("beforeinstallprompt",event=>{
   event.preventDefault();deferredPrompt=event;
   let button=document.getElementById("bharatInstallButton");
   if(!button){
     button=document.createElement("button");button.id="bharatInstallButton";button.type="button";
     button.className="bharat-install-button";button.textContent="Install Explore Bharat";
     button.addEventListener("click",async()=>{
       if(!deferredPrompt)return;
       deferredPrompt.prompt();
       try{await deferredPrompt.userChoice;}catch(error){console.warn(error);}
       deferredPrompt=null;button.remove();
     });
     document.body.appendChild(button);
   }
 });
 addEventListener("appinstalled",()=>{
   document.getElementById("bharatInstallButton")?.remove();
   deferredPrompt=null;
 });
});
