import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { useToast } from '../components/Toast';
import { categoriasApi } from '../lib/api';
import { Categoria } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function Categorias() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.listar()
  });

  const createMutation = useMutation({
    mutationFn: categoriasApi.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      showToast('success', 'Categoria criada com sucesso');
      setIsCreateModalOpen(false);
    },
    onError: (error: Error) => {
      showToast('error', error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Categoria> }) =>
      categoriasApi.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      showToast('success', 'Categoria atualizada com sucesso');
      setIsEditModalOpen(false);
      setSelectedCategoria(null);
    },
    onError: (error: Error) => {
      showToast('error', error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: categoriasApi.deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      showToast('success', 'Categoria deletada com sucesso');
    },
    onError: (error: Error) => {
      showToast('error', error.message);
    }
  });

  const handleDelete = (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja deletar a categoria "${nome}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    { header: 'Nome', accessor: 'nome' as keyof Categoria },
    { header: 'Descrição', accessor: 'descricao' as keyof Categoria },
    {
      header: 'Status',
      accessor: (row: Categoria) => (
        <Badge variant={row.ativo ? 'success' : 'error'}>
          {row.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      header: 'Ações',
      accessor: (row: Categoria) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCategoria(row);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorias</h2>
          <p className="text-gray-600 mt-1">Gerencie as categorias de produtos</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <Table data={categorias} columns={columns} loading={isLoading} />
      </Card>

      <CategoriaFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={data => createMutation.mutate(data)}
        loading={createMutation.isPending}
        title="Nova Categoria"
      />

      {selectedCategoria && (
        <CategoriaFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategoria(null);
          }}
          onSubmit={data => updateMutation.mutate({ id: selectedCategoria.id, data })}
          loading={updateMutation.isPending}
          title="Editar Categoria"
          initialData={selectedCategoria}
        />
      )}
    </div>
  );
}

interface CategoriaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  title: string;
  initialData?: Categoria;
}

function CategoriaFormModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title,
  initialData
}: CategoriaFormModalProps) {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    ativo: initialData?.ativo ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length > 255) {
      newErrors.nome = 'Nome deve ter no máximo 255 caracteres';
    }

    if (formData.descricao && formData.descricao.length > 500) {
      newErrors.descricao = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome"
          required
          value={formData.nome}
          onChange={e => setFormData({ ...formData, nome: e.target.value })}
          error={errors.nome}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.descricao}
            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.descricao ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.descricao && (
            <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
          )}
        </div>

        <div className="flex items-center">
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

        <div className="flex justify-end gap-3 pt-4">
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
