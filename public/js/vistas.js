  async function cargarMisPartidas() {
    try {
      const res = await fetch('/accederPartida');
      const partidas = await res.json();

      const lista = document.getElementById('lista-partidas');
      lista.innerHTML = '';

      if (partidas.length === 0) {
        lista.innerHTML = '<li>No estás participando en ninguna partida.</li>';
        return;
      }

      partidas.forEach(partida => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${partida.nombreP} 
          <button onclick="location.href='/partida/${partida._id}'">Acceder</button>
        `;
        lista.appendChild(li);
      });
    } catch (error) {
      console.error("Error al cargar las partidas:", error);
    }
  }

  cargarMisPartidas();