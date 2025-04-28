
import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Beaker, ArrowRight } from "lucide-react";
import { getFormulas, deleteFormula, Formula, getIngredientes } from "@/lib/storage-utils";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CORES = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', 
  '#5DADE2', '#48C9B0', '#F4D03F', '#EB984E', '#EC7063',
  '#AF7AC5', '#7FB3D5', '#73C6B6', '#F7DC6F', '#F0B27A'
];

const ListarFormulas = () => {
  const { toast } = useToast();
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [ingredientes, setIngredientes] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    const formulasCarregadas = getFormulas();
    setFormulas(formulasCarregadas);
    
    // Mapear IDs de ingredientes para seus nomes
    const listaIngredientes = getIngredientes();
    const mapaIngredientes: {[key: string]: string} = {};
    listaIngredientes.forEach(ing => {
      mapaIngredientes[ing.id] = ing.nome;
    });
    setIngredientes(mapaIngredientes);
  }, []);
  
  const handleDeleteFormula = () => {
    if (deleteId) {
      deleteFormula(deleteId);
      setFormulas(getFormulas());
      setDeleteDialogOpen(false);
      setDeleteId(null);
      
      toast({
        title: "Sucesso",
        description: "Fórmula excluída com sucesso!",
      });
    }
  };
  
  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };
  
  const prepararDadosComposicao = (formula: Formula) => {
    return formula.componentes.map(componente => ({
      name: ingredientes[componente.ingredienteId] || 'Desconhecido',
      value: componente.porcentagem
    }));
  };
  
  if (formulas.length === 0) {
    return (
      <Layout title="Fórmulas Salvas">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold mb-4">Nenhuma fórmula salva</h2>
          <p className="text-muted-foreground mb-6">
            Você ainda não possui fórmulas salvas. Crie uma nova fórmula para começar.
          </p>
          <Link to="/formular">
            <Button className="flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              Criar Nova Fórmula
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Fórmulas Salvas">
      <div className="grid grid-cols-1 gap-6">
        {formulas.map((formula) => (
          <Card key={formula.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{formula.nome}</CardTitle>
              <CardDescription>
                Preço: R$ {formula.precoFinal?.toFixed(2) || '0.00'}/kg
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="composicao" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="composicao">Composição</TabsTrigger>
                  <TabsTrigger value="nutrientes">Nutrientes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="composicao" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Ingredientes:</h4>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {formula.componentes.map((componente) => (
                          <div key={componente.ingredienteId} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                            <span>{ingredientes[componente.ingredienteId] || 'Ingrediente não encontrado'}</span>
                            <span>{componente.porcentagem}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepararDadosComposicao(formula)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepararDadosComposicao(formula).map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={CORES[index % CORES.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="nutrientes">
                  {formula.nutrientesCalculados && Object.keys(formula.nutrientesCalculados).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 max-h-48 overflow-y-auto">
                      {Object.entries(formula.nutrientesCalculados).map(([nome, info]) => (
                        <div key={nome} className="flex justify-between">
                          <span className="font-medium">{nome}:</span>
                          <span>{info.valor.toFixed(2)} {info.unidade}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhum nutriente calculado para esta fórmula.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link to="/formular">
                <Button variant="outline" className="flex items-center gap-2">
                  <Beaker className="h-4 w-4" />
                  Nova Fórmula
                </Button>
              </Link>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => confirmDelete(formula.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta fórmula? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFormula}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ListarFormulas;
