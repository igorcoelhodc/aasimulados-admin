import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileQuestion, 
  PlusCircle, 
  Users, 
  Menu, 
  Bell, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  PlaneTakeoff,
  Trash2,
  Edit,
  Settings,
  Loader2,
  Database,
  LogOut
} from 'lucide-react';

// --- Mapeamento de Categorias (Para bater com o category_id do banco) ---
const CATEGORIES = [
  { id: 1, name: 'Navegação' },
  { id: 2, name: 'Meteorologia' },
  { id: 3, name: 'Regulamentos' },
  { id: 4, name: 'Conhecimentos Técnicos' },
  { id: 5, name: 'Teoria de Voo' }
];

export default function AdminApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- CONFIGURAÇÃO DA API (FIXA) ---
  const API_URL = 'https://aasimulado-api.igor-coelhodc.workers.dev/';

  // --- ESTADOS DA API ---
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);

  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Busca inicial das questões
  useEffect(() => {
    if (currentView === 'questions' || currentView === 'dashboard') {
      fetchQuestions();
    }
  }, [currentView]); // Removido apiUrl da array de dependências

  const fetchQuestions = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/questoes`);
      if (!res.ok) throw new Error(`Erro API: ${res.status}`);
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Não foi possível conectar à API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta questão de forma permanente?")) return;
    
    try {
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/questoes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Erro ao excluir a questão no banco de dados');
      
      alert("Questão excluída com sucesso!");
      fetchQuestions(); // Recarrega a lista
    } catch (err) {
      alert(`Falha ao excluir: ${err.message}`);
    }
  };

  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setCurrentView('add_question');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg('');

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegistering 
      ? { name: authName, email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(`${API_URL.replace(/\/$/, '')}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) throw new Error(data.error || 'Erro na autenticação');

      if (isRegistering) {
        alert('Instrutor cadastrado com sucesso! Faça login agora.');
        setIsRegistering(false);
        // Limpeza dos campos após o cadastro
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
      } else {
        setToken(data.token);
        setUser(data.user);
        // Limpeza dos campos após o login
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    // Destruição da sessão
    setToken(null);
    setUser(null);
    
    // Limpeza de segurança dos campos do formulário
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
  };

  // --- COMPONENTES DE LAYOUT ---
  const SidebarItem = ({ icon: Icon, label, viewId }) => {
    const isActive = currentView === viewId;
    return (
      <button
        onClick={() => { setCurrentView(viewId); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${
          isActive 
            ? 'bg-[#1E88E5] text-white shadow-md shadow-[#1E88E5]/30' 
            : 'text-[#2C3E50]/70 hover:bg-[#1E88E5]/10 hover:text-[#1E88E5]'
        }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  // --- VIEWS ---

  // 1. Dashboard Inicial (Agora com config da API)
  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-[#2C3E50]">Visão Geral</h2>
      
      {/* Banner de Conexão com o Banco */}
      <div className="bg-[#1E88E5]/5 border border-[#1E88E5]/20 p-6 rounded-3xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1E88E5]">
            <Database size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[#2C3E50]">Conexão ao Banco de Dados</h3>
            <p className="text-sm text-[#2C3E50]/70">Status da integração com a API</p>
          </div>
        </div>
        
        {/* Botão de Teste (URL Oculta) */}
        <div className="w-full sm:w-auto flex justify-end">
          <button 
            onClick={fetchQuestions}
            className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-[#1E88E5]/20 transition-all flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Testar Conexão'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
            <FileQuestion size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C3E50]/60">Questões em Cache</p>
            <p className="text-3xl font-bold text-[#2C3E50]">{questions.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 opacity-50">
          <div className="w-14 h-14 rounded-2xl bg-[#1E88E5]/10 flex items-center justify-center text-[#1E88E5]">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C3E50]/60">Alunos</p>
            <p className="text-xl font-bold text-[#2C3E50]">Em breve</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. Lista de Questões
  const QuestionsListView = () => {
    // Helper para achar o nome da categoria pelo ID
    const getCatName = (id) => CATEGORIES.find(c => c.id == id)?.name || `Cat ${id}`;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-[#2C3E50]">Banco de Questões</h2>
          <div className="flex gap-2">
            <button 
              onClick={fetchQuestions}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-[#2C3E50] px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin text-[#1E88E5]" /> : 'Atualizar Lista'}
            </button>
            <button 
              onClick={() => { setEditingQuestion(null); setCurrentView('add_question'); }}
              className="bg-[#FF6D00] hover:bg-[#E66200] text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-[#FF6D00]/30 transition-all flex items-center gap-2"
            >
              <PlusCircle size={20} /> Nova Questão
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar (Em breve...)" 
              disabled
              className="w-full outline-none text-sm text-[#2C3E50] bg-transparent"
            />
          </div>
          
          <div className="overflow-x-auto relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Loader2 size={32} className="animate-spin text-[#1E88E5] mb-2" />
                <p className="text-sm font-medium text-[#2C3E50]/70">Buscando na Cloudflare...</p>
              </div>
            )}

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[#2C3E50]/60 text-sm">
                  <th className="p-4 font-medium">Questão</th>
                  <th className="p-4 font-medium">Matéria</th>
                  <th className="p-4 font-medium text-center">Resp. Correta</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      Nenhuma questão encontrada. Verifique a conexão com a API ou cadastre uma nova.
                    </td>
                  </tr>
                )}
                {questions.map((q, idx) => (
                  <tr key={q.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 max-w-md">
                      <p className="font-medium text-[#2C3E50] line-clamp-2" title={q.question_text}>{q.question_text}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-[#1E88E5]/10 text-[#1E88E5] px-3 py-1 rounded-full text-xs font-semibold">
                        {getCatName(q.category_id)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex w-8 h-8 rounded-full bg-green-100 text-green-700 items-center justify-center font-bold text-sm">
                        {q.correct_answer}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(q)}
                          className="p-2 text-gray-400 hover:text-[#1E88E5] transition-colors" 
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 3. Formulário de Nova Questão
const AddQuestionView = () => {

    const EXAM_OPTIONS = ['PPA', 'PCA', 'PLA', 'PPH', 'PCH', 'AVI', 'CEL', 'GMP', 'CT'];

    const [isSaving, setIsSaving] = useState(false);
    const isEditing = !!editingQuestion;
    
    // Estados inicializados com os dados da questão em edição (ou vazios se for nova)
    const [categoryId, setCategoryId] = useState(isEditing ? editingQuestion.category_id : 1);
    const [questionText, setQuestionText] = useState(isEditing ? editingQuestion.question_text : '');
    const [explanation, setExplanation] = useState(isEditing ? (editingQuestion.explanation || '') : '');
    const [selectedExams, setSelectedExams] = useState(isEditing && editingQuestion.exams ? editingQuestion.exams.split(',') : []);

    const toggleExam = (exam) => {
      setSelectedExams(prev => prev.includes(exam) ? prev.filter(e => e !== exam) : [...prev, exam]);
    };
    
    const [options, setOptions] = useState([
      { letter: 'A', text: isEditing ? editingQuestion.option_a : '', isCorrect: isEditing ? editingQuestion.correct_answer === 'A' : true },
      { letter: 'B', text: isEditing ? editingQuestion.option_b : '', isCorrect: isEditing ? editingQuestion.correct_answer === 'B' : false },
      { letter: 'C', text: isEditing ? editingQuestion.option_c : '', isCorrect: isEditing ? editingQuestion.correct_answer === 'C' : false },
      { letter: 'D', text: isEditing ? editingQuestion.option_d : '', isCorrect: isEditing ? editingQuestion.correct_answer === 'D' : false },
    ]);

    const handleOptionChange = (index, value) => {
      const newOptions = [...options];
      newOptions[index].text = value;
      setOptions(newOptions);
    };

    const setCorrectOption = (index) => {
      const newOptions = options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index
      }));
      setOptions(newOptions);
    };

    const handleSave = async () => {
      if (!questionText.trim()) return alert("O enunciado da questão é obrigatório.");
      if (options.some(o => !o.text.trim())) return alert("Preencha todas as 4 alternativas.");

      if (selectedExams.length === 0) return alert("Selecione pelo menos uma categoria (PPA, PCA, etc).");

      const correctAnswerObj = options.find(o => o.isCorrect);

      const payload = {
        category_id: categoryId,
        question_text: questionText,
        option_a: options[0].text,
        option_b: options[1].text,
        option_c: options[2].text,
        option_d: options[3].text,
        correct_answer: correctAnswerObj.letter,
        explanation: explanation || null,
        exams: selectedExams.join(',')
      };

      setIsSaving(true);
      try {
        const url = isEditing 
          ? `${API_URL.replace(/\/$/, '')}/api/questoes/${editingQuestion.id}` 
          : `${API_URL.replace(/\/$/, '')}/api/questoes`;
          
        const res = await fetch(url, {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Erro ao salvar a questão');
        }

        alert(isEditing ? "Questão atualizada com sucesso!" : "Questão cadastrada com sucesso!");
        setEditingQuestion(null);
        setCurrentView('questions'); 
        
      } catch (err) {
        alert(`Falha ao salvar questão: ${err.message}`);
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl pb-10">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => { setEditingQuestion(null); setCurrentView('questions'); }} 
            className="text-gray-400 hover:text-[#1E88E5]"
          >
            Voltar
          </button>
          <h2 className="text-2xl font-bold text-[#2C3E50]">
            {isEditing ? 'Editar Questão' : 'Cadastrar Nova Questão'}
          </h2>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
          {/* O restante do JSX do formulário (select de matérias, textareas e botões) permanece igual */}
          
          <div className="space-y-2 max-w-sm">
            <label className="text-sm font-semibold text-[#2C3E50]">Matéria (Category)</label>
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 outline-none transition-all text-[#2C3E50] bg-gray-50"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Múltiplas Categorias (Licenças) */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#2C3E50]">Aplicabilidade (Exames/Cursos)</label>
            <div className="flex flex-wrap gap-2">
              {EXAM_OPTIONS.map(exam => (
                <button
                  key={exam}
                  type="button"
                  onClick={() => toggleExam(exam)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    selectedExams.includes(exam) 
                      ? 'bg-[#1E88E5] text-white border-[#1E88E5] shadow-md shadow-[#1E88E5]/30' 
                      : 'bg-gray-50 text-[#2C3E50]/60 border-gray-200 hover:border-[#1E88E5]/50'
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>
            {selectedExams.length === 0 && (
              <p className="text-xs text-[#FF6D00] font-medium">Selecione pelo menos uma categoria.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2C3E50]">Enunciado da Questão</label>
            <textarea 
              rows="3"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Digite o texto da questão aqui..."
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 outline-none transition-all text-[#2C3E50] bg-gray-50 resize-none"
            ></textarea>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#2C3E50]">Alternativas</label>
              <span className="text-xs font-bold text-[#FF6D00] bg-[#FF6D00]/10 px-3 py-1 rounded-full">
                Selecione a resposta correta
              </span>
            </div>
            
            {options.map((opt, index) => (
              <div key={index} className={`flex items-center gap-4 p-2 rounded-xl border-2 transition-all ${opt.isCorrect ? 'border-green-500 bg-green-50' : 'border-transparent bg-gray-50'}`}>
                <button 
                  onClick={() => setCorrectOption(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 ${opt.isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white hover:border-green-400'}`}
                  title="Marcar como correta"
                >
                  {opt.isCorrect && <CheckCircle2 size={18} className="text-white" />}
                </button>
                <span className={`font-bold w-6 text-center ${opt.isCorrect ? 'text-green-700' : 'text-[#2C3E50]/40'}`}>
                  {opt.letter}
                </span>
                <input 
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Texto da alternativa ${opt.letter}`}
                  className="w-full bg-transparent outline-none text-[#2C3E50]"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#2C3E50]">Explicação (Opcional)</label>
            <textarea 
              rows="2"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explique o motivo da resposta estar correta..."
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 outline-none transition-all text-[#2C3E50] bg-gray-50 resize-none text-sm"
            ></textarea>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button 
              onClick={() => { setEditingQuestion(null); setCurrentView('questions'); }}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl font-semibold text-[#2C3E50]/60 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#1E88E5] hover:bg-[#1565C0] disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-[#1E88E5]/30 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <><Loader2 size={20} className="animate-spin" /> Salvando...</>
              ) : (
                <><Database size={20} /> {isEditing ? 'Atualizar' : 'Salvar'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // TELA DE AUTENTICAÇÃO
  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 font-inter text-[#2C3E50]">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-[#1E88E5] text-white rounded-xl flex items-center justify-center">
              <PlaneTakeoff size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Aero<span className="text-[#1E88E5]">Admin</span></h2>
          <p className="text-center text-gray-500 mb-8">
            {isRegistering ? 'Cadastre um novo instrutor' : 'Faça login para acessar o painel'}
          </p>

          {/* O campo de input da API foi deletado daqui */}

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium mb-4 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="text-sm font-semibold mb-1 block">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1E88E5] outline-none"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-semibold mb-1 block">E-mail</label>
              <input 
                type="email" 
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1E88E5] outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Senha</label>
              <input 
                type="password" 
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#1E88E5] outline-none"
              />
            </div>
            <button 
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#FF6D00] hover:bg-[#E66200] text-white py-3 rounded-xl font-semibold transition-colors flex justify-center items-center gap-2 mt-2 shadow-lg shadow-[#FF6D00]/20"
            >
              {authLoading ? <Loader2 size={20} className="animate-spin" /> : (isRegistering ? 'Criar Conta' : 'Entrar no Painel')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }}
              className="text-sm text-[#1E88E5] font-medium hover:underline"
            >
              {isRegistering ? 'Já tem conta? Faça login' : 'Novo instrutor? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-inter text-[#2C3E50]">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 p-6 fixed h-full z-20">
        <div className="flex items-center gap-2 mb-10 pl-2">
          <div className="w-8 h-8 bg-[#1E88E5] text-white rounded-lg flex items-center justify-center">
            <PlaneTakeoff size={20} />
          </div>
          <span className="font-poppins font-bold text-xl tracking-tight">
            Aero<span className="text-[#1E88E5]">Admin</span>
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" viewId="dashboard" />
          <SidebarItem icon={FileQuestion} label="Questões" viewId="questions" />
          <SidebarItem icon={PlusCircle} label="Cadastrar Questão" viewId="add_question" />
          <div className="pt-4 mt-4 border-t border-gray-100 opacity-50 cursor-not-allowed">
             <SidebarItem icon={Users} label="Alunos (Em Breve)" viewId="users" />
          </div>
        </nav>

        {/* User Profile / Logout Desktop */}
        <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E88E5] text-white flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-sm font-bold truncate max-w-[140px]">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Instrutor'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 font-medium hover:bg-red-50 py-2 px-3 rounded-xl transition-colors w-max"
          >
            <LogOut size={16} /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR MOBILE */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 p-6 z-40 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 mb-10 pl-2">
          <div className="w-8 h-8 bg-[#1E88E5] text-white rounded-lg flex items-center justify-center">
            <PlaneTakeoff size={20} />
          </div>
          <span className="font-poppins font-bold text-xl tracking-tight">
            Aero<span className="text-[#1E88E5]">Admin</span>
          </span>
        </div>
        <nav className="space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" viewId="dashboard" />
          <SidebarItem icon={FileQuestion} label="Questões" viewId="questions" />
          <SidebarItem icon={PlusCircle} label="Cadastrar" viewId="add_question" />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
        
        {/* TOPBAR */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 font-medium">
               Painel Administrativo da Nuvem
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm font-bold text-[#2C3E50]">Olá, {user?.name?.split(' ')[0]}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E88E5] to-[#00E5FF] p-[1px]">
              <div className="w-full h-full bg-[#1E88E5] text-white rounded-full flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT RENDERER */}
        <div className="p-6 md:p-10 flex-1">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'questions' && <QuestionsListView />}
          {currentView === 'add_question' && <AddQuestionView />}
        </div>
        
      </main>
    </div>
  );
}