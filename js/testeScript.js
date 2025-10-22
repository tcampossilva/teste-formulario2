function fechar(){
    let teste = document.querySelector('#mostrar')
    let cacador = document.querySelector('#idCacador').value
    let evento = document.querySelector('#evento').value
    let dia = document.querySelector('#dataEvento').value
    let placa = documet.querySelector('#placa').value
    let tipos = document.querySelector('#tipoVeiculo').value
    
    teste.innerHTML = ``
    teste.innerHTML = `<h1>Teste de Titulo</h1><p>Caçador: ${cacador}</p><p>Ento: ${evento}</p><p>Data do Evento: ${dia}</p><br /><a href="http://127.0.0.1:5500/index.html">Retorna</a>`
  
}