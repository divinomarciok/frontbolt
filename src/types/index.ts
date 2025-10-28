export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface Regra {
  id: number;
  nome: string;
  categoria_id: number;
  prioridade: number;
  criterio_palavras_chave?: string[];
  criterio_ncm?: string;
  criterio_tamanho_min?: number;
  criterio_tamanho_max?: number;
  criterio_quantidade_min?: number;
  criterio_quantidade_max?: number;
  criterio_categoria?: string;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface ClassificacaoInput {
  descricao: string;
  ncm: string;
  tamanho?: number;
  quantidade?: number;
}

export interface ClassificacaoResult {
  categoria: string | null;
  id_regra: number | null;
  tempo_avaliacao_ms: number;
  criterios_combinados: string[];
}

export interface BatchClassificacaoInput {
  produtos: ClassificacaoInput[];
}

export interface BatchClassificacaoResult {
  resultados: ClassificacaoResult[];
  tempo_total_ms: number;
}

export interface Auditoria {
  id: number;
  id_regra?: number;
  id_produto: string;
  descricao_produto: string;
  ncm_produto: string;
  resultado_classificacao: string | null;
  criterios_combinados?: string[];
  tempo_avaliacao_ms: number;
  data_criacao: string;
}
