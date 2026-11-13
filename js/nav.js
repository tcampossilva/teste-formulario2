/**
 * Finalização de Evento - Controle de Formulário e Interatividade
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fechado');
  const btnSubmit = document.getElementById('btn');
  const spinner = btnSubmit ? btnSubmit.querySelector('.spinner') : null;
  const btnText = btnSubmit ? btnSubmit.querySelector('.btn-label') : null;
  const statusMessage = document.getElementById('statusMessage');

  // 1. MÁSCARA E FORMATAÇÃO DA PLACA (Maiúsculas automáticas)
  const placaInput = document.getElementById('placa');
  if (placaInput) {
    placaInput.addEventListener('input', (e) => {
      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      if (val.length > 8) val = val.slice(0, 8);
      e.target.value = val;
    });
  }

  // 2. TOGGLE CONDICIONAL: APOIO POLICIAL
  const simApoio = document.getElementById('simApoio');
  const naoApoio = document.getElementById('naoApoio');
  const dadosApoio = document.getElementById('dadosApoioPolicial');

  function atualizarVisibilidadeApoio() {
    if (!dadosApoio) return;
    if (simApoio && simApoio.checked) {
      dadosApoio.classList.remove('is-hidden');
    } else {
      dadosApoio.classList.add('is-hidden');
    }
  }

  if (simApoio && naoApoio) {
    simApoio.addEventListener('change', atualizarVisibilidadeApoio);
    naoApoio.addEventListener('change', atualizarVisibilidadeApoio);
    atualizarVisibilidadeApoio(); // Inicializa o estado
  }

  // 3. GERENCIAMENTO DE UPLOAD E PRÉ-VISUALIZAÇÃO DE FOTOS
  const inputFotos = document.getElementById('fotos');
  const fotosVeiculo = document.getElementById('fotosVeiculo');
  const dropzone = document.getElementById('dropzone');
  let dataTransfer = new DataTransfer();

  if (inputFotos && fotosVeiculo) {
    // Adicionar novas fotos ao selecionar
    inputFotos.addEventListener('change', (e) => {
      const novosArquivos = Array.from(e.target.files);
      novosArquivos.forEach((file) => {
        if (file.type.startsWith('image/')) {
          dataTransfer.items.add(file);
        }
      });
      inputFotos.files = dataTransfer.files;
      renderizarFotos();
    });

    // Suporte para Drag and Drop
    if (dropzone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('dragover');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach((file) => {
          if (file.type.startsWith('image/')) {
            dataTransfer.items.add(file);
          }
        });
        inputFotos.files = dataTransfer.files;
        renderizarFotos();
      });
    }
  }

  function renderizarFotos() {
    if (!fotosVeiculo) return;
    fotosVeiculo.innerHTML = '';

    Array.from(dataTransfer.files).forEach((file, index) => {
      const card = document.createElement('div');
      card.className = 'foto-preview-card';

      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = file.name;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn-remove-foto';
      removeBtn.innerHTML = '&times;';
      removeBtn.title = 'Remover esta foto';

      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        URL.revokeObjectURL(img.src);
        removerFoto(index);
      });

      card.appendChild(img);
      card.appendChild(removeBtn);
      fotosVeiculo.appendChild(card);
    });
  }

  function removerFoto(indiceParaRemover) {
    const novoDataTransfer = new DataTransfer();
    Array.from(dataTransfer.files).forEach((file, i) => {
      if (i !== indiceParaRemover) {
        novoDataTransfer.items.add(file);
      }
    });
    dataTransfer = novoDataTransfer;
    inputFotos.files = dataTransfer.files;
    renderizarFotos();
  }

  // 4. SUBMISSÃO ASSÍNCRONA VIA FETCH (FORMSUBMIT.CO AJAX)
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Estado de carregamento do botão
      if (btnSubmit) {
        btnSubmit.disabled = true;
        if (btnText) btnText.textContent = 'Enviando relatório...';
        if (spinner) spinner.style.display = 'inline-block';
      }

      if (statusMessage) {
        statusMessage.style.display = 'none';
        statusMessage.innerHTML = '';
      }

      try {
        const formData = new FormData(form);
        const actionUrl = form.getAttribute('action') || 'https://formsubmit.co/ajax/tcampossilva@hotmail.com.br';

        const response = await fetch(actionUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          if (statusMessage) {
            statusMessage.className = 'status-box status-success';
            statusMessage.innerHTML = `
              <strong>✓ Evento finalizado com sucesso!</strong>
              <p>Os dados foram transmitidos e registrados.</p>
              <button type="button" class="btn-secondary" id="btnNovoEvento">Preencher Novo Evento</button>
            `;
            statusMessage.style.display = 'block';

            document.getElementById('btnNovoEvento')?.addEventListener('click', () => {
              form.reset();
              dataTransfer = new DataTransfer();
              if (inputFotos) inputFotos.files = dataTransfer.files;
              renderizarFotos();
              atualizarVisibilidadeApoio();
              statusMessage.style.display = 'none';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });
          }

          // Limpa as fotos após o envio bem-sucedido
          dataTransfer = new DataTransfer();
          if (inputFotos) inputFotos.files = dataTransfer.files;
          renderizarFotos();
          window.scrollTo({ top: 0, behavior: 'smooth' });

        } else {
          throw new Error('Falha no envio do formulário');
        }
      } catch (error) {
        console.error('Erro na submissão:', error);
        if (statusMessage) {
          statusMessage.className = 'status-box status-error';
          statusMessage.innerHTML = `
            <strong>✕ Não foi possível enviar o formulário.</strong>
            <p>Verifique sua conexão e tente novamente.</p>
          `;
          statusMessage.style.display = 'block';
        }
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          if (btnText) btnText.textContent = 'Finalizar e Enviar';
          if (spinner) spinner.style.display = 'none';
        }
      }
    });
  }
});
