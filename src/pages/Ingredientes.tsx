
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getIngredientes, saveIngrediente, deleteIngrediente, Ingrediente, Nutriente, generateId } from "@/lib/storage-utils";

const Ingredientes = () => {
  const { toast } = useToast();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Ingrediente>({
    id: '',
    nome: '',
    preco: 0,
    nutrientes: []
  });
  
  const [novoNutriente, setNovoNutriente] = useState<Partial<Nutriente>>({
    nome: '',
    valor: 0,
    unidade: 'g/kg'
  });
  
  useEffect(() => {
    setIngredientes(getIngredientes());
  }, []);
  
  const handleOpenModal = (ingrediente?: Ingrediente) => {
    if (ingrediente) {
      setFormData({...ingrediente});
    } else {
      setFormData({
        id: generateId(),
        nome: '',
        preco: 0,
        nutrientes: []
      });
    }
    setDialogOpen(true);
  };
  
  const handleAddNutriente = () => {
    if (!novoNutriente.nome || !novoNutriente.valor) {
      toast({
        title: "Erro",
        description: "Preencha o nome e o valor do nutriente",
        variant: "destructive"
      });
      return;
    }
    
    const nutrienteCompleto: Nutriente = {
      id: generateId(),
      nome: novoNutriente.nome,
      valor: Number(novoNutriente.valor),
      unidade: novoNutriente.unidade || 'g/kg'
    };
    
    setFormData({
      ...formData,
      nutrientes: [...formData.nutrientes, nutrienteCompleto]
    });
    
    // Limpar formulário de nutriente
    setNovoNutriente({
      nome: '',
      valor: 0,
      unidade: 'g/kg'
    });
  };
  
  const handleRemoveNutriente = (id: string) => {
    setFormData({
      ...formData,
      nutrientes: formData.nutrientes.filter(n => n.id !== id)
    });
  };
  
  const handleSaveIngrediente = () => {
    if (!formData.nome || formData.preco <= 0) {
      toast({
        title: "Erro",
        description: "Preencha o nome e o preço do ingrediente",
        variant: "destructive"
      });
      return;
    }
    
    saveIngrediente(formData);
    setIngredientes(getIngredientes());
    setDialogOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Ingrediente salvo com sucesso!",
    });
  };
  
  const handleDeleteIngrediente = () => {
    if (deleteId) {
      deleteIngrediente(deleteId);
      setIngredientes(getIngredientes());
      setDeleteDialogOpen(false);
      setDeleteId(null);
      
      toast({
        title: "Sucesso",
        description: "Ingrediente excluído com sucesso!",
      });
    }
  };
  
  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };
  
  return (
    <Layout title="Cadastro de Ingredientes">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Ingredientes Cadastrados</h2>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo Ingrediente
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingredientes.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">
              Nenhum ingrediente cadastrado. Clique em "Novo Ingrediente" para começar.
            </p>
          </div>
        ) : (
          ingredientes.map((ingrediente) => (
            <Card key={ingrediente.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{ingrediente.nome}</CardTitle>
                <CardDescription>R$ {ingrediente.preco.toFixed(2)}/kg</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="font-medium text-sm mb-2">Nutrientes:</p>
                <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                  {ingrediente.nutrientes.map((nutriente) => (
                    <div key={nutriente.id} className="text-sm flex justify-between">
                      <span>{nutriente.nome}:</span>
                      <span>{nutriente.valor} {nutriente.unidade}</span>
                    </div>
                  ))}
                  {ingrediente.nutrientes.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum nutriente cadastrado</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOpenModal(ingrediente)}
                >
                  <Pencil className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => confirmDelete(ingrediente.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {/* Modal para adicionar/editar ingrediente */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.id ? 'Editar Ingrediente' : 'Novo Ingrediente'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do ingrediente abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="nome" className="text-sm font-medium">
                Nome do Ingrediente
              </label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Farelo de Soja"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="preco" className="text-sm font-medium">
                Preço por kg (R$)
              </label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => setFormData({...formData, preco: parseFloat(e.target.value) || 0})}
                placeholder="Ex: 2.50"
              />
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Nutrientes</h4>
              
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Input
                      placeholder="Nome"
                      value={novoNutriente.nome}
                      onChange={(e) => setNovoNutriente({...novoNutriente, nome: e.target.value})}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Valor"
                      value={novoNutriente.valor}
                      onChange={(e) => setNovoNutriente({...novoNutriente, valor: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="Unidade"
                      value={novoNutriente.unidade}
                      onChange={(e) => setNovoNutriente({...novoNutriente, unidade: e.target.value})}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      size="icon"
                      onClick={handleAddNutriente}
                      className="w-full h-full"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {formData.nutrientes.map((nutriente) => (
                    <div key={nutriente.id} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                      <div>
                        <span className="font-medium">{nutriente.nome}:</span>{' '}
                        <span>{nutriente.valor} {nutriente.unidade}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveNutriente(nutriente.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveIngrediente}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este ingrediente? 
              Esta ação não pode ser desfeita e poderá afetar fórmulas existentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteIngrediente}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Ingredientes;
