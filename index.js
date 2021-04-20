console.clear();
const express = require('express');
const fs = require('fs')
const { createCanvas, loadImage, registerFont} = require('canvas')
registerFont('arial.ttf', { family: 'Arial' })
const expressip = require('express-ip');


const app = express();
app.set('trust proxy', true)
app.use(expressip().getIpInfoMiddleware);



///main image request
app.get('*', (req, res) => {
  var ip = req.ipInfo.ip;
  now = Date.now();


  //get query string message
  var mess = req.originalUrl.split('/');
  mess = mess[1];
  mess = clean(mess);


  //send message
  var ind = list.hasIP(ip);
  if (mess!='' && ind!=-1) {
    if (!mess.includes('=')) {
      if (ind!=-1) {
        if (list[ind].lastmess!=mess) {
          chat.unshift({ip:ip,message:mess});
        }
      }
    }
    //commands
    else {
      var url = req.originalUrl.replace(/\//g, ' ');
      var params = new URLSearchParams(url);

      //read
      var entries = params.entries();
      for(pair of entries) { 
        var cmd1 = rclean(pair[0]);
        var cmd2 = rclean(pair[1]);

        //set color
        if (cmd1=='color') {
          list[ind].color = '#'+cmd2.substring(0,6);
        }
        else if (cmd1=='name') {
          var cm = cmd2.substring(0,15);
          cm = rclean(cm)=='' ? '???' : cm;
          list[ind].name = cm;
        }
      }
    }
  }

  //add to list
  if (ind==-1) {
    list.push({
      ip:ip,
      visits:1,
      last:now,
      lastmess:mess,
      color:bg,
      name:'???'
      });
    ind = list.length-1;
  }
  else {
    list[ind].visits++
    list[ind].last = now;
    list[ind].lastmess = mess;
  }
  loadnum++




  //make image & send back
  makeImg(ind,req.ipInfo,f=()=>{

    res.sendFile(__dirname+'/test.png');
  });

});



/////start server
app.listen(3000, () => {
  console.log('server started');
});

///subdomains?


time = new Date();
//setup
let loadnum = 0;
let list = [];
let chat = [];
const width = 600
const height = 600
const canvas = createCanvas(width, height)
const ctx = canvas.getContext('2d')

listy = 105;
listx = 25;

chatx = 300;
chaty = 45;


spc = 16;
aboutlist = [
  "?color=f40385",
  "?name=jeff"
];
aboutx = 25;
abouty = 550-aboutlist.length*spc;
aboutspc = 85;


dark = '#000000'
light1 = '#ffffff'
bg = '#3574d4'
bg2 = '#2c60b0'


function makeImg(ind,you,loadFinished) {
  ctx.fillStyle = light1
  ctx.fillRect(0, 0, width, height)

  

  //background
  var brd = 15
  ctx.fillStyle = list[ind].color//bg
  ctx.fillRect(brd,brd,width-brd*2,height-brd*2)

  //chat bg
  ctx.fillStyle = bg2
  ctx.fillRect(chatx-5,chaty-5,width-(chatx-5)-brd,height-(chaty-5)-brd)

  
  //text
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = dark

  ctx.font = 'bold 30pt Arial'
  ctx.fillText("Image Chat!",25,20)
  ctx.font = 'bold 12pt Arial'
  ctx.fillText("To chat, add ?message to the URL",25,70)


  ctx.textAlign = 'right'
  ctx.font = 'bold 10pt Arial'
  ctx.fillText(time.toUTCString(),575,20)

  ctx.font = 'bold 12pt Arial'
  ctx.textAlign = 'left'
  ctx.fillText("Chat:",chatx,chaty)
  for(var i=0; i<chat.length; i++) {
    val = chat[i];
    if (val.ip == you.ip) {
      ctx.fillStyle = light1
    } else {
      ctx.fillStyle = dark
    }

    var find = list.hasIP(val.ip);
    var cname = find==-1 ? '???' : list[find].name;

    str = cname+">"+val.message;
    ctx.fillText(str,chatx,chaty+spc*1.5+i*spc)
  }

  ctx.fillStyle = dark
  ctx.fillText("Recent connections:", listx, listy)
 

  //make list
  var isyou = '';
  var str = '';
  var val;
  var lastm;
  for(var i=0; i<list.length; i++) {
    val = list[i];
    if (val.ip == you.ip) {
      ctx.fillStyle = light1
    } else {
      ctx.fillStyle = dark
    }

    lastm = Math.round((now-val.last)/1000);
    if (lastm>300) { //inactive for 5 mins
      list.splice(i,1);
    }
    lastm = lastm>6 ? ", last: "+lastm+"s" : "";

    str = val.name+": visits: "+val.visits+lastm;
    ctx.fillText(str,listx,listy+spc*1.5+i*spc)
  }

  //command list
  ctx.fillStyle = light1
  ctx.fillText("Try these:",aboutx,abouty)

  ctx.fillStyle = dark
  var arr = aboutlist;
  var val;
  var dy;
  for(var i=0; i<arr.length; i++) {
    val = arr[i];
    dy = abouty+spc*1.5+i*spc;
    ctx.fillText(val,aboutx,dy);
  }

  //connection data
  /*var arr = Object.entries(you);
  var val;
  var dy;
  for(var i=0; i<arr.length; i++) {
    val = arr[i];
    dy = abouty+spc*2+i*spc;
    ctx.fillText(val[0]+':',aboutx+200,dy);
    ctx.fillText(val[1],aboutx+200+aboutspc,dy);
  }*/


  //make image
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync('./test.png', buffer)

  //done
  loadFinished();
}

Array.prototype.hasIP = function(val) {
  for(var i=0; i<this.length; i++) {
    if (this[i].ip==val) {
      return i;
    }
  }
  return -1;
}
function clean(str) {
  str=str.replace(/%20/g, ' ');
  str=str.replace(/_/g, ' ');
  str=str.replace(/\//g, ' ');
  str=str.replace(/\?/g, ' ');
  return str;
}
function rclean(str) {
  str=str.replace(/%20/g, '');
  str=str.replace(/_/g, '');
  str=str.replace(/\//g, '');
  str=str.replace(/\?/g, '');
  str=str.replace(/#/g, '');
  str=str.replace(/ /g, '');
  return str;
}