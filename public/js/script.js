var socket=io();//when server down we see request being made for io connection in every quater of second
socket.on('connect',function(){
  console.log('New connection to server made');
  //socket.emit('newEmailFromClient',{From:'Client',To:'Server'});//create email only when server connected
});

socket.on('newMessage',function(message){//received from server
  console.log('New message received',message);
});

socket.on('disconnect',function(){
  console.log('Disconnected from server');
});

// socket.on('newEmailFromServer',function(data){
//   console.log('new email received',data);
// });
//emit createMessage from console.//sent to server
