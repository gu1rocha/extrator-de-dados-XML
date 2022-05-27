var demo = document.querySelector('#demo');

var TotalNotas = document.querySelector('#TotalNotas');
var TotalPago = document.querySelector('#TotalPago');

let atualizarTotal = (valor,local) =>{
  local.innerHTML = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function handleFileSelect(evt) {
  var files = evt.target.files;
	let totalPago = 0, totalNotas = 0;

    for (var i = 0, f; f = files[i]; i++) {
      var reader = new FileReader();

      reader.onload = (function(theFile) {
        return function(e) {

          var span = document.createElement('span');                    
          span.appendChild(document.createTextNode(e.target.result));
          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(span.innerText,"text/xml");

	        //let row = document.createElement('div');
          //demo.appendChild(row)

          if(!!xmlDoc.getElementsByTagName("xNome")[1]){

            let Nome = document.createElement('a');
            demo.appendChild(Nome)
            
            let nome = xmlDoc.getElementsByTagName("xNome")[1].childNodes[0].nodeValue;
            Nome.innerHTML =  `${nome}`;

            let ValorTotal = document.createElement('a');
            demo.appendChild(ValorTotal)
            var valorTotal = xmlDoc.getElementsByTagName("vNF")[0].childNodes[0].nodeValue;
            ValorTotal.innerHTML = `${Number(valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;

            let Valor = document.createElement('a');
            demo.appendChild(Valor)
            var valor = xmlDoc.getElementsByTagName("vPag")[0].childNodes[0].nodeValue;
            Valor.innerHTML = `${Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;

            let nNF = xmlDoc.getElementsByTagName("nNF")[0].childNodes[0].nodeValue
            //console.log(nNF)

            
            totalNotas = totalNotas + parseFloat(valorTotal);
            totalPago = totalPago + parseFloat(valor);

            atualizarTotal(Number(totalNotas),TotalNotas)
            atualizarTotal(Number(totalPago),TotalPago)
          }
        };
      })(f);
      
      reader.readAsText(f);
    }

  }
  document.getElementById('files').addEventListener('change', handleFileSelect, false);