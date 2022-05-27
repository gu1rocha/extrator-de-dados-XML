var demo = document.querySelector('#demo');

var TotalNotas = document.querySelector('#TotalNotas');
var TotalPago = document.querySelector('#TotalPago');
let tabela = document.querySelector('table');
var modeloLinha = document.querySelector('#modeloLinha');

let atualizarTotal = (valor,local) =>{
  local.innerHTML = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

let FloatToMoeda = valor => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })


let dateTimeToUTC = date =>{
    var offset = (new Date().getTimezoneOffset() / 60);
    var data = new Date(date.replace('T',' ') + "  " + (offset > 0 ? "-" + offset : (offset * -1)));
    return data.toLocaleString('pt-BR', { timeZone: 'UTC' }).replace(/(\d*)\/(\d*)\/(\d*)\s(\d*):(\d*):(\d*).*/, '$1/$2/$3 $4:$5:$6');
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

          if(!!xmlDoc.getElementsByTagName("xNome")[1]){

            let clone = modeloLinha.cloneNode(true);
            clone.removeAttribute('id');
            clone.removeAttribute('style');
            tabela.querySelector('tbody').appendChild(clone)

            let dataEmi = "";
            if(!!xmlDoc.getElementsByTagName("dhEmi")[0]){
              dataEmi = xmlDoc.getElementsByTagName("dhEmi")[0].textContent;
            }
            
            let dataSai = "";
            if(!!xmlDoc.getElementsByTagName("dhSaiEnt")[0]){
              dataSai = xmlDoc.getElementsByTagName("dhSaiEnt")[0].textContent;
            }

            let destinatario = xmlDoc.getElementsByTagName("dest")[0];

            let cnpj = "";
            if(!!destinatario.getElementsByTagName("CNPJ")[0]){
              cnpj = destinatario.getElementsByTagName("CNPJ")[0].textContent;
            }

            let nome = destinatario.getElementsByTagName("xNome")[0].textContent;

            let email = "";
            if(!!destinatario.getElementsByTagName("email")[0]){
              email = destinatario.getElementsByTagName("email")[0].textContent;
            }
            
            let endereco = destinatario.getElementsByTagName("enderDest")[0];

            let telefone = ""
            if(!!endereco.getElementsByTagName("fone")[0]){
              telefone = endereco.getElementsByTagName("fone")[0].textContent;
            }

            let logradouro = endereco.getElementsByTagName("xLgr")[0].textContent;
            let numero = endereco.getElementsByTagName("nro")[0].textContent;
            let bairro = endereco.getElementsByTagName("xBairro")[0].textContent;
            let municipio = endereco.getElementsByTagName("xMun")[0].textContent;
            let uf = endereco.getElementsByTagName("UF")[0].textContent;
            let cep = endereco.getElementsByTagName("CEP")[0].textContent;

            let ie = ""
            if(!!destinatario.getElementsByTagName("IE")[0]){
              ie = destinatario.getElementsByTagName("IE")[0].textContent;
            }

            let xpl = ""
            if(!!endereco.getElementsByTagName("xCpl")[0]){
              xpl = `- ${endereco.getElementsByTagName("xCpl")[0].textContent}`
            }
            
            let nNF = xmlDoc.getElementsByTagName("nNF")[0].textContent;
            console.log(nNF)

            var valorNota = xmlDoc.getElementsByTagName("vNF")[0].textContent;
            var valorPago = xmlDoc.getElementsByTagName("vPag")[0].textContent;

            clone.querySelector('.cnpj').innerHTML = cnpj;
            clone.querySelector('.nome').innerHTML = nome;
            clone.querySelector('.ie').innerHTML = ie;
            clone.querySelector('.email').innerHTML = email;
            clone.querySelector('.telefone').innerHTML = telefone;
            clone.querySelector('.endereco').innerHTML = `${logradouro}, ${numero} ${xpl}`;
            clone.querySelector('.bairro').innerHTML = bairro;
            clone.querySelector('.municipio').innerHTML = municipio;
            clone.querySelector('.cep').innerHTML = cep;
            clone.querySelector('.uf').innerHTML = uf;
            clone.querySelector('.numero').innerHTML = nNF;

            clone.querySelector('.dataEmi').innerHTML = dateTimeToUTC(dataEmi);
            clone.querySelector('.dataSai').innerHTML = dateTimeToUTC(dataSai);

            clone.querySelector('.valorNota').innerHTML = FloatToMoeda(valorNota);
            clone.querySelector('.valorPago').innerHTML = FloatToMoeda(valorPago);

            

            
            totalNotas = totalNotas + parseFloat(valorNota);
            totalPago = totalPago + parseFloat(valorPago);

            atualizarTotal(Number(totalNotas),TotalNotas)
            atualizarTotal(Number(totalPago),TotalPago)
          }
        };
      })(f);
      
      reader.readAsText(f);
    }

  }
  document.getElementById('files').addEventListener('change', handleFileSelect, false);