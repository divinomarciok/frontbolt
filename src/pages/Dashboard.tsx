import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/Card';
import { categoriasApi, regrasApi } from '../lib/api';
import { Folder, FileText, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { data: categorias = [], isLoading: loadingCategorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.listar()
  });

  const { data: regras = [], isLoading: loadingRegras } = useQuery({
    queryKey: ['regras'],
    queryFn: () => regrasApi.listar()
  });

  const stats = [
    {
      title: 'Total de Categorias',
      value: categorias.length,
      icon: Folder,
      color: 'bg-blue-500',
      link: '/categorias'
    },
    {
      title: 'Total de Regras',
      value: regras.length,
      icon: FileText,
      color: 'bg-green-500',
      link: '/regras'
    },
    {
      title: 'Regras Ativas',
      value: regras.filter(r => r.ativo).length,
      icon: Activity,
      color: 'bg-amber-500',
      link: '/regras'
    }
  ];

  const topCategorias = categorias
    .map(cat => ({
      ...cat,
      count: regras.filter(r => r.categoria_id === cat.id).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Visão geral do sistema de classificação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loadingCategorias || loadingRegras ? '...' : stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Categorias Mais Usadas">
          {loadingCategorias || loadingRegras ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : topCategorias.length > 0 ? (
            <div className="space-y-3">
              {topCategorias.map((cat, index) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-semibold rounded-full text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{cat.nome}</p>
                      <p className="text-sm text-gray-500">
                        {cat.count} {cat.count === 1 ? 'regra' : 'regras'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Nenhuma categoria encontrada</p>
          )}
        </Card>

        <Card title="Links Rápidos">
          <div className="space-y-3">
            {[
              { title: 'Nova Categoria', link: '/categorias', desc: 'Criar uma nova categoria' },
              { title: 'Nova Regra', link: '/regras', desc: 'Adicionar regra de classificação' },
              { title: 'Classificar Produtos', link: '/classificar', desc: 'Classificar produtos únicos ou em lote' },
              { title: 'Ver Auditoria', link: '/auditoria', desc: 'Histórico de classificações' }
            ].map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg hover:from-blue-100 transition-colors group"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
