let users = [];

const addUser = ({id,username,room}) =>{
    //Validate User ,Save User ,Check for existing User
    if (username == '' || room =='') {
        return {
            error:'The User and The Room Must Not Be Empty'
        }
    }
    // Trim Away spaces and Turn them into Lowercase
    username = username.trim().toLowerCase();
    // Check for Existing User
    const user = users.find(user=>{
        return user.username == username && user.room == room;
    })

    if(user) {
        return {
            error:'Username Already Exist'
        }
    }

    //Save User
    const save  = { id, username, room};
    users.push(save);
    return save;
}

const removeUser = (id) =>{
    const remove = users.findIndex(user=>user.id == id);
    if (remove == -1){
        return {
            error:'Invalid Id: '+id
        }
    }
    users = users.splice(remove,1);
    console.log('User Removed'); 
}

const getUser =(id)=>{
    if (!id){
        return {
            error:'id not defined !!! !!!'
        }
    }
        return users.find(user=>user.id == id);
}

const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase();
    return users.filter(user=>user.room.trim().toLowerCase() == room);
}

module.exports = {
    addUser,
    getUsersInRoom,
    removeUser,
    getUser
}