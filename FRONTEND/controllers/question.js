let categorias = [];
const colores = [
    "#FF5733", "#C70039", "#900C3F", "#581845", "#1F618D",
    "#154360", "#117864", "#229954", "#A04000", "#884EA0",
    "#2C3E50", "#E67E22", "#D35400", "#34495E", "#7D3C98"
];

let rotationValue = 0;
let seleccionadas = [];
let coloresSeleccionados = [];

async function cargarCategorias() {
    try {
        const response = await fetch('/categories');
        if(!response.ok) throw new Error('Error al cargar categorías');
        const data = await response.json();
        categorias = data.map(c => c.nombre);
        if(window.location.pathname == '/Ruleta.html'){
            setRouellete();
            mostrarProgresoRonda();
        }
    } catch(err) {
        console.error('Error cargando categorías:', err);
    }
}
function setRouellete(){
    seleccionadas = categorias.sort(() => 0.5 - Math.random()).slice(0, 5);
    coloresSeleccionados = colores.sort(() => 0.5 - Math.random()).slice(0, 5);
    const ruleta = document.getElementById("ruleta");
    ruleta.innerHTML = "";

    seleccionadas.forEach((categoria, i) => {
        const div = document.createElement("div");
        div.className = "category";
        div.style.setProperty('--i', i + 1);
        div.style.setProperty('--clr', coloresSeleccionados[i % coloresSeleccionados.length]);
        div.innerHTML = `<span>${categoria}</span>`;
        ruleta.appendChild(div);
    });

    let jugadores = parseInt(localStorage.getItem('totalJugadores'), 10) || 1;
    if(jugadores != 1){
        const turno = parseInt(localStorage.getItem('turno'), 10);
        const h1 = document.getElementById('turno');
        h1.textContent = `Turno del jugador: ${turno}`;
    }
}

function spinRoullete(){
    const roulette = document.querySelector(".wheel");
    const extra = Math.floor(Math.random() * 360);
    rotationValue += 360 * (5 + Math.floor(Math.random() * 5)) + extra;
    roulette.style.transform = `rotate(${rotationValue}deg)`;
}

function categoriaGanadora(rotationDeg, categorias) {
    const grados = ((rotationDeg % 360) + 360) % 360;
    const index = Math.floor(((360 - grados) % 360) / 72);
    return categorias[index];
}

function transicion(){
    const ganadora = categoriaGanadora(rotationValue, seleccionadas);
    window.categoriaSeleccionada = ganadora;
    const modalTexto = document.getElementById("categoriaGanadoraTexto");
    modalTexto.textContent = ganadora;
    const modal = new bootstrap.Modal(document.getElementById('categoriaModal'));
    modal.show();
}

function incrementarRonda() {
    let actual       = parseInt(localStorage.getItem('rondaActual'), 10) || 1;
    let rondaActualReal = parseInt(localStorage.getItem('rondaActualReal'), 10) || 1;
    let jugadores    = parseInt(localStorage.getItem('totalJugadores'), 10) || 1;
    let turno        = parseInt(localStorage.getItem('turno'), 10);
    rondaActualReal += 1;
    actual  = Math.ceil(rondaActualReal / jugadores);
    turno   = ((rondaActualReal - 1) % jugadores) + 1;
    localStorage.setItem('rondaActual', actual);
    localStorage.setItem('rondaActualReal', rondaActualReal);
    localStorage.setItem('turno', turno);
}

function verificarFinDeJuego() {
    const total  = Number(localStorage.getItem('totalRondas'));
    const actual = Number(localStorage.getItem('rondaActual'));

    if(actual > total){
        const scores        = JSON.parse(localStorage.getItem('scores'));
        const totalJugadores = Number(localStorage.getItem('totalJugadores'));
        let html = '';
        if(totalJugadores === 1){
            html = `Obtuviste ${scores[0]} puntos`;
        } else {
            html = '<h5 class="mb-3">Puntuación final</h5><ul class="list-unstyled">';
            scores.forEach((sc, i) => {
                html += `<li>Jugador ${i + 1}: <strong>${sc} pts</strong></li>`;
            });
            html += '</ul>';
        }
        document.getElementById('textoScoreFinal').innerHTML = html;
        const modalScore = bootstrap.Modal.getOrCreateInstance(
            document.getElementById('finalScoreModal')
        );
        modalScore.show();

        if(totalJugadores === 1 && JSON.parse(sessionStorage.getItem('user')) != undefined){
            const scoreFinal = JSON.parse(localStorage.getItem('scores') || '[0]')[0];
            guardarRecordSiEsMayor(scoreFinal);
        }

        // ← sin listener duplicado aquí, se maneja abajo al final del archivo
        ['rondaActual','totalRondas','scores','score','rondaActualReal','turno']
            .forEach(k => localStorage.removeItem(k));

        return true;
    }
    return false;
}

