import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Check, Trash2 } from "lucide-react";
import {
  getIngredientes,
  getFormulas,
  saveFormula,
  calcularNutrientes,
  calcularPrecoFinal,
  Ingrediente,
  Formula,
  ComponenteFormula,
  generateId
} from "@/lib/storage-utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Formular = () => {
  const { toast } = useToast();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [formulaNome, setFormulaNome] = useState('');
  const [componentes, setComponentes] = useState<ComponenteFormula[]>([]);
  const [ingredienteSelecionado, setIngredienteSelecionado] = useState('');
  const [porcentagem, setPorcentagem] = useState(0);
  const [nutrientesCalculados, setNutrientesCalculados] = useState<{[key: string]: {valor: number; unidade: string}}>({});
  const [precoFinal, setPrecoFinal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dadosGrafico, setDadosGrafico] = useState<{nome: string; valor: number}[]>([]);
  
  useEffect(() => {
    const ingredientesCarregados = getIngredientes();
    setIngredientes(ingredientesCarregados);
  }, []);
  
  useEffect(() => {
    if (componentes.length > 0) {
      const formula: Formula = {
        id: generateId(),
        nome: "Temporária",
        componentes: componentes
      };
      
      const nutrientes = calcularNutrientes(formula);
      const preco = calcularPrecoFinal(formula);
      
      setNutrientesCalculados(nutrientes);
      setPrecoFinal(preco);
      
      // Preparar dados para o gráfico
      const dadosParaGrafico = Object.entries(nutrientes).map(([nome, info]) => ({
        nome,
        valor: info.valor
      })).slice(0, 10); // Limitar a 10 nutrientes para não sobrecarregar o gráfico
      
      setDadosGrafico(dadosParaGrafico);
    } else {
      setNutrientesCalculados({});
      setPrecoFinal(0);
      setDadosGrafico([]);
    }
  }, [componentes]);
  
  const handleAddComponente = () => {
    if (!ingredienteSelecionado || porcentagem <= 0) {
      toast({
        title: "Erro",
        description: "Selecione um ingrediente e defina uma porcentagem válida.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se o ingrediente já está na fórmula
    const componenteExistente = componentes.find(c => c.ingredienteId === ingredienteSelecionado);
    if (componenteExistente) {
      toast({
        title: "Erro",
        description: "Este ingrediente já foi adicionado à fórmula.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se o total vai ultrapassar 100%
    const totalAtual = componentes.reduce((sum, comp) => sum + comp.porcentagem, 0);
    if (totalAtual + porcentagem > 100) {
      toast({
        title: "Erro",
        description: "A soma das porcentagens não pode ultrapassar 100%.",
        variant: "destructive"
      });
      return;
    }
    
    const novoComponente: ComponenteFormula = {
      ingredienteId: ingredienteSelecionado,
      porcentagem: porcentagem
    };
    
    setComponentes([...componentes, novoComponente]);
    setIngredienteSelecionado('');
    setPorcentagem(0);
  };
  
  const handleRemoveComponente = (ingredienteId: string) => {
    setComponentes(componentes.filter(c => c.ingredienteId !== ingredienteId));
  };
  
  const handleSalvarFormula = () => {
    if (!formulaNome) {
      setDialogOpen(true);
      return;
    }
    
    salvarFormulaFinal();
  };
  
  const salvarFormulaFinal = () => {
    if (!formulaNome) {
      toast({
        title: "Erro",
        description: "Defina um nome para a fórmula.",
        variant: "destructive"
      });
      return;
    }
    
    if (componentes.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um ingrediente à fórmula.",
        variant: "destructive"
      });
      return;
    }
    
    const novaFormula: Formula = {
      id: generateId(),
      nome: formulaNome,
      componentes: componentes,
      nutrientesCalculados: nutrientesCalculados,
      precoFinal: precoFinal
    };
    
    saveFormula(novaFormula);
    
    toast({
      title: "Sucesso",
      description: "Fórmula salva com sucesso!",
    });
    
    // Limpar formulário
    setFormulaNome('');
    setComponentes([]);
    setDialogOpen(false);
  };
  
  const getTotalPorcentagem = () => {
    return componentes.reduce((sum, comp) => sum + comp.porcentagem, 0);
  };
  
  const getIngredienteNome = (id: string) => {
    const ingrediente = ingredientes.find(i => i.id === id);
    return ingrediente ? ingrediente.nome : 'Ingrediente não encontrado';
  };
  
  return (
    <Layout title="Criar Nova Fórmula">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Coluna da esquerda - Ingredientes e composição */}
        <div className="md:col-span-5">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Composição da Ração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-6">
                    <Label htmlFor="ingrediente">Ingrediente</Label>
                    <Select
                      value={ingredienteSelecionado}
                      onValueChange={setIngredienteSelecionado}
                    >
                      <SelectTrigger id="ingrediente">
                        <SelectValue placeholder="Selecione um ingrediente" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredientes.map((ingrediente) => (
                          <SelectItem 
                            key={ingrediente.id} 
                            value={ingrediente.id}
                            disabled={componentes.some(c => c.ingredienteId === ingrediente.id)}
                          >
                            {ingrediente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor="porcentagem">Porcentagem (%)</Label>
                    <Input
                      id="porcentagem"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={porcentagem}
                      onChange={(e) => setPorcentagem(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      size="icon"
                      onClick={handleAddComponente}
                      className="w-full"
                      disabled={!ingredienteSelecionado || porcentagem <= 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Ingredientes adicionados:</p>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {componentes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum ingrediente adicionado. Adicione ingredientes para criar sua fórmula.
                      </p>
                    ) : (
                      componentes.map((componente) => (
                        <div key={componente.ingredienteId} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                          <span>{getIngredienteNome(componente.ingredienteId)}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm">{componente.porcentagem}%</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveComponente(componente.ingredienteId)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-4 flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className={`font-bold ${getTotalPorcentagem() === 100 ? 'text-green-600' : 'text-amber-500'}`}>
                      {getTotalPorcentagem()}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                onClick={handleSalvarFormula}
                disabled={componentes.length === 0}
              >
                Salvar Fórmula
              </Button>
            </CardFooter>
          </Card>
          
          {/* Preço Final */}
          {componentes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Custo da Fórmula</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">
                  R$ {precoFinal.toFixed(2)} <span className="text-sm font-normal">por kg</span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Coluna da direita - Resultados e gráfico */}
        <div className="md:col-span-7">
          {componentes.length > 0 && (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Composição Nutricional</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(nutrientesCalculados).length > 0 ? (
                    <div className="max-h-64 overflow-y-auto grid grid-cols-2 gap-2">
                      {Object.entries(nutrientesCalculados).map(([nome, info]) => (
                        <div key={nome} className="flex justify-between">
                          <span className="font-medium">{nome}:</span>
                          <span>{info.valor.toFixed(2)} {info.unidade}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhum nutriente calculado.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Gráfico de Nutrientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {dadosGrafico.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dadosGrafico}>
                          <XAxis dataKey="nome" tick={{fontSize: 12}} interval={0} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="valor" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Nenhum dado disponível para o gráfico.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      
      {/* Modal para salvar fórmula */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Fórmula</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="formulaNome">Nome da Fórmula</Label>
            <Input
              id="formulaNome"
              value={formulaNome}
              onChange={(e) => setFormulaNome(e.target.value)}
              placeholder="Ex: Ração Inicial para Frango de Corte"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarFormulaFinal} disabled={!formulaNome}>
              <Check className="h-4 w-4 mr-2" /> Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Formular;
