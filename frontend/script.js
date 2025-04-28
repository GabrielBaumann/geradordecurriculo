document.addEventListener('DOMContentLoaded', function() {
    // Inicializa navegação do formulário
    initFormNavigation();
    
    // Inicializa validação do formulário
    initFormValidation();
    
    // Inicializa envio do formulário
    initFormSubmission();
});

function initFormNavigation() {
    // Mostrar apenas a primeira seção
    document.querySelectorAll('.form-section').forEach((section, index) => {
        if (index !== 0) {
            section.classList.add('hidden');
        }
    });
    
    // Botões "Continuar"
    document.querySelectorAll('[data-next]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const nextSection = this.getAttribute('data-next');
            if (validateCurrentSection(nextSection - 1)) {
                navigateToSection(nextSection);
            }
        });
    });
    
    // Botões "Voltar"
    document.querySelectorAll('[data-prev]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const prevSection = this.getAttribute('data-prev');
            navigateToSection(prevSection);
        });
    });
    
    function navigateToSection(sectionNumber) {
        // Esconder todas as seções
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        
        // Mostrar seção atual
        const currentSection = document.querySelector(`.form-section[data-section="${sectionNumber}"]`);
        currentSection.classList.remove('hidden');
        currentSection.classList.add('active');
        
        // Atualizar progresso
        updateProgress(sectionNumber);
        
        // Rolar para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function updateProgress(currentSection) {
        const progressPercentage = (currentSection / 4) * 100;
        document.querySelector('.h-1.5 > div').style.width = `${progressPercentage}%`;
        
        // Atualizar passos ativos
        document.querySelectorAll('.flex.justify-between > div').forEach((step, index) => {
            if (index < currentSection) {
                step.classList.remove('bg-gray-200', 'text-gray-600');
                step.classList.add('bg-primary', 'text-white');
            } else {
                step.classList.remove('bg-primary', 'text-white');
                step.classList.add('bg-gray-200', 'text-gray-600');
            }
        });
    }
}

function initFormValidation() {
    // Validação em tempo real para campos obrigatórios
    document.querySelectorAll('[required]').forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // Validação de e-mail
    const emailField = document.querySelector('input[type="email"]');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.value.trim())) {
                showError(this, 'Por favor, insira um e-mail válido');
            } else {
                clearError(this);
            }
        });
    }
    
    function validateField(field) {
        if (field.required && !field.value.trim()) {
            showError(field, 'Este campo é obrigatório');
            return false;
        }
        
        clearError(field);
        return true;
    }
    
    function showError(field, message) {
        const formGroup = field.closest('div');
        if (!formGroup.querySelector('.error-message')) {
            const errorMessage = document.createElement('p');
            errorMessage.className = 'error-message text-red-500 text-xs mt-1';
            errorMessage.textContent = message;
            formGroup.appendChild(errorMessage);
        } else {
            formGroup.querySelector('.error-message').textContent = message;
        }
        field.classList.add('border-red-500');
    }
    
    function clearError(field) {
        const formGroup = field.closest('div');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        field.classList.remove('border-red-500');
    }
    
    // Validar seção atual antes de prosseguir
    window.validateCurrentSection = function(sectionNumber) {
        let isValid = true;
        const section = document.querySelector(`.form-section[data-section="${sectionNumber}"]`);
        
        section.querySelectorAll('[required]').forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            // Rolar para o primeiro erro
            const firstError = section.querySelector('.border-red-500');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        return isValid;
    };
}

function initFormSubmission() {
    const form = document.getElementById('resumeForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar todas as seções
        let isValid = true;
        for (let i = 1; i <= 4; i++) {
            if (!validateCurrentSection(i)) {
                isValid = false;
                navigateToSection(i);
                break;
            }
        }
        
        if (!isValid) {
            return;
        }
        
        // Coletar dados do formulário
        const formData = collectFormData();
        
        // Mostrar loading
        document.getElementById('loadingModal').classList.remove('hidden');
        
        // Gerar PDF
        generatePDF(formData);
    });
}

