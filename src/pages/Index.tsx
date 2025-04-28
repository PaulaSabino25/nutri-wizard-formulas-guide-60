
import React from 'react';
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Plus, Beaker, ListFilter } from "lucide-react";

const Index = () => {
  return (
    <Layout title="Calculadora de Rações" showBackButton={false}>
      <div className="flex flex-col items-center mt-8">
        <h2 className="text-2xl font-bold mb-10 text-center">
          Bem-vindo à Calculadora de Rações
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <Link to="/ingredientes" className="menu-button">
            <div className="icon-container">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-lg font-medium">Cadastrar Ingredientes</span>
          </Link>
          
          <Link to="/formular" className="menu-button">
            <div className="icon-container">
              <Beaker className="w-8 h-8" />
            </div>
            <span className="text-lg font-medium">Criar Nova Fórmula</span>
          </Link>
          
          <Link to="/listar-formulas" className="menu-button">
            <div className="icon-container">
              <ListFilter className="w-8 h-8" />
            </div>
            <span className="text-lg font-medium">Listar Fórmulas Salvas</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
