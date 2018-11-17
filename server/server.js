const path=require('path');
var express=require('express');
var http=require('http');
var socketIO=require('socket.io');
var moment=require('moment');
var port=process.env.PORT||3000;

var app=express();

var server=http.createServer(app);
const publicPath=path.join(__dirname,'../public');
app.use(express.static(publicPath));

var io=socketIO(server);//io is a server instance

io.on('connection',(socket)=>{//socket is an object for each indivisual user
  console.log('New user connected');

  socket.on('join',(params,callback)=>{
    if(!(typeof(params.name)==='string'&&params.name.trim().length>0)||!(typeof(params.room)==='string'&&params.room.trim().length>0)){
      callback('Name and room name need to be specified as non empty string');
    }
    socket.join(params.room);//join by rooms
    socket.emit('newMessage',{From:'Admin',Text:'Welcome to the chat app!'});
    console.log('Reached here');
    socket.broadcast.to(params.room).emit('newMessage',{From:'Admin',Text:`${params.name} joined the room.`});
    callback();
  });

  socket.on('createMessage',(message,callback)=>{
    console.log('User created new message',message);
    io.emit('newMessage',{From:message.From,Text:message.Text,createdAt:moment().valueOf()});//emit sends to all users
    callback();
  });

  socket.on('sendLocation',(position)=>{
    io.emit('newLocationMessage',{
      From:'User',
      Url:`https://www.google.com/maps?q=${position.latitude},${position.longitude}`,
      createdAt:moment().valueOf()
    });
  });

  socket.on('disconnect',()=>{
    console.log('Disconnected');
  });
});
server.listen(port,()=>{
  console.log(`Server up at port ${port}`);
});
