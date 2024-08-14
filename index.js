let dadosHospedagemArmazenados = [];
atualizarValorTotalNota();

function formataCep(input) {
	var cep = new String(input.value);
	if (cep != "") {
		cep = cep.replace("-", "");
		input.value = cep.substr(0, 5) + "-" + cep.substr(5, 3);
	}
}

function formataCpf(input) {
  var cpf = new String(input.value);
  if (cpf != "") {
      cpf = cpf.replace(/\D/g, ''); // Remove tudo que não é dígito
      if (cpf.length > 11) {
          cpf = cpf.substring(0, 11); // Garante que não tenha mais de 11 dígitos
      }
      input.value = cpf.substr(0, 3) + "." + cpf.substr(3, 3) + "." + cpf.substr(6, 3) + "-" + cpf.substr(9, 2);
  }
}
function formataCnpj(input) {
  var cnpj = new String(input.value);
  if (cnpj != "") {
      cnpj = cnpj.replace(/\D/g, ''); // Remove tudo que não é dígito
      if (cnpj.length > 14) {
          cnpj = cnpj.substring(0, 14); // Garante que não tenha mais de 14 dígitos
      }
      input.value = cnpj.substr(0, 2) + "." + cnpj.substr(2, 3) + "." + cnpj.substr(5, 3) + "/" + cnpj.substr(8, 4) + "-" + cnpj.substr(12, 2);
  }
}

function formataDocumento(input) {
  tipoTomador = document.getElementById('select_tomador').value
  if (tipoTomador === "Pessoa Física") {
    formataCpf(input)
  } else if (tipoTomador === "Pessoa Jurídica") {
    formataCnpj(input)
  }
  documentoHospede = document.getElementById('hospedeCpf').value
  if (tipoTomador != "Hospede Extrangeiro") {
    formataCpf(document.getElementById('hospedeCpf'))
  }
}