function collectFormData() {
    const formData = {
        pessoal: {
            nome: document.querySelector('#resumeForm [data-section="1"] input:nth-of-type(1)').value.trim(),
            profissao: document.querySelector('#resumeForm [data-section="1"] input:nth-of-type(2)').value.trim(),
            email: document.querySelector('#resumeForm [data-section="1"] input[type="email"]').value.trim(),
            telefone: document.querySelector('#resumeForm [data-section="1"] input[type="tel"]').value.trim()
        },
        experiencias: [],
        formacoes: [],
        habilidadesTecnicas: [],
        idiomas: []
    };
    
    // Coletar experiências
    document.querySelectorAll('#experiencias > div').forEach(item => {
        formData.experiencias.push({
            empresa: item.querySelector('input:nth-of-type(1)').value.trim(),
            cargo: item.querySelector('input:nth-of-type(2)').value.trim(),
            descricao: item.querySelector('textarea').value.trim()
        });
    });
    
    // Coletar formações
    document.querySelectorAll('#formacoes > div').forEach(item => {
        formData.formacoes.push({
            instituicao: item.querySelector('input:nth-of-type(1)').value.trim(),
            curso: item.querySelector('input:nth-of-type(2)').value.trim()
        });
    });
    
    // Coletar habilidades técnicas
    document.querySelectorAll('#habilidades-tecnicas input[type="text"]').forEach(item => {
        formData.habilidadesTecnicas.push(item.value.trim());
    });
    
    // Coletar idiomas
    document.querySelectorAll('#idiomas-container input[type="text"]').forEach(item => {
        formData.idiomas.push(item.value.trim());
    });
    
    return formData;
}

function generatePDF(data) {
    // Desabilitar botão de envio
    const submitBtn = document.querySelector('#resumeForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Gerando...';
    
    // Enviar dados para o backend
    fetch('http://localhost:3000/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao gerar PDF');
        }
        return response.blob();
    })
    .then(blob => {
        // Criar link de download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Curriculo_${data.pessoal.nome.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Esconder loading
        document.getElementById('loadingModal').classList.add('hidden');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('loadingModal').classList.add('hidden');
        alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    })
    .finally(() => {
        // Reabilitar botão de envio
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-file-pdf mr-2"></i> Gerar Currículo';
    });
}

// Funções para adicionar/remover itens
window.addExperiencia = function() {
    const container = document.getElementById('experiencias');
    const count = container.children.length + 1;
    
    const newItem = document.createElement('div');
    newItem.className = 'bg-gray-50 rounded-xl p-4 border-l-4 border-primary';
    newItem.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="font-medium text-gray-800">Experiência Profissional</h3>
            <button type="button" class="text-gray-400 hover:text-red-500 transition" onclick="removeExperiencia(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="space-y-4">
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-1">Empresa</label>
                <input type="text" class="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" required>
            </div>
            
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-1">Cargo</label>
                <input type="text" class="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" required>
            </div>
            
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-1">Descrição</label>
                <textarea class="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" rows="3" required></textarea>
            </div>
        </div>
    `;
    container.appendChild(newItem);
};

window.removeExperiencia = function(button) {
    const container = document.getElementById('experiencias');
    if (container.children.length > 1) {
        button.closest('.bg-gray-50').remove();
    }
};

window.addFormacao = function() {
    const container = document.getElementById('formacoes');
    const count = container.children.length + 1;
    
    const newItem = document.createElement('div');
    newItem.className = 'bg-gray-50 rounded-xl p-4 border-l-4 border-primary';
    newItem.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="font-medium text-gray-800">Formação Acadêmica</h3>
            <button type="button" class="text-gray-400 hover:text-red-500 transition" onclick="removeFormacao(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="space-y-4">
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-1">Instituição</label>
                <input type="text" class="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" required>
            </div>
            
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-1">Curso/Nível</label>
                <input type="text" class="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" required>
            </div>
        </div>
    `;
    container.appendChild(newItem);
};

window.removeFormacao = function(button) {
    const container = document.getElementById('formacoes');
    if (container.children.length > 1) {
        button.closest('.bg-gray-50').remove();
    }
};

window.addTechnicalSkill = function() {
    const container = document.getElementById('habilidades-tecnicas');
    const newItem = document.createElement('div');
    newItem.className = 'flex items-center space-x-2';
    newItem.innerHTML = `
        <input type="text" class="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Ex: JavaScript">
        <button type="button" class="text-gray-400 hover:text-red-500 transition" onclick="removeSkill(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(newItem);
};

window.removeSkill = function(button) {
    button.closest('.flex.items-center').remove();
};

window.addLanguage = function() {
    const container = document.getElementById('idiomas-container');
    const newItem = document.createElement('div');
    newItem.className = 'flex items-center space-x-2';
    newItem.innerHTML = `
        <input type="text" class="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Ex: Inglês">
        <button type="button" class="text-gray-400 hover:text-red-500 transition" onclick="removeLanguage(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(newItem);
};

window.removeLanguage = function(button) {
    const container = document.getElementById('idiomas-container');
    if (container.children.length > 1) {
        button.closest('.flex.items-center').remove();
    }
};