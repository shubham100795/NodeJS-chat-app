var socket=io();//when server down we see request being made for io connection in every quater of second

  socket.on('connect',function(){
    var params=jQuery.deparam(window.location.search);
    console.log('New connection to server made');
    socket.emit('join',params,function(err){
      if(err)
      {
        alert(err);
        window.location.href='/';
      }
      else {
        console.log('No error');
      }
    });
  });

  jQuery(document).ready(function() {
    
  jQuery('#message-form').on('submit',function(e){
    e.preventDefault();
    socket.emit('createMessage',{
      From:'User',
      Text:jQuery('[name=message]').val()
    },function(){
      jQuery('[name=message]').val('')//clearing text box
    });
    return false;
  });

  socket.on('newMessage',function(message){//received from server
    var formattedTime=moment(message.createdAt).format('h:mm a');
    var template=jQuery('#message-template').html();
    var html=Mustache.render(template,{
      Text:message.Text,
      From:message.From,
      createdAt:formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
  });

  var location=jQuery('#location-button');
  location.on('click',function(){
    if(!navigator.geolocation){
      return alert('Geolocation not supported by the browser!');
    }

    location.attr('disabled','disabled').text('Sending location...');

      navigator.geolocation.getCurrentPosition(function(position){
        location.removeAttr('disabled').text('Send location');
        socket.emit('sendLocation',{
          latitude:position.coords.latitude,
          longitude:position.coords.longitude
        });
      },function(){
        location.removeAttr('disabled').text('Send location');
        return alert('Unable to fetch location');
      });
  });

  socket.on('newLocationMessage',function(message){
  var formattedTime=moment(message.createdAt).format('h:mm a');
  var template=jQuery('#location-message-template').html();
  var html=Mustache.render(template,{
    Url:message.Url,
    From:message.From,
    createdAt:formattedTime
  });
  jQuery('#messages').append(html);
  scrollToBottom();
});

function scrollToBottom(){//we scroll for new messages if the user is near bottom..if he is viewing old messages we dont scroll
  //selectors
  var messages=jQuery('#messages');
  var newMessage=messages.children('li:last-child');
  //heights
  var clientHeight=messages.prop('clientHeight');
  var scrollTop=messages.prop('scrollTop');
  var scrollHeight=messages.prop('scrollHeight');
  var newMessageHeight=newMessage.innerHeight();
  var prevMessageHeight=newMessage.prev().innerHeight();

  if(clientHeight+scrollTop+newMessageHeight+prevMessageHeight>=scrollHeight){
    messages.scrollTop(scrollHeight);
  }
}
});//closing jquery ready


socket.on('disconnect',function(){
  console.log('Disconnected from server');
});


// socket.on('newEmailFromServer',function(data){
//   console.log('new email received',data);
// });
