import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TokenService } from "@/service/auth/token.service";
import { DASHBOARD_PAGE, LOGIN_PAGE } from "@/lib/navigation";

// Instancia o serviço fora da função para melhor performance (reutilização)
const tokenService = new TokenService();

export async function pagesMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Helpers de Redirecionamento ---

  const redirectToLogin = () => {
    console.log(
      `Middleware: Acesso negado para '${pathname}'. Redirecionando para login.`
    );
    const response = NextResponse.redirect(new URL(LOGIN_PAGE, request.url));

    // CORREÇÃO CRÍTICA: O middleware não pode usar SessionAdapter (que usa 'js-cookie').
    // Ele deve manipular os cookies diretamente na resposta que está sendo enviada.
    response.cookies.delete("auth_tokens");

    return response;
  };

  const redirectToDashboard = () =>
    NextResponse.redirect(new URL(DASHBOARD_PAGE, request.url));

  // --- Lógica Principal ---

  const cookieToken = request.cookies.get("auth_tokens")?.value;

  // 1. Se não há cookie, o usuário não está logado.
  if (!cookieToken) {
    // Se ele já está na página de login, pode ficar.
    if (pathname === LOGIN_PAGE) {
      return NextResponse.next();
    }
    // Se está em qualquer outra página, é redirecionado para o login.
    return redirectToLogin();
  }

  // 2. Se há um cookie, verifica a validade do access token.
  let sessionPayload = null;
  try {
    const parsed = JSON.parse(cookieToken);
    const accessToken = parsed?.access_token;

    if (accessToken) {
      // A única verificação: o token é válido AGORA?
      sessionPayload = await tokenService.verifyToken(accessToken);
    }
  } catch (err) {
    // O cookie está malformado, considera o usuário como não logado.
    console.error(
      "Middleware: Erro ao processar o cookie de autenticação:",
      err
    );
    return redirectToLogin(); // Apaga o cookie inválido e redireciona.
  }

  const isUserAuthenticated = !!sessionPayload;
  const isAtLoginPage = pathname === LOGIN_PAGE;

  // 3. Decide o que fazer com base no status de autenticação e na localização.

  // Se o usuário está na página de login:
  if (isAtLoginPage) {
    // E está autenticado, manda ele para o dashboard.
    if (isUserAuthenticated) {
      return redirectToDashboard();
    }
    // E não está autenticado, deixa ele ficar.
    return NextResponse.next();
  }

  // Se o usuário está em uma página protegida:
  // E NÃO está autenticado, manda ele para o login.
  if (!isUserAuthenticated) {
    return redirectToLogin();
  }

  // Se chegou até aqui, o usuário está autenticado e em uma página protegida.
  // Pode prosseguir.
  return NextResponse.next();
}
