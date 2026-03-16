const AUTH_API = `${window.location.origin}/auth/login`

async function login(){
const username = document.getElementById("username").value.trim()
const password = document.getElementById("password").value

if(!username || !password){
alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน")
return
}

try{
const response = await fetch(AUTH_API,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
username,
password
})
})

const contentType = response.headers.get("content-type") || ""
const data = contentType.includes("application/json")
? await response.json()
: { message:"ไม่สามารถเข้าสู่ระบบได้" }

if(!response.ok){
alert(data.message || "เข้าสู่ระบบไม่สำเร็จ")
return
}

localStorage.setItem("token", data.token)
localStorage.setItem("username", data.username)
localStorage.setItem("role", data.role || "staff")
window.location.href = "index.html"
}catch(error){
console.error("Login failed:",error)
alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้")
}
}