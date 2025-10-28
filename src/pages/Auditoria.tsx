import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { auditoriaApi } from '../lib/api';
import { Auditoria } from '../types';
import { Eye, Calendar } from 'lucide-react';
import { Button } from '../components/Button';

export function AuditoriaPage() {
  const [selectedAuditoria, setSelectedAuditoria] = useState<Auditoria | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: auditorias = [], isLoading } = useQuery({
    queryKey: ['auditoria'],
    queryFn: () => auditoriaApi.listar()
  });

  const handleViewDetail = (auditoria: Auditoria) => {
    setSelectedAuditoria(auditoria);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const columns = [
    {
      header: 'ID Produto',
      accessor: 'id_produto' as keyof Auditoria,
      className: 'font-mono text-xs'
    },
    {
      header: 'Descrição',
      accessor: (row: Auditoria) => (
        <div className="max-w-xs truncate" title={row.descricao_produto}>
          {row.descricao_produto}
        </div>
      )
    },
    {
      header: 'NCM',
      accessor: 'ncm_produto' as keyof Auditoria,
      className: 'font-mono'
    },
    {
      header: 'Resultado',
      accessor: (row: Auditoria) =>
        row.resultado_classificacao ? (
          <Badge variant="success">{row.resultado_classificacao}</Badge>
        ) : (
          <Badge variant="error">Não classificado</Badge>
        )
    },
    {
      header: 'Regra',
      accessor: (row: Auditoria) => (row.id_regra ? `#${row.id_regra}` : '-')
    },
    {
      header: 'Tempo (ms)',
      accessor: 'tempo_avaliacao_ms' as keyof Auditoria
    },
    {
      header: 'Data',
      accessor: (row: Auditoria) => (
        <span className="text-sm">{formatDate(row.data_criacao)}</span>
      )
    },
    {
      header: 'Ações',
      accessor: (row: Auditoria) => (
        <Button size="sm" variant="outline" onClick={() => handleViewDetail(row)}>
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ];

  const sortedAuditorias = [...auditorias].sort(
    (a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
  );

  const stats = {
    total: auditorias.length,
    classificados: auditorias.filter(a => a.resultado_classificacao).length,
    naoClassificados: auditorias.filter(a => !a.resultado_classificacao).length,
    tempoMedio:
      auditorias.length > 0
        ? Math.round(
            auditorias.reduce((acc, a) => acc + a.tempo_avaliacao_ms, 0) / auditorias.length
          )
        : 0
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Auditoria e Histórico</h2>
        <p className="text-gray-600 mt-1">
          Visualize o histórico completo de todas as classificações realizadas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Classificações</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm font-medium text-gray-600">Classificados</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{stats.classificados}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm font-medium text-gray-600">Não Classificados</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{stats.naoClassificados}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{stats.tempoMedio}ms</p>
          </div>
        </Card>
      </div>

      <Card title="Histórico de Classificações">
        <Table data={sortedAuditorias} columns={columns} loading={isLoading} />
      </Card>

      {selectedAuditoria && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAuditoria(null);
          }}
          title="Detalhes da Classificação"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">ID do Produto</p>
                <p className="font-mono text-sm font-medium text-gray-900">
                  {selectedAuditoria.id_produto}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">NCM</p>
                <p className="font-mono font-medium text-gray-900">
                  {selectedAuditoria.ncm_produto}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Descrição do Produto</p>
              <p className="font-medium text-gray-900">{selectedAuditoria.descricao_produto}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Resultado</p>
                {selectedAuditoria.resultado_classificacao ? (
                  <Badge variant="success" className="text-base px-3 py-1">
                    {selectedAuditoria.resultado_classificacao}
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
                  {selectedAuditoria.id_regra ? `Regra #${selectedAuditoria.id_regra}` : 'Nenhuma'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tempo de Avaliação</p>
                <p className="font-medium text-gray-900">
                  {selectedAuditoria.tempo_avaliacao_ms}ms
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Data da Classificação</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedAuditoria.data_criacao)}
                </p>
              </div>
            </div>

            {selectedAuditoria.criterios_combinados &&
              selectedAuditoria.criterios_combinados.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Critérios Combinados</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAuditoria.criterios_combinados.map((criterio, index) => (
                      <Badge key={index} variant="info">
                        {criterio}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </Modal>
      )}
    </div>
  );
}
