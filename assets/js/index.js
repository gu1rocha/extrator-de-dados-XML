var demo = document.querySelector('#demo');

var TotalNotas = document.querySelector('#TotalNotas');
var TotalPago = document.querySelector('#TotalPago');
let tabNotas = document.querySelector('#notasFiscais');
let tabCanceladas = document.querySelector('#canceladas');
let boxSelectNotas = document.querySelector('#boxSelectForTableNotas');
let boxSelectCanceladas = document.querySelector('#boxSelectForCanceladas');
let modeloLinhaNota = tabNotas.querySelector('#modeloLinha');
let modeloLinhaCancela = tabCanceladas.querySelector('#modeloLinha');

let valorFinal = 0

var meuSet = new Set();

let atualizarTotal = (valor,local) =>{
  local.innerHTML = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

let FloatToMoeda = valor => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

let indPag = valor => valor == 0 ? "Pagamento à Vista" : "Pagamento a Prazo"

let tPag = valor => {
  switch (valor) {
    case '01' : return "Dinheiro"
    case '02' : return "Cheque"
    case '03' : return "Cartão de Crédito"
    case '04' : return "Cartão de Débito"
    case '05' : return "Crédito Loja"
    case '10' : return "Vale Alimentação "
    case '11' : return "Vale Refeição "
    case '12' : return "Vale Presente"
    case '13' : return "Vale Combustível"
    case '15' : return "Boleto Bancário"
    case '16' : return "Depósito Bancário"
    case '17' : return "Pagamento Instantâneo (PIX)"
    case '18' : return "Transferência bancária, Carteira Digital"
    case '19' : return "Programa de fidelidade, Cashback, Crédito Virtual"
    case '90' : return "Sem pagamento"
    case '99' : return "Outros"
  }
}

let dateTimeToUTC = date =>{
    var offset = (new Date().getTimezoneOffset() / 60);
    var data = new Date(date.replace('T',' ') + "  " + (offset > 0 ? "-" + offset : (offset * -1)));
    return data.toLocaleString('pt-BR', { timeZone: 'UTC' }).replace(/(\d*)\/(\d*)\/(\d*)\s(\d*):(\d*):(\d*).*/, '$1/$2/$3 $4:$5:$6');
}

let valor = 0

function handleFileSelect(evt) {
  var files = evt.target.files;

  for (var i = 0, f; f = files[i]; i++) {
    var reader = new FileReader();

    reader.onload = (function(theFile) {
      return function(e) {

        var span = document.createElement('span');                    
        span.appendChild(document.createTextNode(e.target.result));
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(span.innerText,"text/xml");

        if(!!xmlDoc.getElementsByTagName("xNome")[1]){
          let clone = modeloLinhaNota.cloneNode(true);
          clone.removeAttribute('id');
          clone.removeAttribute('style');
          tabNotas.querySelector('tbody').appendChild(clone)

          let dataEmi = "";
          if(!!xmlDoc.getElementsByTagName("dhEmi")[0]){
            dataEmi = xmlDoc.getElementsByTagName("dhEmi")[0].textContent;
          }

          let natOp = '';
          if(!!xmlDoc.getElementsByTagName("natOp")[0]){
            natOp = xmlDoc.getElementsByTagName("natOp")[0].textContent
          }
            
          let dataSai = "";
          if(!!xmlDoc.getElementsByTagName("dhSaiEnt")[0]){
            dataSai = xmlDoc.getElementsByTagName("dhSaiEnt")[0].textContent;
          }

          let destinatario = xmlDoc.getElementsByTagName("dest")[0];

          let cnpj = "";
          if(!!destinatario.getElementsByTagName("CNPJ")[0]){
            cnpj = destinatario.getElementsByTagName("CNPJ")[0].textContent.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
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
          
          let cep = "";
          if(!!endereco.getElementsByTagName("CEP")[0]){
            cep = endereco.getElementsByTagName("CEP")[0].textContent;
          }

          let ie = ""
          if(!!destinatario.getElementsByTagName("IE")[0]){
            ie = destinatario.getElementsByTagName("IE")[0].textContent;
          }

          let xpl = ""
          if(!!endereco.getElementsByTagName("xCpl")[0]){
            xpl = `- ${endereco.getElementsByTagName("xCpl")[0].textContent}`
          }

          let nNF = xmlDoc.getElementsByTagName("infNFe")[0].getAttributeNode("Id").value.replace("ID","").slice(28, 37);
          clone.dataset.nf = nNF;

          nNF = nNF.replace(/^(\d{3})(\d{3})(\d{3})/, "$1.$2.$3")

          let detalhesPagamento = xmlDoc.getElementsByTagName("detPag")[0]
          let indPagtext = ''; let tPagtext = '';

          if(!!detalhesPagamento){
            if(!!detalhesPagamento.getElementsByTagName("indPag")[0]){
              indPagtext = indPag(detalhesPagamento.getElementsByTagName("indPag")[0].textContent)
              tPagtext = tPag(detalhesPagamento.getElementsByTagName("tPag")[0].textContent),detalhesPagamento.getElementsByTagName("tPag")[0].textContent
            }
          }

          let vol = xmlDoc.getElementsByTagName("vol")[0]
          let qVol = ''; let esp =''
          if(!!xmlDoc.getElementsByTagName("vol")[0] && !!vol.getElementsByTagName("qVol")[0]){
            qVol = vol.getElementsByTagName("qVol")[0].textContent
          }
          if(!!xmlDoc.getElementsByTagName("vol")[0] && !!vol.getElementsByTagName("esp")[0]){
            esp = vol.getElementsByTagName("esp")[0].textContent
          }

          var valorNota = xmlDoc.getElementsByTagName("vNF")[0].textContent;

          var valorContabel = 0;

          let produto = []
          if(natOp.includes("Venda de producao") || natOp.includes("Venda prod") || natOp.includes("Nota Fiscal  Complementar")) valorContabel = valorNota;

          for(let det of xmlDoc.getElementsByTagName("det")){
            if(natOp.includes("Venda de producao") || natOp.includes("Venda prod")){
              if((det.getElementsByTagName("CFOP")[0].textContent == "6910" || det.getElementsByTagName("CFOP")[0].textContent == "5910" || det.getElementsByTagName("CFOP")[0].textContent == "6911" || det.getElementsByTagName("CFOP")[0].textContent == "5911")){
                
              valorContabel = (valorContabel - (
                                                  parseFloat(det.getElementsByTagName("vProd")[0].textContent) +
                                                  parseFloat(det.getElementsByTagName("vCOFINS")[0].textContent) +
                                                  parseFloat(det.getElementsByTagName("vPIS")[0].textContent) +
                                                  parseFloat(det.getElementsByTagName("vIPI")[0].textContent) + 
                                                  (!det.getElementsByTagName("vICMSST")[0] ? 0 : parseFloat(det.getElementsByTagName("vICMSST")[0].textContent))
                                                )
                                ).toFixed(2)
              }
            }
            produto.push(`${det.getElementsByTagName("cProd")[0].textContent} ${det.getElementsByTagName("xProd")[0].textContent} ${det.getElementsByTagName("qCom")[0].textContent}; `)
          }

          valor += +valorContabel
          document.querySelector('.valorTotal').innerText = (valor).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})
          clone.querySelector('.natOp').innerHTML = natOp;
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

          clone.querySelector('.dataEmi').innerHTML = dataEmi;
          clone.querySelector('.dataSai').innerHTML = dataSai;

          clone.querySelector('.valorNota').innerHTML = valorNota;
          clone.querySelector('.valorContabel').innerHTML = valorContabel;

          clone.querySelector('.qVol').innerHTML = qVol;
          clone.querySelector('.esp').innerHTML = esp;
          clone.querySelector('.produto').innerHTML = produto;

          clone.querySelector('.indPag').innerHTML = indPagtext;
          clone.querySelector('.tPag').innerHTML = tPagtext;

        }else if(!!xmlDoc.getElementsByTagName("procEventoNFe")[0]){

          let IDEvento = xmlDoc.getElementsByTagName("infEvento")[0].getAttributeNode("Id").value.replace("ID","");

          let CNPJ = "";
          if(!!xmlDoc.getElementsByTagName("CNPJDest")[0]){
            CNPJ = xmlDoc.getElementsByTagName("CNPJDest")[0].textContent.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
          }

          let dhEvento = dateTimeToUTC(xmlDoc.getElementsByTagName("dhEvento")[0].textContent);
          let nProt = xmlDoc.getElementsByTagName("nProt")[0].textContent;
          let xJust = xmlDoc.getElementsByTagName("xJust")[0].textContent;
          let nota = IDEvento.slice(31, 40)
          let serie = IDEvento.slice(28, 31)

          let rows = tabNotas.querySelectorAll('.linha');
          
          for(let row of rows){
            if(nota == row.dataset.nf){
              row.querySelector('.status').innerHTML = "C";
              row.style.textDecoration = "line-through"
            }
          }
          nota = nota.replace(/^(\d{3})(\d{3})(\d{3})/, "$1.$2.$3")

          let clone = modeloLinhaCancela.cloneNode(true);
          clone.removeAttribute('id');
          clone.removeAttribute('style');
          tabCanceladas.querySelector('tbody').appendChild(clone)
          
          clone.querySelector('.IDEvento').innerHTML = IDEvento;
          clone.querySelector('.dhEvento').innerHTML = dhEvento;
          clone.querySelector('.nProt').innerHTML = nProt;
          clone.querySelector('.cnpj').innerHTML = CNPJ;
          clone.querySelector('.nota').innerHTML = nota;
          clone.querySelector('.serie').innerHTML = serie;
          clone.querySelector('.xJust').innerHTML = xJust;
        }
      };
    })(f);
    reader.readAsText(f);
  }
}


