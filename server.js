const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "rooms.json");
app.use(express.json({limit:"10kb"}));
app.use(express.static(path.join(__dirname,"public")));

let rooms = {};
try { if (fs.existsSync(DATA_FILE)) rooms = JSON.parse(fs.readFileSync(DATA_FILE,"utf8")); } catch(e) { console.error("Could not read rooms.json",e); }
function saveRooms(){ fs.writeFileSync(DATA_FILE, JSON.stringify(rooms,null,2)); }
function cleanName(v){ return String(v||"").trim().slice(0,24); }
function validRoom(id){ return /^[a-f0-9-]{36}$/i.test(id); }

app.post("/api/rooms", async (req,res)=>{
  const password=String(req.body.password||"");
  const name=cleanName(req.body.name);
  if(password.length<6 || password.length>100) return res.status(400).json({error:"Password must be 6–100 characters."});
  if(!name) return res.status(400).json({error:"Enter your name."});
  const id=crypto.randomUUID();
  rooms[id]={id,passwordHash:await bcrypt.hash(password,12),createdAt:Date.now(),messages:[]};
  saveRooms();
  res.json({id,url:`${req.protocol}://${req.get("host")}/room/${id}`});
});
app.get("/room/:id",(req,res)=>{
  if(!validRoom(req.params.id) || !rooms[req.params.id]) return res.status(404).sendFile(path.join(__dirname,"public","not-found.html"));
  res.sendFile(path.join(__dirname,"public","index.html"));
});
app.get("/api/rooms/:id",(req,res)=>{
  const r=rooms[req.params.id];
  if(!r) return res.status(404).json({error:"Room not found."});
  res.json({exists:true});
});

io.on("connection", socket=>{
  socket.on("room:join", async ({roomId,password,name}={})=>{
    const room=rooms[roomId];
    if(!room){socket.emit("room:error","This chat room does not exist.");return;}
    const ok=await bcrypt.compare(String(password||""),room.passwordHash);
    if(!ok){socket.emit("room:error","Incorrect password. Please try again.");return;}
    const username=cleanName(name);
    if(!username){socket.emit("room:error","Please enter your name.");return;}
    socket.join(roomId);
    socket.data.roomId=roomId;
    socket.data.username=username;
    socket.emit("room:joined",{messages:room.messages.slice(-100),name:username});
    socket.to(roomId).emit("chat:notice",`${username} joined the room.`);
  });
  socket.on("chat:message",({text}={})=>{
    const roomId=socket.data.roomId, room=rooms[roomId];
    const message=String(text||"").trim().slice(0,1000);
    if(!room || !message) return;
    const item={id:crypto.randomUUID(),name:socket.data.username,text:message,at:Date.now()};
    room.messages.push(item);
    if(room.messages.length>300) room.messages=room.messages.slice(-300);
    saveRooms();
    io.to(roomId).emit("chat:message",item);
  });
  socket.on("disconnect",()=>{
    const roomId=socket.data.roomId;
    if(roomId) socket.to(roomId).emit("chat:notice",`${socket.data.username} left the room.`);
  });
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
server.listen(PORT,()=>console.log(`text chat running on port ${PORT}`));
