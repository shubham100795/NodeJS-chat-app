const path=require('path');
var express=require('express');
var http=require('http');
var socketIO=require('socket.io');
var moment=require('moment');
var port=process.env.PORT||3000;
var {Users}=require('../public/js/users.js');
var app=express();
var dl=require('delivery');
var fs=require('fs');
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
    var user=users.getUser(socket.id);
    if(user&&message.Text!='')
    {
      io.to(user.room).emit('newMessage',{From:user.name,Text:message.Text,createdAt:moment().valueOf()});//emit sends to all users
    }

    callback();
  });

  socket.on('sendLocation',(position)=>{
    var user=users.getUser(socket.id);
    if(user)
    {
      io.to(user.room).emit('newLocationMessage',{
        From:user.name,
        Url:`https://www.google.com/maps?q=${position.latitude},${position.longitude}`,
        createdAt:moment().valueOf()
      });
    }
  });

  var delivery = dl.listen(socket);
    delivery.on('receive.success',function(file){
      var params = file.params;
      fs.writeFile(`images/${file.name}`,file.buffer, function(err){
        if(err){
          console.log('File could not be saved.');
        }else{
          var user=users.getUser(socket.id);
          fs.readFile(__dirname +`/images/${file.name}`, function(err, buf){

          io.to(user.room).emit('image',{image: true, buffer: buf.toString('base64'),From:user.name,createdAt:moment().valueOf()});
          console.log('image file is initialized');
        });
        }
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