document.getElementById('files').addEventListener('change', handleFileSelect, false);

let visibleHidden = element => {
  if(element.style.display === 'none'){
    element.style.display = ''
  }else{
    element.style.display = 'none'
  }
}

let removeAddClass = (element, classe) => {
  if(element.classList.value.includes(classe)){
    element.classList.remove(classe)
  }else{
    element.classList.add(classe)
  }
}

let AppearCol = (tab,boxSelect,primeiro = true, ultimo = true) => {
  let inicio = 1;
  let final = 1;
  
  if(primeiro){ inicio = 0; }
  
  if(ultimo){ final = 0; }
  
  boxSelect.querySelector('.boxMenu').innerHTML = "";
  for(let i = inicio; i < tab.querySelectorAll('th').length - final; i++){
      let linha = document.createElement('a');
      linha.dataset.ordem = i;
      linha.classList.add('linha');
      if(tab.querySelectorAll('th')[i].style.display !== 'none'){
          linha.classList.add('ativo');
      }
      linha.textContent = (tab.querySelectorAll('th')[i].textContent);
      boxSelect.querySelector('.boxMenu').appendChild(linha);
  }
  btnMenu(boxSelect);
  ShowHideCol(boxSelect,tab);
}

let btnMenu = (element) => {
  element.querySelector('.icon_col').addEventListener('click', (event) => {
    visibleHidden(element.querySelector('.boxMenu'));
  });
}
let test = document.querySelectorAll('.boxMenu.canceladas')[0].childNodes
document.addEventListener('mouseup', (e) => {
  let linha = false, boxSelectForCanceladas = document.querySelector('#boxSelectForCanceladas')
  for(let a of document.querySelector('.boxMenu').querySelectorAll('a')){
    if(a === e.target) linha = true
  }
  for(let a of document.querySelectorAll('.boxMenu.canceladas')[0].childNodes){
    if(a === e.target) linha = true
  }
  if(document.querySelector('.icon_col') !== e.target && document.querySelectorAll('.boxMenu') !== e.target && document.querySelector('.boxMenu').style.display !== 'none' && !linha){
    document.querySelector('.boxMenu').style.display = 'none';
  }
  if(boxSelectForCanceladas.querySelector('.icon_col') !== e.target && document.querySelectorAll('.boxMenu.canceladas') !== e.target && document.querySelector('.boxMenu.canceladas').style.display !== 'none' && !linha){
    document.querySelectorAll('.boxMenu.canceladas')[0].style.display = 'none'
  }
});

