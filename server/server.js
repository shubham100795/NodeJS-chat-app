const path=require('path');
const publicPath=path.join(__dirname,'../public');
var express=require('express');

var app=express();
var port=process.env.PORT||3000;

app.use(express.static(publicPath));

app.listen(port,()=>{
  console.log(`Server up at port ${port}`);
});
