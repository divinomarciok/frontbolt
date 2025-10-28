import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { useToast } from '../components/Toast';
import { regrasApi, categoriasApi } from '../lib/api';
import { Regra } from '../types';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export function Regras() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRegra, setSelectedRegra] = useState<Regra | null>(null);
  const [filterCategoria, setFilterCategoria] = useState<number | null>(null);

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.listar()
  });

  const { data: regras = [], isLoading } = useQuery({
    queryKey: ['regras', filterCategoria],
    queryFn: () =>
      filterCategoria ? regrasApi.listarPorCategoria(filterCategoria) : regrasApi.listar()
  });

  const createMutation = useMutation({
    mutationFn: regrasApi.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras'] });
      showToast('success', 'Regra criada com sucesso');
      setIsCreateModalOpen(false);
    },
    onError: (error: Error) => {
      showToast('error', error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Regra> }) =>
      regrasApi.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras'] });
      showToast('success', 'Regra atualizada com sucesso');
      setIsEditModalOpen(false);
      setSelectedRegra(null);
    },
    onError: (error: Error) => {
      showToast('error', error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: regrasApi.deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras'] });
      showToast('success', 'Regra deletada com sucesso');
    },
    onError: (error: Error) => {
      showToast('error', error.message);
    }
  });

  const handleDelete = (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja deletar a regra "${nome}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getCategoriaName = (id: number) => {
    return categorias.find(c => c.id === id)?.nome || 'N/A';
  };

  const columns = [
    { header: 'Nome', accessor: 'nome' as keyof Regra },
    {
      header: 'Categoria',
      accessor: (row: Regra) => getCategoriaName(row.categoria_id)
    },
    { header: 'Prioridade', accessor: 'prioridade' as keyof Regra },
    {
      header: 'Status',
      accessor: (row: Regra) => (
        <Badge variant={row.ativo ? 'success' : 'error'}>
          {row.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      header: 'Ações',
      accessor: (row: Regra) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedRegra(row);
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.id, row.nome)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const sortedRegras = [...regras].sort((a, b) => b.prioridade - a.prioridade);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Regras de Classificação</h2>
          <p className="text-gray-600 mt-1">Gerencie as regras de classificação de produtos</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Regra
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Categoria
          </label>
          <div className="flex gap-2">
            <select
              value={filterCategoria || ''}
              onChange={e => setFilterCategoria(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as Categorias</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
            {filterCategoria && (
              <Button variant="outline" onClick={() => setFilterCategoria(null)}>
                Limpar Filtro
              </Button>
            )}
          </div>
        </div>

        <Table data={sortedRegras} columns={columns} loading={isLoading} />
      </Card>

      <RegraFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={data => createMutation.mutate(data)}
        loading={createMutation.isPending}
        title="Nova Regra"
        categorias={categorias}
      />

      {selectedRegra && (
        <RegraFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRegra(null);
          }}
          onSubmit={data => updateMutation.mutate({ id: selectedRegra.id, data })}
          loading={updateMutation.isPending}
          title="Editar Regra"
          initialData={selectedRegra}
          categorias={categorias}
        />
      )}
    </div>
  );
}

interface RegraFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  title: string;
  categorias: any[];
  initialData?: Regra;
}

function RegraFormModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title,
  categorias,
  initialData
}: RegraFormModalProps) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    categoria_id: initialData?.categoria_id || '',
    prioridade: initialData?.prioridade || 50,
    criterio_palavras_chave: initialData?.criterio_palavras_chave || [],
    criterio_ncm: initialData?.criterio_ncm || '',
    criterio_tamanho_min: initialData?.criterio_tamanho_min || '',
    criterio_tamanho_max: initialData?.criterio_tamanho_max || '',
    criterio_quantidade_min: initialData?.criterio_quantidade_min || '',
    criterio_quantidade_max: initialData?.criterio_quantidade_max || '',
    criterio_categoria: initialData?.criterio_categoria || '',
    ativo: initialData?.ativo ?? true
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.categoria_id) {
      newErrors.categoria_id = 'Categoria é obrigatória';
    }

    const hasCriteria =
      formData.criterio_palavras_chave.length > 0 ||
      formData.criterio_ncm ||
      formData.criterio_tamanho_min ||
      formData.criterio_tamanho_max ||
      formData.criterio_quantidade_min ||
      formData.criterio_quantidade_max ||
      formData.criterio_categoria;

    if (!hasCriteria) {
      newErrors.criteria = 'Pelo menos um critério deve ser fornecido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submitData: any = {
        nome: formData.nome,
        categoria_id: Number(formData.categoria_id),
        prioridade: Number(formData.prioridade),
        ativo: formData.ativo
      };

      if (formData.criterio_palavras_chave.length > 0) {
        submitData.criterio_palavras_chave = formData.criterio_palavras_chave;
      }
      if (formData.criterio_ncm) submitData.criterio_ncm = formData.criterio_ncm;
      if (formData.criterio_tamanho_min) submitData.criterio_tamanho_min = Number(formData.criterio_tamanho_min);
      if (formData.criterio_tamanho_max) submitData.criterio_tamanho_max = Number(formData.criterio_tamanho_max);
      if (formData.criterio_quantidade_min) submitData.criterio_quantidade_min = Number(formData.criterio_quantidade_min);
      if (formData.criterio_quantidade_max) submitData.criterio_quantidade_max = Number(formData.criterio_quantidade_max);
      if (formData.criterio_categoria) submitData.criterio_categoria = formData.criterio_categoria;

      onSubmit(submitData);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setFormData({
        ...formData,
        criterio_palavras_chave: [...formData.criterio_palavras_chave, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setFormData({
      ...formData,
      criterio_palavras_chave: formData.criterio_palavras_chave.filter((_, i) => i !== index)
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <Input
          label="Nome da Regra"
          required
          value={formData.nome}
          onChange={e => setFormData({ ...formData, nome: e.target.value })}
          error={errors.nome}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.categoria_id}
            onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.categoria_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
          {errors.categoria_id && (
            <p className="mt-1 text-sm text-red-600">{errors.categoria_id}</p>
          )}
        </div>

        <Input
          label="Prioridade (0-100)"
          type="number"
          min="0"
          max="100"
          value={formData.prioridade}
          onChange={e => setFormData({ ...formData, prioridade: Number(e.target.value) })}
          helperText="Regras com maior prioridade são avaliadas primeiro"
        />

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Critérios de Classificação</h4>
          {errors.criteria && (
            <p className="mb-3 text-sm text-red-600">{errors.criteria}</p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palavras-chave
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={e => setNewKeyword(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Digite uma palavra-chave"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="button" onClick={addKeyword}>
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.criterio_palavras_chave.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <Input
              label="NCM"
              value={formData.criterio_ncm}
              onChange={e => setFormData({ ...formData, criterio_ncm: e.target.value })}
              placeholder="Ex: 12345678"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tamanho Mínimo"
                type="number"
                value={formData.criterio_tamanho_min}
                onChange={e => setFormData({ ...formData, criterio_tamanho_min: e.target.value })}
              />
              <Input
                label="Tamanho Máximo"
                type="number"
                value={formData.criterio_tamanho_max}
                onChange={e => setFormData({ ...formData, criterio_tamanho_max: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantidade Mínima"
                type="number"
                value={formData.criterio_quantidade_min}
                onChange={e => setFormData({ ...formData, criterio_quantidade_min: e.target.value })}
              />
              <Input
                label="Quantidade Máxima"
                type="number"
                value={formData.criterio_quantidade_max}
                onChange={e => setFormData({ ...formData, criterio_quantidade_max: e.target.value })}
              />
            </div>

            <Input
              label="Categoria do Produto"
              value={formData.criterio_categoria}
              onChange={e => setFormData({ ...formData, criterio_categoria: e.target.value })}
              placeholder="Ex: Eletrônicos"
            />
          </div>
        </div>

        <div className="flex items-center pt-4">
          <input
            type="checkbox"
            id="ativo"
            checked={formData.ativo}
            onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
            Ativo
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
