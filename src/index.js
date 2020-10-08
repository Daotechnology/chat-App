const express = require('express');
const path = require('path'); 
const http = require('http'); //This is the HTTP Server
const socketio = require('socket.io'); // This is the Socket IO Module
const app = express();
//Creating A Server that is Automatically Created By Express
const server = http.createServer(app);
//Configuring The Socket Io to use The Express Server
const io = socketio(server);
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('../utils/generateMessage');
const { addUser, getUsersInRoom, removeUser,getUser } = require('../utils/users');

// console.log(getUsersInRoom('Js'));
const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname,'../public/');
app.use(express.static(publicPath));

io.on('connection',(socket)=>{

    socket.on('join',( {username,room},callback )=>{
        //Before setting Up the Join Event ,Let's Set Up the Add Users First

            const save = addUser({id:socket.id,username,room});
        if (save.error) {
            return callback(save.error);
        }

        //In Socket IO There is an Event called Join ,It allows Users To Join A Particular Room
        socket.join(room);
        
        //Send Messsage To The Connected Client
        socket.emit('broadcastMessage',generateMessage(`Welcome ${save.username}!`,save.username));

        //Send A Message When New User Joins The Room
        socket.broadcast.to(room).emit('broadcastMessage',generateMessage(`${save.username} Has Just Joined!!!`,save.username));

        io.to(save.room).emit('roomData',{
            room:save.room,
            users:getUsersInRoom(room)
        });

        callback();
    })

    //Send Message
    socket.on('sendMessage',(message,callback)=>{
        const filter = new Filter();
        if (filter.isProfane(message)){
            return callback('Message Contain Profane Words')
        }
        const user = getUser(socket.id);
        io.to(user.room).emit('broadcastMessage',generateMessage(message,user.username));
        callback();

    });

    //BroadCast Message won't send Message To You but to Other Connection......
    socket.on('sendLocation',({lat,long},callback)=>{
        const user = getUser(socket.id);
        
        io.to(user.room).emit('locationMessage',generateLocationMessage(`https://www.google.com/maps?q=${lat},${long}`,user.username));
        callback();
    })

    //When A User Disconnect i.e Closes The Browser
    socket.on('disconnect',()=>{
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit('broadcastMessage',generateMessage(`${user.username} Has Left The Room!!`,user.username));
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            });
        }
        // const getRoomUser = getUsersInRoom(user.room);
        // io.to(user.room).emit('roomData',getRoomUser);
    })
})

app.get('',(req,res)=>{
    res.render('index');
});

server.listen(port,()=>{
    console.log('The App is Working On Port '+ port);
})
