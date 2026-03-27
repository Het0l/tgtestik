let user = JSON.parse(localStorage.getItem("user"));

if(user){
    document.getElementById("usernameDisplay").innerText = user.username;
}