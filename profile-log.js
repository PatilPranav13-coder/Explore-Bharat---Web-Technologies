/* Explore Bharat profile and consent-based, device-local travel journal. */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const ACTIVE_KEY="exploreBharat.activeProfile.v1";
  const PROFILE_PREFIX="exploreBharat.profile.v1:";
  const LOG_PREFIX="exploreBharat.travelLog.v1:";
  const MAX_ENTRIES=150;
  const $=(id)=>document.getElementById(id);
  const backdrop=$("profileBackdrop"),openButton=$("profileOpen"),closeButton=$("profileClose");
  const form=$("profileDetailsForm"),status=$("profileFormStatus"),logList=$("profileLogList"),consent=$("profileTrackingConsent");
  let activeEmail="",lastFocus=null;
  if(!backdrop||!form)return;

  function read(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(error){console.warn("Explore Bharat profile read failed",error);return fallback;}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(error){console.warn("Explore Bharat profile save failed",error);return false;}}
  const profileKey=(email)=>PROFILE_PREFIX+encodeURIComponent(String(email||"").trim().toLowerCase());
  const logKey=(email)=>LOG_PREFIX+encodeURIComponent(String(email||"").trim().toLowerCase());
  const profileFor=(email=activeEmail)=>email?read(profileKey(email),null):null;
  const logFor=(email=activeEmail)=>{const value=email?read(logKey(email),[]):[];return Array.isArray(value)?value:[];};
  const activeProfile=()=>{const p=profileFor();return p?.activityTracking===true?p:null;};
  function setActive(email){activeEmail=String(email||"").trim().toLowerCase();try{localStorage.setItem(ACTIVE_KEY,activeEmail);}catch(error){console.warn(error);}}
  function formatDate(value,withTime=true){try{return new Intl.DateTimeFormat("en-IN",withTime?{dateStyle:"medium",timeStyle:"short"}:{dateStyle:"medium"}).format(new Date(value));}catch{return String(value||"—");}}

  function prefillRegistration(profile){
    if(!profile)return;
    [["fullName",profile.name],["email",profile.email],["phone",profile.phone]].forEach(([id,value])=>{const field=$(id);if(field&&!field.value)field.value=value||"";});
  }

  function render(){
    const profile=profileFor(),entries=logFor(),enabled=profile?.activityTracking===true;
    if(profile){
      $("profileName").value=profile.name||"";$("profileEmail").value=profile.email||"";$("profilePhone").value=profile.phone||"";
      consent.checked=enabled;
      prefillRegistration(profile);
      openButton.querySelector(".profile-trigger-copy strong").textContent=profile.name?.split(/\s+/)[0]||"My Profile";
    }else{
      form.reset();openButton.querySelector(".profile-trigger-copy strong").textContent="My Profile";
    }
    $("profileActivityCount").textContent=String(entries.length);
    $("profileTripCount").textContent=String(entries.filter(e=>["Trip recommendation","Journey registration"].includes(e.title)).length);
    $("profileJoinedDate").textContent=profile?.createdAt?formatDate(profile.createdAt,false):"—";
    logList.replaceChildren();
    const empty=document.createElement("p");empty.className="profile-log-empty";
    if(!enabled)empty.textContent="Your activity log is off. Save your profile and tick the travel-log consent box to start recording activity on this device.";
    else if(!entries.length)empty.textContent="Your profile is ready. Explore destinations, culture, packages or the trip planner. Your activity will appear here.";
    if(!enabled||!entries.length)logList.appendChild(empty);
    else entries.slice().reverse().forEach(entry=>{
      const card=document.createElement("article");card.className="profile-log-entry";
      const title=document.createElement("strong");title.textContent=entry.title||"Travel activity";
      const detail=document.createElement("p");detail.textContent=entry.detail||"";
      const time=document.createElement("time");time.dateTime=entry.createdAt||"";time.textContent=formatDate(entry.createdAt);
      card.append(title,detail,time);logList.appendChild(card);
    });
    $("profileExportLog").disabled=!enabled||!entries.length;
    $("profileClearLog").disabled=!enabled||!entries.length;
    $("profileForget").disabled=!profile;
  }

  function record(title,detail){
    const profile=activeProfile();if(!profile)return;
    const entries=logFor(),now=new Date().toISOString(),last=entries[entries.length-1];
    if(last&&last.title===title&&last.detail===detail&&Date.now()-new Date(last.createdAt).getTime()<1500)return;
    entries.push({id:window.crypto?.randomUUID?.()||"eb-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),title:String(title).slice(0,100),detail:String(detail||"").slice(0,500),createdAt:now});
    if(entries.length>MAX_ENTRIES)entries.splice(0,entries.length-MAX_ENTRIES);
    write(logKey(),entries);render();
  }

  function openDrawer(){lastFocus=document.activeElement;render();backdrop.hidden=false;document.body.style.overflow="hidden";closeButton.focus();}
  function closeDrawer(){backdrop.hidden=true;document.body.style.overflow="";if(lastFocus?.focus)lastFocus.focus();}
  openButton?.addEventListener("click",openDrawer);closeButton?.addEventListener("click",closeDrawer);
  backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeDrawer();});
  document.addEventListener("keydown",e=>{if(!backdrop.hidden&&e.key==="Escape")closeDrawer();});

  form.addEventListener("submit",event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const values=Object.fromEntries(new FormData(form)),email=String(values.email||"").trim().toLowerCase(),old=profileFor(email),now=new Date().toISOString();
    const profile={name:String(values.name||"").trim(),email,phone:String(values.phone||"").trim(),activityTracking:consent.checked,createdAt:old?.createdAt||now,updatedAt:now};
    if(!profile.activityTracking){status.textContent="Please agree to the local travel log to save your profile.";return;}
    if(!write(profileKey(email),profile)){status.textContent="Could not save profile. Check browser storage settings.";return;}
    setActive(email);
    const log=logFor(email);
    if(!log.length){log.push({id:"profile-created-"+Date.now(),title:"Profile created",detail:"Your Explore Bharat travel journal was enabled on this device.",createdAt:now});write(logKey(email),log);}
    status.textContent="Profile saved on this device. Your travel log is active.";render();
  });

  $("profileClearLog").addEventListener("click",()=>{
    if(!activeEmail||!confirm("Clear the travel log saved for this profile on this device?"))return;
    write(logKey(),[]);status.textContent="Your local travel log has been cleared.";render();
  });
  $("profileForget").addEventListener("click",()=>{
    if(!activeEmail||!confirm("Remove this profile and its local travel log from this browser? This cannot be undone."))return;
    try{localStorage.removeItem(profileKey());localStorage.removeItem(logKey());localStorage.removeItem(ACTIVE_KEY);}catch(error){status.textContent="Could not remove local profile data.";return;}
    activeEmail="";status.textContent="Profile and travel log removed from this device.";render();
  });
  $("profileExportLog").addEventListener("click",()=>{
    const profile=profileFor();if(!profile)return;
    const blob=new Blob([JSON.stringify({product:"Explore Bharat",exportedAt:new Date().toISOString(),storage:"This browser only",profile,travelLog:logFor()},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="explore-bharat-travel-log.json";
    document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
  });

  // Record user-initiated interactions only after consent.
  document.addEventListener("click",event=>{
    const destination=event.target.closest(".destination-card");
    if(destination){record("Destination explored",(destination.querySelector("h3")?.textContent.trim()||"Destination")+" — opened destination details.");return;}
    const culture=event.target.closest(".culture-tab");
    if(culture){record("Culture explored",culture.textContent.trim()+" category selected.");return;}
    const packageCard=event.target.closest(".featured-card");
    if(packageCard){record("Tour package explored",(packageCard.querySelector("h3")?.textContent.trim()||"Tour package")+" — viewed sample package details.");return;}
    const style=event.target.closest(".travel-style-card");
    if(style)record("Travel style selected",style.querySelector("h3")?.textContent.trim()||"Travel style");
  },true);

  $("findTripBtn")?.addEventListener("click",()=>{
    setTimeout(()=>{
      const result=$("tripResult");if(!result||result.hidden)return;
      const title=$("resultTitle").textContent.trim()||"Trip recommendation";
      const budget=$("tripBudget").selectedOptions[0]?.textContent||"";
      const duration=$("tripDuration").selectedOptions[0]?.textContent||"";
      const style=$("tripStyle").selectedOptions[0]?.textContent||"";
      record("Trip recommendation",title+". Budget: "+budget+"; Duration: "+duration+"; Travel style: "+style+".");
    },0);
  });
  $("planDestination")?.addEventListener("click",()=>{
    const name=$("modalTitle")?.textContent.trim();if(name)record("Journey planning started","Started registration for "+name+".");
  });

  const registration=$("registrationForm");
  if(registration){
    // Capture the contact fields before the original registration handler resets them.
    document.addEventListener("submit",event=>{
      if(event.target!==registration)return;
      const data={name:$("fullName").value.trim(),email:$("email").value.trim().toLowerCase(),phone:$("phone").value.trim(),destination:$("registrationDestination").value,travelDate:$("travelDate").value};
      if($("saveRegistrationToProfile")?.checked&&data.name&&data.email){
        const now=new Date().toISOString(),previous=profileFor(data.email);
        const p={name:data.name,email:data.email,phone:data.phone,activityTracking:true,createdAt:previous?.createdAt||now,updatedAt:now};
        if(write(profileKey(data.email),p)){
          setActive(data.email);
          record("Journey registration","Registered interest in "+data.destination+". Preferred travel date: "+(data.travelDate||"Not specified")+".");
          setTimeout(()=>{const msg=$("registrationMessage");if(msg)msg.textContent+=" Your profile and travel log were saved on this device.";},0);
        }
      }else if(activeProfile()){
        record("Journey registration","Registered interest in "+data.destination+". Preferred travel date: "+(data.travelDate||"Not specified")+".");
      }
    },true);
  }

  document.addEventListener("explore-bharat:assistant-action",event=>{
    const detail=event.detail||{};
    if(detail.title&&detail.detail)record(String(detail.title).slice(0,100),String(detail.detail).slice(0,500));
  });

  const searchForm=$("siteSearchForm"),searchInput=$("siteSearchInput");
  searchForm?.addEventListener("submit",()=>{
    const query=searchInput?.value.trim();if(query)record("Website search","Searched Explore Bharat for: "+query);
  },true);

  try{const saved=localStorage.getItem(ACTIVE_KEY)||"";if(saved&&profileFor(saved))setActive(saved);}catch(error){console.warn("Explore Bharat local storage unavailable.",error);}
  render();
});
