
// Tipos para os ingredientes e fórmulas
export interface Nutriente {
  id: string;
  nome: string;
  valor: number;
  unidade: string;
}

export interface Ingrediente {
  id: string;
  nome: string;
  preco: number;
  nutrientes: Nutriente[];
}

export interface ComponenteFormula {
  ingredienteId: string;
  porcentagem: number;
}

export interface Formula {
  id: string;
  nome: string;
  componentes: ComponenteFormula[];
  nutrientesCalculados?: {[key: string]: {valor: number; unidade: string}};
  precoFinal?: number;
}

// Funções para manipulação do LocalStorage
export function getIngredientes(): Ingrediente[] {
  const ingredientes = localStorage.getItem('ingredientes');
  return ingredientes ? JSON.parse(ingredientes) : [];
}

export function saveIngrediente(ingrediente: Ingrediente): void {
  const ingredientes = getIngredientes();
  const index = ingredientes.findIndex(i => i.id === ingrediente.id);
  
  if (index >= 0) {
    ingredientes[index] = ingrediente;
  } else {
    ingredientes.push(ingrediente);
  }
  
  localStorage.setItem('ingredientes', JSON.stringify(ingredientes));
}

export function deleteIngrediente(id: string): void {
  let ingredientes = getIngredientes();
  ingredientes = ingredientes.filter(i => i.id !== id);
  localStorage.setItem('ingredientes', JSON.stringify(ingredientes));
  
  // Verifique e atualize as fórmulas que usam este ingrediente
  const formulas = getFormulas();
  const formulasAtualizadas = formulas.map(formula => {
    formula.componentes = formula.componentes.filter(c => c.ingredienteId !== id);
    return formula;
  });
  
  localStorage.setItem('formulas', JSON.stringify(formulasAtualizadas));
}

export function getFormulas(): Formula[] {
  const formulas = localStorage.getItem('formulas');
  return formulas ? JSON.parse(formulas) : [];
}

export function saveFormula(formula: Formula): void {
  const formulas = getFormulas();
  const index = formulas.findIndex(f => f.id === formula.id);
  
  if (index >= 0) {
    formulas[index] = formula;
  } else {
    formulas.push(formula);
  }
  
  localStorage.setItem('formulas', JSON.stringify(formulas));
}

export function deleteFormula(id: string): void {
  let formulas = getFormulas();
  formulas = formulas.filter(f => f.id !== id);
  localStorage.setItem('formulas', JSON.stringify(formulas));
}

// Funções para cálculos de fórmulas
export function calcularNutrientes(formula: Formula): {[key: string]: {valor: number; unidade: string}} {
  const ingredientes = getIngredientes();
  const resultados: {[key: string]: {valor: number; unidade: string}} = {};
  
  // Crie um mapa de nutrientes primeiro
  const mapaNutrientes = new Map<string, {valor: number; unidade: string}>();
  
  // Para cada componente da fórmula
  formula.componentes.forEach(componente => {
    const ingrediente = ingredientes.find(i => i.id === componente.ingredienteId);
    if (!ingrediente) return;
    
    const porcentagemDecimal = componente.porcentagem / 100;
    
    // Para cada nutriente do ingrediente
    ingrediente.nutrientes.forEach(nutriente => {
      const valorProporcional = nutriente.valor * porcentagemDecimal;
      
      if (mapaNutrientes.has(nutriente.nome)) {
        const atual = mapaNutrientes.get(nutriente.nome)!;
        if (atual.unidade === nutriente.unidade) {
          mapaNutrientes.set(nutriente.nome, {
            valor: atual.valor + valorProporcional,
            unidade: nutriente.unidade
          });
        }
      } else {
        mapaNutrientes.set(nutriente.nome, {
          valor: valorProporcional,
          unidade: nutriente.unidade
        });
      }
    });
  });
  
  // Converte o mapa para o objeto de resultado
  mapaNutrientes.forEach((valor, chave) => {
    resultados[chave] = valor;
  });
  
  return resultados;
}

export function calcularPrecoFinal(formula: Formula): number {
  const ingredientes = getIngredientes();
  let precoTotal = 0;
  
  formula.componentes.forEach(componente => {
    const ingrediente = ingredientes.find(i => i.id === componente.ingredienteId);
    if (!ingrediente) return;
    
    const porcentagemDecimal = componente.porcentagem / 100;
    precoTotal += ingrediente.preco * porcentagemDecimal;
  });
  
  return parseFloat(precoTotal.toFixed(2));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
