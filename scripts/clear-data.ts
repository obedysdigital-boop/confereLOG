import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  try {
    console.log('Limpando dados das tabelas...');
    
    // Limpar na ordem correta devido às relações
    await prisma.fretesBI.deleteMany();
    console.log('✓ FretesBI limpo');
    
    await prisma.carga.deleteMany();
    console.log('✓ Carga limpo');
    
    await prisma.tabelaFrete.deleteMany();
    console.log('✓ TabelaFrete limpo');
    
    await prisma.uploadSession.deleteMany();
    console.log('✓ UploadSession limpo');
    
    console.log('\n✅ Todos os dados foram limpos com sucesso!');
    console.log('ℹ️  Tabela Veiculo foi mantida intacta.');
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
