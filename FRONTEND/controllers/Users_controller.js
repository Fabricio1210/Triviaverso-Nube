function init(){
    let user_account = null;
    if(sessionStorage.getItem('user') != null)
        user_account = JSON.parse(sessionStorage.getItem('user'));
    
    // Leaderboard
    if(window.location.pathname == "/leaderboard.html"){
        if(user_account == null){
            window.location.href = local_url + "login.html";
        } else {
            let ranking = document.getElementById("Ranking");
            if(ranking != undefined){
                getRanking().then(rank => {
                    for(let i = 0; i < 10 && i < rank.length; i++){
                        let tr = document.createElement('tr');
                        let tdpos = document.createElement('td');
                        let tdname = document.createElement('td');
                        let tdpoints = document.createElement('td');
                        tdpos.classList.add('text-center');
                        tdpoints.classList.add('text-center');
                        tdpos.innerText = i + 1;
                        tdname.innerText = rank[i].name;
                        tdpoints.innerText = rank[i].points;
                        tr.append(tdpos, tdname, tdpoints);
                        ranking.append(tr);
                    }
                }).catch(err => console.log('Error al obtener ranking: ' + err));
            }
            let tbPos  = document.getElementById('tbPos');
            let tbName = document.getElementById('tbName');
            let tbPts  = document.getElementById('tbPts');
            getRank().then(pos => { tbPos.innerText = pos; });
            tbName.innerText = JSON.parse(sessionStorage.user).name;
            const id = JSON.parse(sessionStorage.user).id_usuario;
            fetch('/users/' + id, { method: 'GET' })
                .then(r => r.json())
                .then(userFresco => {
                    tbPts.innerText = userFresco.points + ' pts';
                    const session = JSON.parse(sessionStorage.user);
                    session.points = userFresco.points;
                    sessionStorage.setItem('user', JSON.stringify(session));
                })
                .catch(err => console.error('Error trayendo puntos frescos:', err));
                    }
                }

    // Profile
    if(window.location.pathname == "/Profile.html"){
        if(user_account == null){
            window.location.href = local_url + "login.html";
        } else {
            let username     = document.getElementById('username'),
                usermsg      = document.getElementById('usermsg'),
                useremail    = document.getElementById('useremail'),
                usercatfav   = document.getElementById('usercatfav'),
                userpts      = document.getElementById('userpts'),
                userrank     = document.getElementById('userrank'),
                useraciertos = document.getElementById('useraciertos');
            let aciertos = 0;

            username.innerText       = user_account.name;
            usermsg.innerHTML        = '<b>Mensaje:</b> ' + (user_account.message || '');
            useremail.innerHTML      = '<b>Correo:</b> ' + user_account.email;
            usercatfav.innerHTML     = '<b>Categoria favorita:</b> ' + (user_account.favourite_category || '');
            userpts.innerHTML        = '<b>Máximo puntaje:</b> ' + user_account.points;
            getRank().then(pos => {
                userrank.innerHTML = '<b>Ranking:</b> ' + pos;
            });

            let banner = document.getElementById('banner');
            for(let i = 0; i < categorias.length; i++){
                if(categorias[i] === user_account.favourite_category)
                    banner.style.backgroundColor = colores[i];
            }

            // ← Historial ahora es un array plano de registros
            getHistorial().then(historial => {
                let rowQuestions = document.getElementById('rowQuestions');
                if(historial.length > 0){
                    let prevmsg = document.getElementById('msg');
                    if(prevmsg) prevmsg.remove();

                    historial.forEach(registro => {
                        // registro tiene: id_pregunta, es_correcta, Question{...}
                        const result = registro.Question; // viene del include en el backend
                        if(!result) return;

                        let row   = document.createElement('div');
                        row.classList.add('col-12', 'col-sm-6', 'col-lg-4');
                        let quest = document.createElement('div');
                        quest.classList.add('question', 'p-3');
                        let flex  = document.createElement('div');
                        flex.classList.add('d-flex');

                        let preg = document.createElement('div');
                        preg.classList.add('me-3');
                        let b1 = document.createElement('b');
                        b1.style.fontSize = "12px";
                        b1.innerText = result.question;
                        let p = document.createElement('p');
                        // opciones ahora son option_0..option_3
                        const opciones = [result.option_0, result.option_1, result.option_2, result.option_3];
                        p.innerText = opciones[result.right_answer_index];
                        preg.append(b1, p);

                        let icon = document.createElement('i');
                        icon.classList.add('bi', 'fs-1');
                        if(!registro.es_correcta){
                            quest.classList.add('wrong');
                            icon.classList.add('bi-x-circle');
                        } else {
                            quest.classList.add('right');
                            icon.classList.add('bi-check-circle');
                            aciertos += 1;
                        }
                        flex.append(preg, icon);

                        let gen  = document.createElement('div');
                        gen.classList.add('me-2');
                        let b2   = document.createElement('b');
                        b2.innerText = 'Categoria: ';
                        let span = document.createElement('span');
                        span.innerText = result.Category?.nombre || '';
                        gen.append(b2, span);

                        quest.append(flex, gen);
                        row.append(quest);
                        rowQuestions.append(row);
                        useraciertos.innerHTML = '<b>Aciertos:</b> ' + aciertos;
                    });
                } else {
                    let mensaje = document.createElement('p');
                    mensaje.id = 'msg';
                    mensaje.style.color = "yellow";
                    mensaje.style.textAlign = 'center';
                    mensaje.innerText = '\nJuega una partida para empezar tu historial!.';
                    if(!document.getElementById('msg')) rowQuestions.append(mensaje);
                    useraciertos.innerHTML = '<b>Aciertos:</b> 0';
                }
            }).catch(err => console.log('Error historial: ' + err));
        }
    }

    // EditProfile
    if(window.location.pathname == "/EditProfile.html"){
        if(user_account == null){
            window.location.href = local_url + "login.html";
        } else {
            document.getElementById('txtName').value     = user_account.name;
            document.getElementById('txtmsg').value      = user_account.message || '';
            document.getElementById('cbcategoria').value = user_account.favourite_category || '';
            // ← nunca pongas la password en el input por seguridad
        }
    }
}