let ShowHideCol = (element,tabela) => {
  for(let linha of element.querySelectorAll('.linha')){
    linha.addEventListener('click', () => {
      visibleHidden(tabela.querySelectorAll('th')[linha.dataset.ordem]);
      for(let col of tabela.querySelectorAll(`td:nth-child(${Number(linha.dataset.ordem) + 1})`)){
        visibleHidden(col);
      }
      removeAddClass(linha,"ativo")
    });
  }
}
  

AppearCol(tabNotas,boxSelectNotas,true,true);
AppearCol(tabCanceladas,boxSelectCanceladas,true,true);

let slide = tabela =>{
  const slider = tabela
  let isDown = false;
  let startX;
  let scrollLeft;
  
  function inicialize(){
      
      if (slider === undefined || slider === null) return;
      
      slider.addEventListener('mousedown', (e) => {
          isDown = true;
          slider.classList.add('active');
          startX = e.pageX - slider.offsetLeft;
          scrollLeft = slider.scrollLeft;
      });
  
        slider.addEventListener('mouseleave', () => {
          isDown = false;
          slider.classList.remove('active');
      });
  
        slider.addEventListener('mouseup', () => {
          isDown = false;
          slider.classList.remove('active');
      });
  
        slider.addEventListener('mousemove', (e) => {
          if(!isDown) return;
  
          e.preventDefault();
  
          const x = e.pageX - slider.offsetLeft;
  
          const walk = (x - startX) * 1; //scroll-fast
          slider.scrollLeft = scrollLeft - walk;
      });
  } inicialize();
}

slide(tabNotas)
slide(tabCanceladas)

function ExportToExcel(type, fn, dl) {
  var wb = XLSX.utils.table_to_book(tabela, { sheet: "sheet1" });
  return dl ?
      XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
      XLSX.writeFile(wb, fn || ('MySheetName.' + (type || 'xlsx')));
}

let buttons = document.querySelectorAll('button');
for(let button of buttons){
  button.addEventListener('click', (element) => {
    function ExportToExcel(type, fn, dl) {
    var wb = XLSX.utils.table_to_book(button.previousElementSibling, { sheet: "sheet1" });
    return dl ?
        XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
        XLSX.writeFile(wb, fn || ('MySheetName.' + (type || 'xlsx')));
  } ExportToExcel('xlsx')
  });
}
