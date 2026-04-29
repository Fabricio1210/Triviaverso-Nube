const base_url = '/views/';
const local_url = '/views/';

function logout(){
    event.preventDefault();
    sessionStorage.removeItem('user');
    sessionStorage.clear();
    window.location.href = '/views/Login.html';
}
let btnSalir = document.getElementById("btnSalir");
if(btnSalir != undefined) btnSalir.addEventListener('click', logout);

function populateSidebar(){
    let profileIcon  = document.getElementById('i-profile');
    let lisalir      = document.getElementById('li-salir');
    let aprofile     = document.getElementById('a-profile');
    let aleaderboard = document.getElementById('a-leaderboard');

    if(sessionStorage.user == undefined){
        if(profileIcon.classList.contains('bi-person')) profileIcon.classList.remove('bi-person');
        if(!profileIcon.classList.contains('bi-question-circle')) profileIcon.classList.add('bi-question-circle');
        lisalir.style.display = 'none';
        aleaderboard.href = '/views/Login.html';
        aprofile.href     = '/views/Login.html';
    } else {
        if(profileIcon.classList.contains('bi-question-circle')) profileIcon.classList.remove('bi-question-circle');
        if(!profileIcon.classList.contains('bi-person')) profileIcon.classList.add('bi-person');
        lisalir.style.display = 'block';
        aleaderboard.href = '/views/leaderboard.html';
        aprofile.href     = '/views/Profile.html';
    }
}
let sidebar = document.getElementById("sidebar");
if(sidebar != undefined) populateSidebar();