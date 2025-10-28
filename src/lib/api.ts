import axios, { AxiosError } from 'axios';
import type {
  Categoria,
  Regra,
  ClassificacaoInput,
  ClassificacaoResult,
  BatchClassificacaoInput,
  BatchClassificacaoResult,
  Auditoria
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response) {
      const message = (error.response.data as any)?.detail || 'Erro ao processar requisição';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Sem resposta do servidor. Verifique sua conexão.');
    } else {
      throw new Error('Erro ao configurar requisição');
    }
  }
);

export const categoriasApi = {
  listar: async (skip = 0, limit = 100) => {
    const { data } = await api.get<Categoria[]>('/api/categorias', { params: { skip, limit } });
    return data;
  },

  obter: async (id: number) => {
    const { data } = await api.get<Categoria>(`/api/categorias/${id}`);
    return data;
  },

  criar: async (categoria: Omit<Categoria, 'id' | 'data_criacao' | 'data_atualizacao'>) => {
    const { data } = await api.post<Categoria>('/api/categorias', categoria);
    return data;
  },

  atualizar: async (id: number, categoria: Partial<Categoria>) => {
    const { data } = await api.put<Categoria>(`/api/categorias/${id}`, categoria);
    return data;
  },

  deletar: async (id: number) => {
    await api.delete(`/api/categorias/${id}`);
  }
};

export const regrasApi = {
  listar: async (skip = 0, limit = 100) => {
    const { data } = await api.get<Regra[]>('/api/regras', { params: { skip, limit } });
    return data;
  },

  obter: async (id: number) => {
    const { data } = await api.get<Regra>(`/api/regras/${id}`);
    return data;
  },

  listarPorCategoria: async (categoriaId: number) => {
    const { data } = await api.get<Regra[]>(`/api/regras/categoria/${categoriaId}`);
    return data;
  },

  criar: async (regra: Omit<Regra, 'id' | 'data_criacao' | 'data_atualizacao'>) => {
    const { data } = await api.post<Regra>('/api/regras', regra);
    return data;
  },

  atualizar: async (id: number, regra: Partial<Regra>) => {
    const { data } = await api.put<Regra>(`/api/regras/${id}`, regra);
    return data;
  },

  deletar: async (id: number) => {
    await api.delete(`/api/regras/${id}`);
  }
};

export const classificacaoApi = {
  classificarUnico: async (input: ClassificacaoInput) => {
    const { data } = await api.post<ClassificacaoResult>('/api/classify', input);
    return data;
  },

  classificarLote: async (input: BatchClassificacaoInput) => {
    const { data } = await api.post<BatchClassificacaoResult>('/api/classify/batch', input);
    return data;
  }
};

export const auditoriaApi = {
  listar: async (skip = 0, limit = 100) => {
    const { data } = await api.get<Auditoria[]>('/api/auditoria', { params: { skip, limit } });
    return data;
  },

  obter: async (id: number) => {
    const { data } = await api.get<Auditoria>(`/api/auditoria/${id}`);
    return data;
  },

  listarPorProduto: async (produtoId: string) => {
    const { data } = await api.get<Auditoria[]>(`/api/auditoria/produto/${produtoId}`);
    return data;
  },

  listarPorRegra: async (regraId: number) => {
    const { data } = await api.get<Auditoria[]>(`/api/auditoria/regra/${regraId}`);
    return data;
  }
};

export default api;
