/* =====================================
  SUPABASE 설정
===================================== */

const SUPABASE_URL =
"https://tvyugimlmiceiaqtkjfn.supabase.co/rest/v1/";

const SUPABASE_ANON_KEY =
"sb_publishable_bEwqlnNI4VKGiSgqaRvqpg_6GEENJ-g";
const ADMIN_EMAIL = "buyeonjo19@gmail.com";


/* =====================================
  D-DAY
===================================== */

function updateCountdown() {

const now = new Date();

let target = new Date(
now.getFullYear(),
7,
26,
0,
0,
0
);

// 올해 생일이 지나면 내년 생일
if (now > target) {
target = new Date(
now.getFullYear() + 1,
7,
26,
0,
0,
0
);
}

const difference = target - now;

const day = Math.floor(
difference / (1000 * 60 * 60 * 24)
);

const hour = Math.floor(
(difference / (1000 * 60 * 60)) % 24
);

const minute = Math.floor(
(difference / (1000 * 60)) % 60
);

const second = Math.floor(
(difference / 1000) % 60
);


document.getElementById("days").textContent =
String(day).padStart(2, "0");

document.getElementById("hours").textContent =
String(hour).padStart(2, "0");

document.getElementById("minutes").textContent =
String(minute).padStart(2, "0");

document.getElementById("seconds").textContent =
String(second).padStart(2, "0");


// 8월 26일이면 특별 문구
if (
now.getMonth() === 7 &&
now.getDate() === 26
) {

document.getElementById(
"countdown-title"
).textContent =
"TODAY IS SEUNGMIN DAY! 💙";

document.getElementById(
"countdown"
).innerHTML = `
     <strong
       style="
         font-family:Jua;
         font-size:28px;
       "
     >
       HAPPY BIRTHDAY 🎂
     </strong>
   `;
}

}


updateCountdown();

setInterval(
updateCountdown,
1000
);



/* =====================================
  응원 전광판
===================================== */

const cheerDisplay =
document.getElementById("cheer-display");

const cheerInput =
document.getElementById("cheer-input");

const cheerForm =
document.getElementById("cheer-form");

const cheerCount =
document.getElementById("cheer-count");


let cheers = [
"HAPPY BIRTHDAY, SEUNGMIN!",
"승민아 생일 축하해!",
"우리의 #28 💙",
"ALWAYS CHEER FOR #28!"
];

let cheerIndex = 0;


function showCheer(text) {

cheerDisplay.style.opacity = "0";

setTimeout(() => {

cheerDisplay.textContent =
text.toUpperCase();

cheerDisplay.style.opacity = "1";

}, 200);

}


setInterval(() => {

if (cheers.length === 0) return;

showCheer(
cheers[cheerIndex]
);

cheerIndex++;

if (cheerIndex >= cheers.length) {
cheerIndex = 0;
}

}, 4000);



/* 응원 문구 등록 */

cheerForm.addEventListener(
"submit",
function(event) {

event.preventDefault();

const text =
cheerInput.value.trim();

if (!text) return;


cheers.unshift(text);

cheerCount.textContent =
`${cheers.length} CHEERS`;

showCheer(text);

cheerInput.value = "";

}
);



/* =====================================
  롤링페이퍼 - SUPABASE
===================================== */

const guestbookForm =
document.getElementById(
"guestbook-form"
);

const nicknameInput =
document.getElementById(
"nickname"
);

const messageInput =
document.getElementById(
"message"
);

const messages =
document.getElementById(
"messages"
);

const messageCount =
document.getElementById(
"message-count"
);


let guestbook = [];


/* HTML 공격 방지 */

function escapeHTML(text) {

return String(text)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");

}



/* =====================================
  저장된 편지 불러오기
===================================== */

async function loadGuestbook() {

try {

const response = await fetch(
`${SUPABASE_URL}guestbook?select=*&order=created_at.desc`,
{
method: "GET",

headers: {
apikey: SUPABASE_ANON_KEY,
Authorization:
`Bearer ${SUPABASE_ANON_KEY}`
}
}
);


if (!response.ok) {

const errorText =
await response.text();

throw new Error(
errorText || "편지를 불러오지 못했습니다."
);

}


guestbook =
await response.json();


renderMessages();


} catch (error) {

console.error(
"Supabase 불러오기 오류:",
error
);

messages.innerHTML = `
     <div class="loading">
       편지를 불러오지 못했어요 😢
     </div>
   `;

}

}



/* =====================================
  메시지 화면 출력
===================================== */

function renderMessages() {

messageCount.textContent =
String(
guestbook.length
).padStart(3, "0");


if (guestbook.length === 0) {

messages.innerHTML = `
     <div class="loading">
       첫 번째 편지를 남겨주세요 💌
     </div>
   `;

return;
}


messages.innerHTML =
guestbook
.map(item => {

return `
         <article class="message-card">

           <div class="nickname">
             💙 ${escapeHTML(
               item.nickname
             )}
           </div>

           <p>
             ${escapeHTML(
               item.message
             )}
           </p>

         </article>
       `;

})
.join("");

}



/* =====================================
  메시지 등록
  → Supabase에 영구 저장
===================================== */

guestbookForm.addEventListener(
"submit",
async function(event) {

event.preventDefault();


const nickname =
nicknameInput.value.trim();

const message =
messageInput.value.trim();


if (!nickname || !message) {
return;
}


try {

const response = await fetch(
`${SUPABASE_URL}guestbook`,
{
method: "POST",

headers: {

"Content-Type":
"application/json",

apikey:
SUPABASE_ANON_KEY,

Authorization:
`Bearer ${SUPABASE_ANON_KEY}`,

Prefer:
"return=representation"

},

body: JSON.stringify({
nickname: nickname,
message: message
})
}
);


if (!response.ok) {

const errorText =
await response.text();

throw new Error(
errorText || "편지 저장 실패"
);

}


const newMessage =
await response.json();


/*
      * 방금 작성한 편지를
      * 화면에도 바로 추가
      */

if (
Array.isArray(newMessage) &&
newMessage.length > 0
) {

guestbook.unshift(
newMessage[0]
);

} else {

guestbook.unshift({
nickname: nickname,
message: message
});

}


nicknameInput.value = "";
messageInput.value = "";


renderMessages();


} catch (error) {

console.error(
"Supabase 저장 오류:",
error
);

alert(
"편지를 저장하지 못했어요 😢\n잠시 후 다시 시도해주세요."
);

}

}
);



/* =====================================
  사이트를 열면
  Supabase에서 편지 불러오기
===================================== */

loadGuestbook();



/* =====================================
  가상 티켓
===================================== */

const ticketName =
document.getElementById(
"ticket-name"
);

const ticketOwner =
document.getElementById(
"ticket-owner"
);

const ticketCode =
document.getElementById(
"ticket-code"
);

const makeTicket =
document.getElementById(
"make-ticket"
);

const ticketCard =
document.getElementById(
"ticket-card"
);


makeTicket.addEventListener(
"click",
function() {

let name =
ticketName.value.trim();


if (!name) {
name = "YOUR NAME";
}


const randomNumber =
Math.floor(
Math.random() * 900
) + 100;


ticketOwner.textContent =
name.toUpperCase();


ticketCode.textContent =
`28-0826-${randomNumber}`;


ticketCard.animate(
[
{
transform:
"rotate(2deg) scale(0.96)"
},

{
transform:
"rotate(0deg) scale(1)"
}
],
{
duration: 500,
easing:
"cubic-bezier(.2,.8,.2,1)"
}
);

}
);
