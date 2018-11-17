const path=require('path');
var express=require('express');
var http=require('http');
var socketIO=require('socket.io');
var moment=require('moment');
var port=process.env.PORT||3000;
var {Users}=require('../public/js/users.js');
var app=express();
var users=new Users();
//we store all the users belonging to any room inside the same object.
var server=http.createServer(app);
const publicPath=path.join(__dirname,'../public');
app.use(express.static(publicPath));

var io=socketIO(server);//io is a server instance

io.on('connection',(socket)=>{//socket is an object for each indivisual user
  console.log('New user connected');

  socket.on('join',(params,callback)=>{
    if(!(typeof(params.name)==='string'&&params.name.trim().length>0)||!(typeof(params.room)==='string'&&params.room.trim().length>0)){
      return callback('Name and room name need to be specified as non empty string');
    }

    socket.join(params.room);//join by rooms
    users.removeUser(socket.id);//remove user from any another room
    users.addUser(socket.id,params.name,params.room);//updating userlist
    io.to(params.room).emit('updateUserList',users.getUserList(params.room));//sending list to everyone
    socket.emit('newMessage',{From:'Admin',Text:'Welcome to the chat app!'});
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
    var user=users.removeUser(socket.id);
    if(user){
      io.to(user.room).emit('updateUserList',users.getUserList(user.room));//sending updated list
      io.to(user.room).emit('newMessage',{From:'Admin',Text:`${user.name} has left the room.`});
    }
  });
});
server.listen(port,()=>{
  console.log(`Server up at port ${port}`);
});
