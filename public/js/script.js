var socket=io();//when server down we see request being made for io connection in every quater of second
socket.on('connect',function(){
  console.log('New connection to server made');
  //socket.emit('newEmailFromClient',{From:'Client',To:'Server'});//create email only when server connected
});

jQuery(document).ready(function() {

  jQuery('#message-form').on('submit',function(e){
    e.preventDefault();
    socket.emit('createMessage',{
      From:'User',
      Text:jQuery('[name=message]').val()
    });
    return false;
  });

  socket.on('newMessage',function(message){//received from server
    console.log('New message received',message);
    var li=jQuery('<li></li>');
    li.text(`From:${message.From}: ${message.Text}`);
    jQuery('#messages').append(li);
  });

  var location=jQuery('#location-button');
  location.on('click',function(){
    if(!navigator.geolocation){
      return alert('Geolocation not supported by the browser!');
    }
    else {
      navigator.geolocation.getCurrentPosition(function(position){
        socket.emit('sendLocation',{
          latitude:position.coords.latitude,
          longitude:position.coords.longitude
        });
      },function(){
        return alert('Unable to fetch location');
      })
    }
  });

  socket.on('newLocationMessage',function(message){
  var li=jQuery("<li></li>");
  var a=jQuery('<a target="_blank">My current location</a>');
  li.text(`From:${message.From}:`);
  a.attr('href',message.Url);
  li.append(a);
  jQuery('#messages').append(li);
  });

});


socket.on('disconnect',function(){
  console.log('Disconnected from server');
});


// socket.on('newEmailFromServer',function(data){
//   console.log('new email received',data);
// });
