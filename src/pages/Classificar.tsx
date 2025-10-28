import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { useToast } from '../components/Toast';
import { classificacaoApi } from '../lib/api';
import { ClassificacaoInput, ClassificacaoResult } from '../types';
import { Upload, Sparkles } from 'lucide-react';

export function Classificar() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Classificar Produtos</h2>
        <p className="text-gray-600 mt-1">
          Classifique produtos individualmente ou em lote usando CSV
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('single')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'single'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Classificação Única
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'batch'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Classificação em Lote
          </button>
        </nav>
      </div>

      {activeTab === 'single' ? <SingleClassification /> : <BatchClassification />}
    </div>
  );
}

function SingleClassification() {
  const [formData, setFormData] = useState<ClassificacaoInput>({
    descricao: '',
    ncm: '',
    tamanho: undefined,
    quantidade: undefined
  });

  const [result, setResult] = useState<ClassificacaoResult | null>(null);
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: classificacaoApi.classificarUnico,
    onSuccess: data => {
      setResult(data);
      if (!data.categoria) {
        showToast('warning', 'Nenhuma categoria encontrada para este produto');
      } else {
        showToast('success', `Produto classificado como: ${data.categoria}`);
      }
    },
    onError: (error: Error) => {
      showToast('error', error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao.trim() || !formData.ncm.trim()) {
      showToast('error', 'Descrição e NCM são obrigatórios');
      return;
    }
    mutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData({ descricao: '', ncm: '', tamanho: undefined, quantidade: undefined });
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Dados do Produto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Descrição"
            required
            value={formData.descricao}
            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Ex: Smartphone Samsung Galaxy"
          />

          <Input
            label="NCM"
            required
            value={formData.ncm}
            onChange={e => setFormData({ ...formData, ncm: e.target.value })}
            placeholder="Ex: 12345678"
          />

          <Input
            label="Tamanho (opcional)"
            type="number"
            value={formData.tamanho || ''}
            onChange={e =>
              setFormData({ ...formData, tamanho: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="Ex: 150"
          />

          <Input
            label="Quantidade (opcional)"
            type="number"
            value={formData.quantidade || ''}
            onChange={e =>
              setFormData({
                ...formData,
                quantidade: e.target.value ? Number(e.target.value) : undefined
              })
            }
            placeholder="Ex: 10"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={mutation.isPending} className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              Classificar
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Limpar
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Resultado da Classificação">
        {!result ? (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Preencha os dados e clique em "Classificar"</p>
            <p className="text-sm mt-1">para ver o resultado aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Categoria</p>
              {result.categoria ? (
                <Badge variant="success" className="text-base px-3 py-1">
                  {result.categoria}
                </Badge>
              ) : (
                <Badge variant="error" className="text-base px-3 py-1">
                  Não classificado
                </Badge>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Regra Aplicada</p>
              <p className="font-medium text-gray-900">
                {result.id_regra ? `Regra #${result.id_regra}` : 'Nenhuma'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tempo de Avaliação</p>
              <p className="font-medium text-gray-900">{result.tempo_avaliacao_ms}ms</p>
            </div>

            {result.criterios_combinados.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Critérios Combinados</p>
                <div className="flex flex-wrap gap-2">
                  {result.criterios_combinados.map((criterio, index) => (
                    <Badge key={index} variant="info">
                      {criterio}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function BatchClassification() {
  const [csvText, setCsvText] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: classificacaoApi.classificarLote,
    onSuccess: data => {
      setResults(data.resultados);
      showToast(
        'success',
        `${data.resultados.length} produtos classificados em ${data.tempo_total_ms}ms`
      );
    },
    onError: (error: Error) => {
      showToast('error', error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvText.trim()) {
      showToast('error', 'Por favor, insira os dados CSV');
      return;
    }

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      showToast('error', 'CSV deve conter pelo menos uma linha de cabeçalho e uma linha de dados');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const descricaoIdx = headers.indexOf('descricao');
    const ncmIdx = headers.indexOf('ncm');
    const tamanhoIdx = headers.indexOf('tamanho');
    const quantidadeIdx = headers.indexOf('quantidade');

    if (descricaoIdx === -1 || ncmIdx === -1) {
      showToast('error', 'CSV deve conter as colunas "descricao" e "ncm"');
      return;
    }

    const produtos = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const produto: ClassificacaoInput = {
        descricao: values[descricaoIdx],
        ncm: values[ncmIdx]
      };

      if (tamanhoIdx !== -1 && values[tamanhoIdx]) {
        produto.tamanho = Number(values[tamanhoIdx]);
      }
      if (quantidadeIdx !== -1 && values[quantidadeIdx]) {
        produto.quantidade = Number(values[quantidadeIdx]);
      }

      return produto;
    });

    if (produtos.length > 1000) {
      showToast('error', 'Máximo de 1000 produtos por lote');
      return;
    }

    mutation.mutate({ produtos });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setCsvText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Upload CSV">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato CSV esperado
            </label>
            <div className="p-3 bg-gray-50 rounded-lg font-mono text-xs text-gray-700">
              descricao,ncm,tamanho,quantidade
              <br />
              Produto 1,12345678,150,10
              <br />
              Produto 2,87654321,200,5
            </div>
            <p className="mt-2 text-sm text-gray-600">
              * Colunas obrigatórias: descricao, ncm
              <br />* Colunas opcionais: tamanho, quantidade
              <br />* Máximo: 1000 produtos por lote
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload de Arquivo
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ou Cole o Conteúdo CSV
            </label>
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              rows={8}
              placeholder="Cole aqui o conteúdo do CSV..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <Button type="submit" loading={mutation.isPending} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Classificar Lote
          </Button>
        </form>
      </Card>

      {results && (
        <Card title={`Resultados (${results.length} produtos)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Regra
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tempo (ms)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Critérios
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm">
                      {result.categoria ? (
                        <Badge variant="success">{result.categoria}</Badge>
                      ) : (
                        <Badge variant="error">Não classificado</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {result.id_regra ? `#${result.id_regra}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {result.tempo_avaliacao_ms}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {result.criterios_combinados?.map((c: string, i: number) => (
                          <Badge key={i} variant="info" className="text-xs">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
