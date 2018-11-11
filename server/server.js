const path=require('path');
var express=require('express');
var http=require('http');
var socketIO=require('socket.io');
var port=process.env.PORT||3000;

var app=express();

var server=http.createServer(app);
const publicPath=path.join(__dirname,'../public');
app.use(express.static(publicPath));

var io=socketIO(server);//io is a server instance

io.on('connection',(socket)=>{//socket is an object for each indivisual user
  console.log('New user connected');

  // socket.emit('newEmailFromServer',{From:'Server',To:'Client'});
  //
  // socket.on('newEmailFromClient',(data)=>{
  //   console.log('Client sent a new email',data);
  // });
  socket.emit('newMessage',{From:'Admin',Text:'Welcome to the chat app!'});

  socket.broadcast.emit('newMessage',{From:'Admin',Text:'New user joined!'});

  socket.on('createMessage',(message)=>{
    console.log('User created new message',message);
    io.emit('newMessage',{From:message.From,Text:message.Text,createdAt:new Date()});//emit sends to all users
  });

  socket.on('sendLocation',(position)=>{
    io.emit('newLocationMessage',{
      From:'User',
      Url:`https://www.google.com/maps?q=${position.latitude},${position.longitude}`,
      createdAt:new Date()
    });
  });

  socket.on('disconnect',()=>{
    console.log('Disconnected');
  });
});
server.listen(port,()=>{
  console.log(`Server up at port ${port}`);
});