function formataTelefone(input) {
    var phone = new String(input.value);
    if (phone != "") {
        // Remove tudo que não é dígito
        phone = phone.replace(/\D/g, '');
        
        if (phone.length <= 10) {
            // Formato para números fixos (XX XXXX-XXXX)
            input.value = phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        } else if (phone.length <= 11) {
            // Formato para números celulares (XX XXXXX-XXXX)
            input.value = phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else {
            // Se o número for maior que 11 dígitos, mantemos só os primeiros 11
            phone = phone.substring(0, 11);
            if (phone.length <= 10) {
                input.value = phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
            } else {
                input.value = phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
            }
        }
    }
}

function formataDataBrasileira(data) {
  const [year, month, day] = data.split('-');
  return `
    ${day}/${month}/${year}
    `;
}

function proibeString(event) {
    var input = event.target;
    var value = input.value;
    // Remove caracteres não numéricos
    input.value = value.replace(/[^0-9]/g, '');
}

function buscarEnderecoPorCep(input) {
  var cep = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos

  if (cep != "") {
		cep = cep.replace("-", "");
		input.value = cep.substr(0, 5) + "-" + cep.substr(5, 3);
	}

  if (cep.length === 8) {
      // Requisição à API dos Correios
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
          .then(response => response.json())
          .then(data => {
              if (data.erro) {
                  alert('CEP não encontrado');
                  limparCamposEndereco();
              } else {
                  // Preenche os campos com os dados retornados
                  document.getElementById('tomadorLogradouro').value = data.logradouro;
                  document.getElementById('tomadorBairro').value = data.bairro;
                  document.getElementById('tomadorCidade').value = data.localidade;
                  document.getElementById('tomadorEstado').value = data.uf;
                  
                  // Se necessário, mostre o campo de país
                  if (document.getElementById('pais')) {
                      document.getElementById('pais').style.display = 'none';
                  }
              }
          })
          .catch(error => {
              console.error('Erro ao buscar o CEP:', error);
              alert('Ocorreu um erro ao buscar o CEP.');
              limparCamposEndereco();
          });
  } else {
      // Limpa os campos se o CEP for inválido
      limparCamposEndereco();
  }
}

function limparCamposEndereco() {
  document.getElementById('tomadorLogradouro').value = '';
  document.getElementById('tomadorBairro').value = '';
  document.getElementById('tomadorCidade').value = '';
  document.getElementById('tomadorEstado').value = '';
  // Se necessário, limpe o campo de país
  if (document.getElementById('pais')) {
      document.getElementById('pais').style.display = 'none';
  }
}

function validarValor(id, valor) {
  const elemento = document.getElementById(id);
  if (valor < 0) {
    elemento.classList.add("border-danger");
    return false;
  } else {
    elemento.classList.remove("border-danger");
    return true;
  }
}

function validarCampo(id, valor) {
  const elemento = document.getElementById(id);
  const valido = !!valor; // Verifica se valor não é nulo, indefinido, ou falso

  if (valido) {
    elemento.classList.remove("border-danger");
  } else {
    elemento.classList.add("border-danger");
  }

  return valido;
}

function validarDadosSolicitacao(dados) {
  const { numeroEstadas, mostrarEndereco, hotel, tipoTomador, tomadorDocumento, tomadorRazao, tomadorEmail, tomadorCep, tomadorLogradouro, tomadorBairro, tomadorCidade, tomadorEstado, tomadorPais, hospedeNome, hospedeCpf, valorTotalNota } = dados;

  // Valida o nome do hotel
  if (!validarCampo('hotel', hotel)) {
    scrollToElement('hotel');
    new bootstrap.Modal(document.getElementById('modalNomeHotelInvalido')).show();
    return false;
  }

  // Valida o documento do tomador
  if (!validarCampo('tomadorDocumento', tomadorDocumento)) {
    scrollToElement('tomadorDocumento');
    new bootstrap.Modal(document.getElementById('modalDocumentoTomadorInvalido')).show();
    return false;
  }

  // Valida CPF ou CNPJ do tomador, dependendo do tipo
  if (tipoTomador === "Pessoa Física" && !validarCPF(tomadorDocumento)) {
    scrollToElement('tomadorDocumento');
    new bootstrap.Modal(document.getElementById('modalCpfCnpjInvalido')).show();
    return false;
  } else if (tipoTomador === "Pessoa Jurídica" && !validaCNPJ(tomadorDocumento)) {
    scrollToElement('tomadorDocumento');
    new bootstrap.Modal(document.getElementById('modalCpfCnpjInvalido')).show();
    return false;
  }

  // Valida a razão social do tomador
  if (!validarCampo('tomadorRazao', tomadorRazao)) {
    scrollToElement('tomadorRazao');
    new bootstrap.Modal(document.getElementById('modalRazaoSocialInvalida')).show();
    return false;
  }

  // Valida o endereço do tomador, se necessário
  if (mostrarEndereco) {
    if (!validarCampo('tomadorCep', tomadorCep) || !validaCEP(tomadorCep)) {
      scrollToElement('tomadorCep');
      new bootstrap.Modal(document.getElementById('modalEnderecoInvalido')).show();
      return false;
    }

    if (!validarCampo('tomadorLogradouro', tomadorLogradouro)) {
      scrollToElement('tomadorLogradouro');
      new bootstrap.Modal(document.getElementById('modalEnderecoInvalido')).show();
      return false;
    }

    if (!validarCampo('tomadorBairro', tomadorBairro)) {
      scrollToElement('tomadorBairro');
      new bootstrap.Modal(document.getElementById('modalEnderecoInvalido')).show();
      return false;
    }

    if (!validarCampo('tomadorCidade', tomadorCidade)) {
      scrollToElement('tomadorCidade');
      new bootstrap.Modal(document.getElementById('modalEnderecoInvalido')).show();
      return false;
    }

    if (!validarCampo('tomadorEstado', tomadorEstado)) {
      scrollToElement('tomadorEstado');
      new bootstrap.Modal(document.getElementById('modalEnderecoInvalido')).show();
      return false;
    }

    if (tipoTomador === "Hospede Extrangeiro" && !validarCampo('tomadorPais', tomadorPais)) {
      scrollToElement('tomadorPais');
      new bootstrap.Modal(document.getElementById('modalEnderecoInvalido')).show();
      return false;
    }
  }

  // Valida o e-mail do tomador
  if (!validarCampo('tomadorEmail', tomadorEmail) || !validarEmail(tomadorEmail)) {
    scrollToElement('tomadorEmail');
    new bootstrap.Modal(document.getElementById('modalEmailInvalido')).show();
    return false;
  }

  // Valida o CPF do hóspede
  if (tipoTomador != "Hospede Extrangeiro"){
    if (!validarCampo('hospedeCpf', hospedeCpf) || !validarCPF(hospedeCpf)) {
      scrollToElement('hospedeCpf');
      new bootstrap.Modal(document.getElementById('modalCpfHospedeInvalido')).show();
      return false;
    }
  } else if (!validarCampo('hospedeCpf', hospedeCpf)) {
      scrollToElement('hospedeCpf');
      new bootstrap.Modal(document.getElementById('modalCpfHospedeInvalido')).show();
      return false;
    }

  // Valida o nome do hóspede
  if (!validarCampo('hospedeNome', hospedeNome)) {
    scrollToElement('hospedeNome');
    new bootstrap.Modal(document.getElementById('modalNomeHospedeInvalido')).show();
    return false;
  }

  // Valida o número de estadas
  if (numeroEstadas === 0) {
    scrollToElement('estada');
    new bootstrap.Modal(document.getElementById('modalNumeroEstadasInvalido')).show();
    return false;
  }

  // Valida o valor total da nota
  if (valorTotalNota <= 0) {
    scrollToElement('valorTotalNota');
    new bootstrap.Modal(document.getElementById('modalValorTotalInvalido')).show();
    return false;
  }

  return true;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function mostrarModal(modalId) {
  const modalElement = document.getElementById(modalId);
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

function validarDadosHospedagem(estada, checkIn, checkOut, numeroHospedes, valorDiaria, valorConsumo, valorEstacionamento, valorTotalEstada) {
  // Valida os campos de check-in e check-out
  const checkOutValido = validarCampo("checkOut", checkOut);
  const checkInValido = validarCampo("checkIn", checkIn);
  
  // Valida os campos de valores
  const valorDiariaValido =  validarValor("valorDiaria", valorDiaria);
  const valorConsumoValido = validarValor("consumo", valorConsumo);
  const valorEstacionamentoValido = validarValor("estacionamento", valorEstacionamento);

  // Valida o campo estada
  if (!estada || estada.length > 6) {
    document.getElementById("estada").classList.add("border-danger");
    mostrarModal("modalEstadaInvalida");
    return false;
  } else {
    document.getElementById("estada").classList.remove("border-danger");
  }

  // Valida as datas
  if (!checkOutValido || !checkInValido) {
    mostrarModal("modalDatasInvalidas");
    return false;
  }

  // Verifica o valor total da estada
  if (valorTotalEstada == 0) {
    document.getElementById("valorDiaria").classList.add("border-danger");
    document.getElementById("consumo").classList.add("border-danger");
    document.getElementById("estacionamento").classList.add("border-danger");
    mostrarModal("modalValoresInvalidos");
    return false;
  } else {
    document.getElementById("valorDiaria").classList.remove("border-danger");
    document.getElementById("consumo").classList.remove("border-danger");
    document.getElementById("estacionamento").classList.remove("border-danger");
  }

  // Valida os valores
  if (!valorDiariaValido || !valorConsumoValido || !valorEstacionamentoValido) {
    mostrarModal("modalValoresNegativos");
    return false;
  }

  // Valida o número de hóspedes
  if (!validarCampo("numeroHospedes", numeroHospedes) || numeroHospedes <= 0) {
    document.getElementById("numeroHospedes").classList.add("border-danger");
    mostrarModal("modalNumeroHospedesInvalido");
    return false;
  } else {
    document.getElementById("numeroHospedes").classList.remove("border-danger");
  }

  return true;
}


function gerarIdUnico() {
  return Math.random().toString(36).substring(2, 15);
}

function armazenarDadosHospedagem() {
  try {
    let estada = document.getElementById('estada').value.trim();
    let checkIn = document.getElementById('checkIn').value;
    let checkInFormatado = formataDataBrasileira(checkIn);
    let checkOut = document.getElementById('checkOut').value;
    let checkOutFormatado = formataDataBrasileira(checkOut);
    let valorDiaria = parseFloat(document.getElementById('valorDiaria').value) || 0;
    let quantidadeDiarias = parseFloat(document.getElementById('quantidadeDiarias').value) || 0;
    let valorEstacionamento = parseFloat(document.getElementById('estacionamento').value) || 0;
    let valorConsumo = parseFloat(document.getElementById('consumo').value) || 0;
    let numeroHospedes = parseFloat(document.getElementById('numeroHospedes').value) || 1;
    
    // Coletar valores das diárias extras
    const diariasExtras = [];
    let diariasExtrasInputs = document.querySelectorAll('#diariasExtras input.form-control');
    diariasExtrasInputs.forEach(input => {
      let valor = parseFloat(input.value);
      if (!Number.isNaN(valor) && valor !== 0) {
        diariasExtras.push(valor);
      }
    });

    let valorDiariasExtras = diariasExtras.reduce((acc, valor) => acc + valor, 0);

    let valorTotalEstada = ((valorDiaria + valorDiariasExtras) * quantidadeDiarias) + valorEstacionamento + valorConsumo;

    // Validação dos dados
    if (!validarDadosHospedagem(estada, checkIn, checkOut, numeroHospedes, valorDiaria, valorConsumo, valorEstacionamento, valorTotalEstada)) {
      return;
    }

    // Dividir o valor total das diárias se a opção estiver marcada
    if (document.getElementById('checkbox_dividirNota').checked) {
      valorTotalEstada = ((valorDiaria + valorDiariasExtras) / numeroHospedes * quantidadeDiarias) + ((valorEstacionamento + valorConsumo) / numeroHospedes);
    } else {
      numeroHospedes = 1;
    }

    const id = gerarIdUnico();
    const dadosHospedagem = {
      id,
      estada,
      checkIn: checkInFormatado,
      checkOut: checkOutFormatado,
      quantidadeDiarias,
      valorDiarias: [valorDiaria, ...diariasExtras], // Incluir todas as diárias, incluindo extras
      divididoPor: numeroHospedes,
      valorEstacionamento,
      valorConsumo,
      valorTotalEstada
    };

    dadosHospedagemArmazenados.push(dadosHospedagem);

    atualizarValorTotalNota();
    renderizarListaHospedagem();
    document.getElementById("gerar-pdf").disabled = false

    mostrarModal('modalEstadaSalva');
    // Limpar os campos de entrada após armazenar os dados
    limparCamposEntrada();
  } catch (error) {
    alert('Ocorreu um erro ao armazenar os dados da hospedagem: ' + error.message);
  }
}



function adicionaDiaria() {
  const container = document.getElementById('diariasExtras');
  container.className = 'input-group';

  const newDiv = document.createElement('div');
  newDiv.className = 'input-group mt-2';

  const prependDiv = document.createElement('div');
  prependDiv.className = 'input-group-prepend';

  const span = document.createElement('span');
  span.className = 'input-group-text';
  span.textContent = 'R$';

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'form-control formatted-number';
  input.placeholder = 'Digite o valor unitário da diária';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-danger';
  button.innerHTML = '-';
  button.onclick = function () {
    container.removeChild(newDiv);
  };

  prependDiv.appendChild(span);
  newDiv.appendChild(prependDiv);
  newDiv.appendChild(input);
  newDiv.appendChild(button);
  container.appendChild(newDiv);
}

function mostrarCampoDividirNota() {
  const dividirNota = document.getElementById('checkbox_dividirNota').checked;
  document.getElementById('dividirNota').style.display = dividirNota ? 'block' : 'none'
}

function calcularDiarias() {
  let checkIn = document.getElementById('checkIn').value;
  let checkOut = document.getElementById('checkOut').value;
  try {
    if (checkIn && checkOut) {
      let dataCheckIn = new Date(checkIn);
      let dataCheckOut = new Date(checkOut);
      
      if (isNaN(dataCheckIn) || isNaN(dataCheckOut)) {
        mostrarModal("modalDatasInvalidas");
        return;
      }

      let diferenca = Math.ceil((dataCheckOut - dataCheckIn) / (1000 * 60 * 60 * 24));

      if (diferenca == 0) {
        diferenca = diferenca + 1;
      }

      if (diferenca < 0) {
        mostrarModal("modalDiferencaNegativa");
        document.getElementById('checkOut').value = "";
        diferenca = undefined;
      } else if (diferenca > 30) {
        mostrarModalAviso()
      }

      document.getElementById('quantidadeDiarias').value = diferenca;

    }
  } catch (error) {
    mostrarModal("modalErro", "Ocorreu um erro: " + error.message);
  }
}

// Função para mostrar o modal de aviso com configuração personalizada
function mostrarModalAviso() {
  const modalElement = document.getElementById('modalDiariasExcessivas');
  
  // Configuração do modal com backdrop static para não fechar ao clicar fora e keyboard false
  const modal = new bootstrap.Modal(modalElement, {
    backdrop: 'static', // Impede o fechamento ao clicar fora
    keyboard: false // Impede o fechamento com a tecla Esc
  });

  modal.show();
}

// Função para limpar os campos de data e quantidade de diárias
function recusarDiarias() {
  document.getElementById('checkIn').value = '';
  document.getElementById('checkOut').value = '';
  document.getElementById('quantidadeDiarias').value = '';
}


// Função para mostrar modais
function mostrarModal(modalId, mensagem) {
  const modalElement = document.getElementById(modalId);
  if (mensagem) {
    modalElement.querySelector('.modal-body').textContent = mensagem;
  }
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

function atualizarValorTotalNota() {
  const valorTotalNota = dadosHospedagemArmazenados.reduce((acc, dados) => acc + dados.valorTotalEstada, 0);
  document.getElementById('valorTotal').value = valorTotalNota.toFixed(2).replace('.', ',');
}

function limparCamposEntrada() {
  document.getElementById('estada').value = '';
  document.getElementById('checkIn').value = '';
  document.getElementById('checkOut').value = '';
  document.getElementById('valorDiaria').value = '';
  document.getElementById('quantidadeDiarias').value = '';
  document.getElementById('estacionamento').value = '';
  document.getElementById('consumo').value = '';
  document.getElementById('checkbox_dividirNota').checked = false;
  document.getElementById('numeroHospedes').value = 1;
  document.getElementById('diariasExtras').innerHTML = '';
}

function renderizarListaHospedagem() {
  const tabela = document.getElementById('listaHospedagem').getElementsByTagName('tbody')[0];

  if (tabela) {
    tabela.innerHTML = ''; // Limpar a tabela antes de adicionar novas linhas

    dadosHospedagemArmazenados.forEach(dados => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${dados.estada}</td>
        <td>${dados.checkIn}</td>
        <td>${dados.checkOut}</td>
        <td>R$${dados.valorTotalEstada.toFixed(2).replace('.', ',')}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="excluirHospedagem('${dados.id}')">Excluir</button>
          <button class="btn btn-primary btn-sm" onclick="editarHospedagem('${dados.id}')">Editar</button>
        </td>
      `;
      
      tabela.appendChild(tr);
    });
  }
}

function editarHospedagem(id) {
  const dados = dadosHospedagemArmazenados.find(dados => dados.id === id);

  if (dados) {
    document.getElementById('estada').value = dados.estada;
    document.getElementById('checkIn').value = dados.checkIn.trim().split('/').reverse().join('-');
    document.getElementById('checkOut').value = dados.checkOut.trim().split('/').reverse().join('-');
    document.getElementById('valorDiaria').value = dados.valorDiarias[0].toFixed(2).replace('.', ','); // Apenas o primeiro valor

    // Verifica se há mais de um valor de diária antes de adicionar os campos das diárias extras
    if (dados.valorDiarias.length > 1) {
      const diariasExtrasContainer = document.getElementById('diariasExtras');
      diariasExtrasContainer.innerHTML = '';

      dados.valorDiarias.slice(1).forEach(valor => {
        const newDiv = document.createElement('div');
        newDiv.className = 'input-group mt-2';

        const prependDiv = document.createElement('div');
        prependDiv.className = 'input-group-prepend';

        const span = document.createElement('span');
        span.className = 'input-group-text';
        span.textContent = 'R$';

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'form-control formatted-number';
        input.placeholder = 'Digite o valor unitário da diária';
        input.value = valor.toFixed(2).replace('.', ',');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-danger';
        button.innerHTML = '-';
        button.onclick = function () {
          diariasExtrasContainer.removeChild(newDiv);
        };

        prependDiv.appendChild(span);
        newDiv.appendChild(prependDiv);
        newDiv.appendChild(input);
        newDiv.appendChild(button);
        diariasExtrasContainer.appendChild(newDiv);
      });
    }

    if (dados.divididoPor != 1) {
      document.getElementById('checkbox_dividirNota').checked = true;
      mostrarCampoDividirNota()
      document.getElementById('numeroHospedes').value = dados.divididoPor;
    }

    // Preencher os demais campos
    document.getElementById('quantidadeDiarias').value = dados.quantidadeDiarias;
    document.getElementById('estacionamento').value = dados.valorEstacionamento.toFixed(2).replace('.', ',');
    document.getElementById('consumo').value = dados.valorConsumo.toFixed(2).replace('.', ',');

    // Remover a hospedagem atual da lista para que possa ser atualizada
    dadosHospedagemArmazenados = dadosHospedagemArmazenados.filter(dados => dados.id !== id);
    atualizarValorTotalNota();
    renderizarListaHospedagem();

    // Abre o modal
    const modalElement = document.getElementById('modalEstada');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }


}

function excluirHospedagem(id) {
  dadosHospedagemArmazenados = dadosHospedagemArmazenados.filter(dados => dados.id !== id);
  atualizarValorTotalNota();
  renderizarListaHospedagem();
}



function obterMenorData(datas) {
  return datas.reduce((menor, atual) => new Date(atual) < new Date(menor) ? atual : menor);
}

function obterMaiorData(datas) {
  return datas.reduce((maior, atual) => new Date(atual) > new Date(maior) ? atual : maior);
}


function imprime() {
  // Coleta dos dados do formulário
  const hotel = document.getElementById('hotel').value;
  const tipoTomador = document.getElementById('select_tomador').value;
  const tomadorDocumento = document.getElementById('tomadorDocumento').value;
  const tomadorRazao = document.getElementById('tomadorRazao').value;
  const tomadorCep = document.getElementById('tomadorCep').value;
  const tomadorLogradouro = document.getElementById('tomadorLogradouro').value;
  const tomadorNumero = document.getElementById('tomadorNumero').value || "N/A";
  const tomadorComplemento = document.getElementById('tomadorComplemento').value || "N/A";
  const tomadorBairro = document.getElementById('tomadorBairro').value;
  const tomadorCidade = document.getElementById('tomadorCidade').value;
  const tomadorEstado = document.getElementById('tomadorEstado').value;
  const tomadorPais = document.getElementById('tomadorPais').value;
  const tomadorEmail = document.getElementById('tomadorEmail').value;
  const tomadorTelefone = document.getElementById('tomadorTelefone').value;
  const mostrarEndereco = document.getElementById('checkbox_endereco').checked;
  const observacao = document.getElementById('observacao').value;
  const hospedeNome = document.getElementById('hospedeNome').value;
  const hospedeCpf = document.getElementById('hospedeCpf').value;
  const valorTotalNota = document.getElementById("valorTotal").value;
  

  // Dados da hospedagem
  const estadas = dadosHospedagemArmazenados.map(dados => dados.estada).join(' | ');
  const valorDiarias = dadosHospedagemArmazenados
    .map(dados => dados.valorDiarias.map(valor => `R$${valor.toFixed(2).replace('.', ',')}`).join(' + '))
    .join(' | ');
  const quantidadeDiarias = dadosHospedagemArmazenados.reduce((acc, dados) => acc + dados.quantidadeDiarias, 0);
  const datasCheckOut = dadosHospedagemArmazenados.map(dados => dados.checkOut).join(' | ');
  const datasCheckIn = dadosHospedagemArmazenados.map(dados => dados.checkIn).join(' | ');

  const valorTotalConsumo = dadosHospedagemArmazenados.reduce((acc, dados) => acc + dados.valorConsumo, 0).toFixed(2).replace('.', ',');
  const valorTotalEstacionamento = dadosHospedagemArmazenados.reduce((acc, dados) => acc + dados.valorEstacionamento, 0).toFixed(2).replace('.', ',');

  // Coletar dados dos elementos do DOM e outros dados
  const dados = {
    numeroEstadas: dadosHospedagemArmazenados.length,
    mostrarEndereco: document.getElementById('checkbox_endereco').checked,
    hotel: hotel,
    tipoTomador: tipoTomador,
    tomadorDocumento: tomadorDocumento,
    tomadorRazao: tomadorRazao,
    tomadorCep: tomadorCep,
    tomadorLogradouro: tomadorLogradouro,
    tomadorBairro: tomadorBairro,
    tomadorCidade: tomadorCidade,
    tomadorEstado: tomadorEstado,
    tomadorPais: tomadorPais,
    tomadorEmail: tomadorEmail,
    hospedeNome: hospedeNome,
    hospedeCpf: hospedeCpf,
    valorTotalNota: valorTotalNota
  };

  // Chamar a função de validação
  if (!validarDadosSolicitacao(dados)) {
    return; // Interrompe a execução se a validação falhar
  }

  // Cria a nova janela
  const w = window.open('', '_blank', 'toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1');
  w.document.write("<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'>");
  w.document.write("<link rel='stylesheet' href='style.css'>");
  w.document.write("<script src='index.js'></script>");
  w.document.write("<div class='container my-5' style='border:solid windowtext .5pt; padding:5.65pt'>");

  // Adiciona os dados ao HTML
  w.document.write(`
    <table class='table'>
      <tr>
        <td></td>
        <td class="align-middle" width="70%"><h3>Solicitação de Nota Fiscal</h3></td>
        <td></td>
        <td><img src="logo.png" alt="Logo da empresa" class="img-fluid"></td>
      </tr>
    </table>
    <table class='table'>
      <tr>
        <td style='border:solid windowtext .5pt' width="10%">HOTEL:</td>
        <th style='border:solid windowtext .5pt' width="30%" class="text-center"><span>${hotel}</span></th>
        <td style='border:solid windowtext .5pt' width="10%">ESTADA:</td>
        <th style='border:solid windowtext .5pt' width="10%" class="text-center"><span>${estadas}</span></th>
        <td style='border:solid windowtext .5pt' width="20%">TIPO DE TOMADOR:</td>
        <th style='border:solid windowtext .5pt' width="20%" class="text-center"><span>${tipoTomador}</span></th>
      </tr>
    </table>
    <h6>Dados do Tomador</h6>
    <table class='table'>
      <tr>
        <td style='border:solid windowtext .5pt' width='20%'>DOCUMENTO:</td>
        <th style='border:solid windowtext .5pt' width='20%'><span>${tomadorDocumento}</span></th>
        <td style='border:solid windowtext .5pt' width='20%'>RAZÃO SOCIAL/NOME:</td>
        <th style='border:solid windowtext .5pt'><span>${tomadorRazao}</span></th>
      </tr>
      <tr>
        <td style='border:solid windowtext .5pt' width='20%'>TELEFONE:</td>
        <th style='border:solid windowtext .5pt' width='20%'><span>${tomadorTelefone}</span></th>
        <td style='border:solid windowtext .5pt' width='20%'>E-MAIL:</td>
        <th style='border:solid windowtext .5pt'><span>${tomadorEmail}</span></th>
      </tr>
    </table>
    ${mostrarEndereco ? `
      <br>
      <h6>Endereço do Tomador</h6>
      <table class='table'>
        <tr>
          <td style='border:solid windowtext .5pt'>CEP:</td>
          <th style='border:solid windowtext .5pt'><span>${tomadorCep}</span></th>
          <td style='border:solid windowtext .5pt'>LOGRADOURO:</td>
          <th style='border:solid windowtext .5pt' colspan="3"><span>${tomadorLogradouro}</span></th>
        </tr>
        <tr>
          <td style='border:solid windowtext .5pt'>NÚMERO:</td>
          <th style='border:solid windowtext .5pt'><span>${tomadorNumero}</span></th>
          <td style='border:solid windowtext .5pt'>COMPLEMENTO:</td>
          <th style='border:solid windowtext .5pt' colspan="3"><span>${tomadorComplemento}</span></th>
        </tr>
        <tr>
          <td style='border:solid windowtext .5pt' width='20%'>BAIRRO:</td>
          <th style='border:solid windowtext .5pt' width='20%'><span>${tomadorBairro}</span></th>
          <td style='border:solid windowtext .5pt' width='20%'>CIDADE:</td>
          <th style='border:solid windowtext .5pt' width='20%'><span>${tomadorCidade}</span></th>
          <td style='border:solid windowtext .5pt' width='10%'>ESTADO:</td>
          <th style='border:solid windowtext .5pt'><span>${tomadorEstado}</span></th>
        </tr>
        ${tipoTomador === "Hospede Extrangeiro" ? `
          <tr>
            <td style='border:solid windowtext .5pt'>PAIS:</td>
            <th style='border:solid windowtext .5pt' colspan="3"><span>${tomadorPais}</span></th>
          </tr>
        ` : ''}
      </table>
    ` : ''}
    <br>
    <h6>Descrição da Nota</h6>
    <table class='table' width='100%'>
      <tr>
        <td style='border:solid windowtext .5pt'>OBSERVAÇÃO:</td>
        <th style='border:solid windowtext .5pt' colspan="3"><span>${observacao}</span></th>
      </tr>
      <tr>
        <td style='border:solid windowtext .5pt' width='20%'>CPF:</td>
        <th style='border:solid windowtext .5pt' width='20%'><span>${hospedeCpf}</span></th>
        <td style='border:solid windowtext .5pt' width='20%'>HÓSPEDE:</td>
        <th style='border:solid windowtext .5pt'><span>${hospedeNome}</span></th>
      </tr>
      <tr>
        <td style='border:solid windowtext .5pt' colspan="2">DATA DE CHECK-IN:</td>
        <th style='border:solid windowtext .5pt' colspan="2"><span>${datasCheckIn}</span></th>
      </tr>
      <tr>
        <td style='border:solid windowtext .5pt' colspan="2">DATA DE CHECK-OUT:</td>
        <th style='border:solid windowtext .5pt' colspan="2"><span>${datasCheckOut}</span></th>
      </tr>
      <tr>
        <td style='border:solid windowtext .5pt' colspan="2">QUANTIDADE DE DIÁRIAS:</td>
        <th style='border:solid windowtext .5pt' colspan="2"><span>${quantidadeDiarias}</span></th>
      </tr>
      ${valorDiarias !== "R$0,00" ? `
        <tr>
          <td style='border:solid windowtext .5pt' colspan="2">VALOR DA DIÁRIA:</td>
          <th style='border:solid windowtext .5pt' colspan="2"><span>${valorDiarias}</span></th>
        </tr>
      ` : ''}
      ${valorTotalEstacionamento !== "0,00" ? `
        <tr>
          <td style='border:solid windowtext .5pt' colspan="2">ESTACIONAMENTO:</td>
          <th style='border:solid windowtext .5pt' colspan="2"><span>R$${valorTotalEstacionamento}</span></th>
        </tr>
      ` : ''}
      ${valorTotalConsumo !== "0,00" ? `
        <tr>
          <td style='border:solid windowtext .5pt' colspan="2">CONSUMO:</td>
          <th style='border:solid windowtext .5pt' colspan="2"><span>R$${valorTotalConsumo}</span></th>
        </tr>
      ` : ''}
      <tr>
        <td style='border:solid windowtext .5pt' colspan="2">VALOR TOTAL DA NOTA FISCAL:</td>
        <th style='border:solid windowtext .5pt' colspan="2"><span>R$${valorTotalNota}</span></th>
      </tr>
    </table>
    <br>
    <div class="d-grid">
      <button type='button' id="imprime" class='btn btn-primary' onclick='window.print();'>Imprimir</button>
    </div>
  </div>`);
  w.document.close();
}


function mostrar_endereco() {
  var checkboxEndereco = document.getElementById("checkbox_endereco");
  var endereco = document.getElementById("endereco");

  if (checkboxEndereco.checked) {
    endereco.style.display = "block";
  } else {
    endereco.style.display = "none";
  }
}

function seleciona_tomador() {
  var selector = document.getElementById("select_tomador");
  var switchEndereco = document.getElementById("checkbox_endereco");
  var checkboxUsarDados = document.getElementById('checkbox_preencher');
  var hotel = document.getElementById("hotel").value;

  if (selector.value === "Hospede Extrangeiro") {
    switchEndereco.checked = true;
    switchEndereco.disabled = true;
  } else if (selector.value === "Pessoa Jurídica") {
    switchEndereco.disabled = true;
    switchEndereco.checked = true;
    checkboxUsarDados.checked = false;
    checkboxUsarDados.disabled = true;
    preencherDadosOnChange(checkboxUsarDados);
  } else {
    switchEndereco.checked = false;
    switchEndereco.disabled = false; // Habilita o checkbox
    checkboxUsarDados.checked = true;
    checkboxUsarDados.disabled = false;
    preencherDadosOnChange(checkboxUsarDados);
  }

  // Verifica se o hotel selecionado está em Florianópolis e o tomador é Pessoa Física
  if (hotel.includes("Florianópolis") || hotel.includes("Belém") || hotel.includes("Terezina") || hotel.includes("Rio de Janeiro") || hotel.includes("Belo Horizonte") || hotel.includes("João Pessoa") || hotel.includes("Fóz do Iguaçu")) {
    switchEndereco.checked = true;
    switchEndereco.disabled = true;
  }

  // Mostra ou esconde o campo de país para tomador estrangeiro
  var campoPais = document.getElementById('pais');
  if (selector.value === "Hospede Extrangeiro") {
    campoPais.style.display = "block";
    document.getElementById("tomadorPais").className = "obrigatorio form-control";
  } else {
    campoPais.style.display = "none";
    document.getElementById("tomadorPais").className = "form-control";
  }
}


function preencherDadosOnChange(checkbox) {
  if (checkbox.checked) {
    let tomadorDocumento = document.getElementById('tomadorDocumento').value;
    let razaoSocial = document.getElementById('tomadorRazao').value;

    document.getElementById('hospedeNome').value = razaoSocial;
    document.getElementById('hospedeCpf').value = tomadorDocumento;

    document.getElementById('hospedeNome').disabled = true;
    document.getElementById('hospedeCpf').disabled = true;
  } else {
    // Limpar os campos e habilitar caso o checkbox seja desmarcado
    document.getElementById('hospedeNome').value = '';
    document.getElementById('hospedeCpf').value = '';

    document.getElementById('hospedeNome').disabled = false;
    document.getElementById('hospedeCpf').disabled = false;
  }
}

function scrollToElement(id) {
  const element = document.getElementById(id);
  if (element) {
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.scrollY;
      const elementHeight = elementRect.height;
      const viewportHeight = window.innerHeight;

      // Calcula o ponto de scroll para centralizar o elemento na tela
      const scrollToY = elementTop - (viewportHeight / 2) + (elementHeight / 2);

      window.scrollTo({
          top: scrollToY,
          behavior: 'smooth'
      });
  } else {
      console.error('Elemento com o ID "' + id + '" não encontrado.');
  }
}

function validaCEP(cep) {
  // Remove todos os caracteres que não são dígitos
  cep = cep.replace(/\D/g, '');
  
  // Verifica se o CEP tem exatamente 8 dígitos
  if (cep.length === 8) {
      return true;
  }
  return false;
}

function validaCNPJ(cnpj) {
  // Retira todos os caracteres especiais
  cnpj = cnpj.replace(/[^\d]+/g, '');

  // Verifica o tamanho do cnpj para conter 14 digitos exatos
  if (cnpj.length !== 14) return false;

  let soma = 0;
  let resto;
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Validação do primeiro dígito verificador
  for (let i = 0; i < 12; i++) {
      soma += cnpj[i] * pesos1[i];
  }
  resto = soma % 11;
  if (resto < 2) {
      if (cnpj[12] !== '0') return false;
  } else {
      if (cnpj[12] !== (11 - resto).toString()) return false;
  }

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 13; i++) {
      soma += cnpj[i] * pesos2[i];
  }
  resto = soma % 11;
  if (resto < 2) {
      if (cnpj[13] !== '0') return false;
  } else {
      if (cnpj[13] !== (11 - resto).toString()) return false;
  }

  return true;
}

function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]+/g, '');

  // Verifica se o CPF tem 11 dígitos
  if (cpf.length !== 11) {
      return false;
  }

  // Verifica se todos os dígitos são iguais (caso típico de CPF inválido)
  if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
  }

  // Função para calcular um dos dígitos verificadores
  function calcularDigito(cpf, pesoInicial) {
      let soma = 0;
      for (let i = 0; i < cpf.length; i++) {
          soma += parseInt(cpf.charAt(i)) * (pesoInicial - i);
      }
      let resto = soma % 11;
      return (resto < 2) ? 0 : 11 - resto;
  }

  // Calcula o primeiro dígito verificador
  let digito1 = calcularDigito(cpf.substring(0, 9), 10);
  // Calcula o segundo dígito verificador
  let digito2 = calcularDigito(cpf.substring(0, 9) + digito1, 11);

  // Verifica se os dígitos calculados são iguais aos fornecidos
  return digito1 === parseInt(cpf.charAt(9)) && digito2 === parseInt(cpf.charAt(10));
}