function login(){
    event.preventDefault();
    let data = new FormData(event.target);
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
    .then(async response => {
        if(response.status == 404 || response.status == 401)
            alert("Correo y/o Contraseña incorrectos.");
        else return response.json();
    })
    .then(user => {
        if(user){
            sessionStorage.setItem('user', JSON.stringify(user));
            window.location.href = local_url + 'home.html';
        }
    })
    .catch(err => console.log('Error en login: ' + err));
}
let FormLogin = document.getElementById("FormLogin");
if(FormLogin) FormLogin.addEventListener('submit', login);

function register(){
    event.preventDefault();
    let data = new FormData(event.target);
    fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data.entries()))
    })
    .then(async response => {
        if(!response.ok) alert(await response.text());
        return response.json();
    })
    .then(user => {
        alert('Registro completado con exito!');
        sessionStorage.setItem('user', JSON.stringify(user));
        window.location.href = local_url + 'home.html';
    })
    .catch(err => console.error('Error en registro: ', err));
}
let FormReg = document.getElementById("FormReg");
if(FormReg) FormReg.addEventListener('submit', register);

async function getHistorial(){
    // ← id_usuario en lugar de _id
    const id = JSON.parse(sessionStorage.user).id_usuario;
    return fetch('/histories/' + id, { method: 'GET' })
        .then(async response => {
            if(!response.ok) alert(await response.text());
            return response.json();
        })
        .catch(err => console.error("Fallo al obtener historial: " + err));
}

async function getRanking(){
    return fetch('/rank', { method: 'GET' })
        .then(async response => {
            if(!response.ok) alert(await response.text());
            return response.json();
        })
        .catch(err => console.error("Fallo al obtener ranking: " + err));
}

async function getRank(){
    const id = JSON.parse(sessionStorage.user).id_usuario; // ← id_usuario
    return fetch('/rank', { method: 'GET' })
        .then(async response => {
            if(!response.ok) alert(await response.text());
            return response.json();
        })
        .then(allUsers => {
            allUsers.sort((a, b) => b.points - a.points);
            for(let i = 0; i < allUsers.length; i++){
                if(allUsers[i].id_usuario == id) return i + 1; // ← id_usuario
            }
            return '-';
        })
        .catch(err => console.error("Fallo al obtener tu rango: " + err));
}

function user_update(){
    const data_user = JSON.parse(sessionStorage.user);
    event.preventDefault();
    let data = new FormData(event.target);
    if(data.get('password') == data.get('confirm_password')){
        data.delete('confirm_password');
        fetch('/users/' + data_user.id_usuario, { // ← id_usuario
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(data.entries()))
        })
        .then(async response => {
            if(!response.ok) alert(await response.text());
            return response.json();
        })
        .then(userUpdated => {
            alert('Usuario actualizado con exito!!');
            sessionStorage.setItem('user', JSON.stringify(userUpdated));
            window.location.href = local_url + 'Profile.html';
        })
        .catch(err => console.error('Error al guardar datos: ', err));
    } else {
        alert('Las contraseñas no coinciden!');
    }
}
let FormEdit = document.getElementById("FormEdit");
if(FormEdit) FormEdit.addEventListener('submit', user_update);

init();