function guardarRecordSiEsMayor(nuevoScore) {
    const userJSON = sessionStorage.getItem('user');
    if(!userJSON) return;
    const id = JSON.parse(userJSON).id_usuario;
    if(!id) return;

    fetch(`/users/${id}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: nuevoScore })
    })
    .then(r => r.json())
    .then(userActualizado => {
        console.log(`Puntos en BD: ${userActualizado.points}`);
        sessionStorage.setItem('user', JSON.stringify(userActualizado));
    })
    .catch(err => console.error('Error actualizando puntos:', err));
}

function ruleta(){
    const modal = bootstrap.Modal.getInstance(document.getElementById('resultadoModal'));
    modal.hide();
    window.location.href = 'Ruleta.html';
}

function play(){
    const modal = bootstrap.Modal.getInstance(document.getElementById('categoriaModal'));
    modal.hide();
    window.location.href = `pregunta.html?categoria=${encodeURIComponent(window.categoriaSeleccionada)}`;
}

async function cargarPregunta() {
    const params    = new URLSearchParams(window.location.search);
    const categoria = params.get("categoria"); // llega tal cual desde play()

    fetch(`/questions?nombre_categoria=${encodeURIComponent(categoria)}`)
        .then(r => { if(!r.ok) throw new Error(); return r.json(); })
        .then(preguntas => {
            if(!preguntas || preguntas.length === 0)
                throw new Error('Sin preguntas');

            const indice = Math.floor(Math.random() * preguntas.length);
            const data   = preguntas[indice];
            const opciones = [data.option_0, data.option_1, data.option_2, data.option_3];

            document.querySelector('.card-title').textContent = data.Category?.nombre || categoria;
            document.querySelector('.card-text').textContent  = data.question;

            opciones.forEach((op, i) => {
                const btn = document.getElementById(`opcion${i + 1}`);
                if(btn){
                    btn.querySelector('span').textContent = op;
                    btn.addEventListener('click', () => validarRespuesta(i));
                }
            });

            window.question_id       = data.id_pregunta;
            window.respuestaCorrecta = data.right_answer_index;
            document.dispatchEvent(new Event('preguntaCargada'));
        })
        .catch(() => alert("No se pudo cargar la pregunta."));
}

function validarRespuesta(indiceSeleccionado) {
    clearInterval(CountDownID);
    clearInterval(progressBarID);
    const correcta = window.respuestaCorrecta;
    const puntos   = (indiceSeleccionado === correcta)
        ? Math.round((seg / 20) * 100) : 0;

    const scores = JSON.parse(localStorage.getItem('scores'));
    const turno  = Number(localStorage.getItem('turno')) || 1;
    scores[turno - 1] += puntos;
    localStorage.setItem('scores', JSON.stringify(scores));

    const texto = (indiceSeleccionado === correcta)
        ? `✅ ¡Respuesta correcta! (+${puntos} pts)`
        : "❌ Respuesta incorrecta (0 pts)";

    document.getElementById("textoResultado").textContent = texto;

    if(JSON.parse(sessionStorage.getItem('user')) != undefined)
        GuardarEnHistorial(indiceSeleccionado === correcta);

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('resultadoModal')
    );
    incrementarRonda();
    modal.show();
}

function GuardarEnHistorial(ans){
    // ← campos nuevos: id_pregunta y es_correcta
    const data = {
        id_pregunta: window.question_id,
        es_correcta: ans
    };

    // ← id_usuario en lugar de _id
    fetch('/histories/' + JSON.parse(sessionStorage.user).id_usuario, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(async response => {
        if(!response.ok) alert(await response.text());
        return response.json();
    })
    .catch(err => console.log("Fallo al agregar al historial: " + err));

    window.question_id = '';
}

function setMatch(){
    localStorage.clear();
    const input  = document.querySelector('.input-rounds');
    const rondas = parseInt(input.value, 10);
    const jugadorSeleccionado = document.querySelector('input[name="players"]:checked');
    if(!jugadorSeleccionado){
        alert("Por favor selecciona cuántas personas jugarán.");
        return;
    }
    const totalJugadores = parseInt(jugadorSeleccionado.id.replace('players', ''), 10);
    localStorage.setItem('totalJugadores', totalJugadores);
    if(!isNaN(rondas) && rondas > 0){
        localStorage.setItem('totalRondas', rondas);
        localStorage.setItem('rondasReales', rondas * totalJugadores);
        localStorage.setItem('rondaActualReal', 1);
        localStorage.setItem('turno', 1);
        localStorage.setItem('scores', JSON.stringify(Array(totalJugadores).fill(0)));
        window.location.href = 'Ruleta.html';
    } else {
        alert('Por favor ingresa un número válido de rondas.');
    }
}

function mostrarProgresoRonda() {
    const total  = parseInt(localStorage.getItem('totalRondas'), 10);
    const actual = parseInt(localStorage.getItem('rondaActual'), 10);
    if(!isNaN(total) && !isNaN(actual))
        document.getElementById('infoRonda').textContent = `Ronda ${actual} de ${total}`;
}

async function init(){
    if(!localStorage.getItem('rondaActual'))
        localStorage.setItem('rondaActual', 1);
    await cargarCategorias();
    if(window.location.pathname.includes('/pregunta.html')){
        cargarPregunta();
    }
}
init();

document.getElementById('spinBtn')?.addEventListener('click', spinRoullete);
document.querySelector(".wheel")?.addEventListener("transitionend", transicion);
document.getElementById('AceptarCategoria')?.addEventListener('click', play);
document.getElementById('btnContinuar')?.addEventListener('click', setMatch);
document.getElementById('AceptarRuleta')?.addEventListener('click', () => {
    if(!verificarFinDeJuego()) ruleta();
});
// ← movido aquí para que exista cuando se necesite
document.getElementById('btnBackHome')?.addEventListener('click', () => {
    window.location.href = 'Home.html';
}, { once: true });