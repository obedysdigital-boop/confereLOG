import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  try {
    console.log('Limpando dados das tabelas usando SQL direto...');
    
    // Usar SQL direto para garantir a limpeza
    await prisma.$executeRaw`DELETE FROM FretesBI`;
    console.log('✓ FretesBI limpo');
    
    await prisma.$executeRaw`DELETE FROM Carga`;
    console.log('✓ Carga limpo');
    
    await prisma.$executeRaw`DELETE FROM TabelaFrete`;
    console.log('✓ TabelaFrete limpo');
    
    await prisma.$executeRaw`DELETE FROM UploadSession`;
    console.log('✓ UploadSession limpo');
    
    // Verificar contagem
    const cargaCount = await prisma.carga.count();
    const fretesBICount = await prisma.fretesBI.count();
    const tabelaFreteCount = await prisma.tabelaFrete.count();
    const uploadSessionCount = await prisma.uploadSession.count();
    const veiculoCount = await prisma.veiculo.count();
    
    console.log('\n📊 Contagem após limpeza:');
    console.log(`   Carga: ${cargaCount}`);
    console.log(`   FretesBI: ${fretesBICount}`);
    console.log(`   TabelaFrete: ${tabelaFreteCount}`);
    console.log(`   UploadSession: ${uploadSessionCount}`);
    console.log(`   Veiculo: ${veiculoCount} (mantido)`);
    
    console.log('\n✅ Limpeza concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();
