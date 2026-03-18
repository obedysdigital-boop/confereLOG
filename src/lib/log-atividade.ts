import { supabase } from '@/lib/supabase';

interface LogAtividadeParams {
  acao: string;
  tabela: string;
  registroId: string;
  detalhes?: Record<string, any>;
  usuarioEmail?: string;
  tipoUsuario?: string;
}

export async function registrarLogAtividade({
  acao,
  tabela,
  registroId,
  detalhes = {},
  usuarioEmail,
  tipoUsuario = 'usuario',
}: LogAtividadeParams) {
  try {
    // Se não foi passado email, tentar obter do usuário autenticado
    let email = usuarioEmail;
    let userId = null;

    if (!email) {
      try {
        const supabaseServer = createClient();
        const { data: { user } } = await supabaseServer.auth.getUser();
        email = user?.email || 'sistema';
        userId = user?.id || null;
      } catch (error) {
        email = 'sistema';
      }
    }

    const logData = {
      usuario_id: userId,
      usuario: email,
      tipo_usuario: tipoUsuario,
      acao,
      tabela,
      registro_id: registroId,
      detalhes: {
        ...detalhes,
        timestamp: new Date().toISOString(),
      },
    };

    const { error } = await supabase
      .from('logs_atividades')
      .insert(logData);

    if (error) {
      console.error('Erro ao registrar log de atividade:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar log de atividade:', error);
  }
}
