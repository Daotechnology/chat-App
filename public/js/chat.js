const socket = io();
const message = document.querySelector("#message");
const $sendLocationButton = document.querySelector("#sendLocation");
const $displayMessage = document.querySelector("#app");
const store = Qs.parse(location.search, {ignoreQueryPrefix:true});
const $chatSidebar = document.querySelector("#sidebar");

//Template
const $sidebarTemplate = document.querySelector("#sidebar_template").innerHTML;
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $link = document.querySelector("#link-template").innerHTML;

const autoscroll = () =>{
    //Getting the New Message
    const $newMessage = $displayMessage.lastElementChild

    //Getting the heigth wont Get the Margins Height ,So We have to Compute it
    const $newMessageStyles = getComputedStyle($newMessage).marginBottom;

    //Get The Parsed Margin     
    const $newMarginHeight = parseInt($newMessageStyles);

    // Getting The Height of New Message
    const $newMessageHeight = $newMessage.offsetHeight + $newMarginHeight;

    //Visble Height-The visible height is the heigt where the Message Box is
    const $visibleHeight = $displayMessage.offsetHeight
    
    //Height of Message Container or also called The Total Height
    const $containerHeight = $displayMessage.scrollHeight;
    
    //How far have i scrolled
    const $scrollOffset = $displayMessage.scrollTop + $visibleHeight;
    
    if ($containerHeight - $newMessageHeight <= $scrollOffset) {
        // console.log('This is the Container Height: '+$containerHeight);
        // console.log('This is the New Message Height: '+$newMessageHeight);
        // console.log('This is the Offset Height: '+$scrollOffset);
        // console.log('This is the Visible Height: '+$displayMessage.offsetHeight);
        
        $displayMessage.scrollTop = $displayMessage.scrollHeight
    }
    
}

socket.on('broadcastMessage',(messageVal)=>{
    const html = Mustache.render($messageTemplate,{
        message:messageVal.text,
        createdAt:moment(messageVal.createdAt).format('h:m A'),
        username:messageVal.username
    });

    $displayMessage.insertAdjacentHTML('beforeend',html);
    console.log(messageVal);
    autoscroll();
})

socket.on('locationMessage',(location)=>{
    const html = Mustache.render($link,{
        link:location.url,
        createdAt:moment(location.createdAt).format('h:mm A'),
        username:location.username
    })
    $displayMessage.insertAdjacentHTML('beforeend',html);
    console.log(location);
    autoscroll();
})

socket.on('roomData',({room,users})=>{
    console.log(users);
    let html = '';
    html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    $chatSidebar.innerHTML = html;
})

document.querySelector("#send").addEventListener("click",(e)=>{
    e.preventDefault();
    //You cannot Send Empty Message
    //Clear Input Fields
    //Return Focus After Clearing The Fields
    if (message.value !== '') {
    socket.emit('sendMessage',message.value,(error)=>{
        message.value = '';
        message.focus();
        if(error){
            return console.log(error)
        }
        console.log('Connection Established.....');
    });
}
})

$sendLocationButton.addEventListener("click",(e)=>{
    e.preventDefault();
    $sendLocationButton.setAttribute('disabled','');
    if(!navigator.geolocation){
        return alert('Browser Not Supported')
    }

    //Get The Longitude and Latitude Of The User
    navigator.geolocation.getCurrentPosition((position)=>{
        let lat = position.coords.latitude;
        let long = position.coords.longitude;
        socket.emit('sendLocation',{lat,long},()=>{
            setTimeout(()=>{
                $sendLocationButton.removeAttribute('disabled');
            },2000);
            console.log('Location Shared');
        });
    })
})

socket.emit('join',store,(error)=>{
    if (error) {
        alert(error);
        location.replace('/');
    }
});