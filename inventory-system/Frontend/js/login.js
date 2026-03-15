const AUTH_API = "http://localhost:3000/auth/login"

async function login(){

const username = document.getElementById("username").value.trim()
const password = document.getElementById("password").value

if(!username || !password){
alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน")
return
}

try{

const res = await fetch(AUTH_API,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
username,
password
})
})

const contentType = res.headers.get("content-type") || ""
const data = contentType.includes("application/json")
? await res.json()
: { message:"ไม่สามารถเข้าสู่ระบบได้" }

if(res.ok && data.token){
localStorage.setItem("token",data.token)
localStorage.setItem("username",data.username || username)
window.location.href="index.html"
return
}

alert(data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")

}catch(err){
console.error("Login failed:",err)
alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้")
}

}
