"use client";

import axios from "axios";
import { SessionAdapter } from "@/lib/session-adapter";

// Cria uma instância do Axios com configurações padrão.
// Usar uma instância é crucial para que os interceptores não afetem
// outras possíveis chamadas axios em bibliotecas de terceiros.
export const apiClient = axios.create({
  // Define a URL base para todas as chamadas feitas com este cliente.
  // Assim, você pode fazer apiClient.get('/users') em vez de apiClient.get('/api/users').
  baseURL: "/api",
});

// Adiciona um "interceptor" de requisição.
// Esta função será executada ANTES de CADA requisição feita com `apiClient` ser enviada.
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Tenta obter o token de acesso do cookie usando nosso adapter.
    const accessToken = await SessionAdapter.getAccessToken();

    // 2. Se um token for encontrado, adiciona-o ao cabeçalho 'Authorization'.
    if (accessToken) {
      // O formato `Bearer <token>` é o padrão para autenticação com JWT.
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // 3. Retorna a configuração modificada (ou a original se não houver token)
    // para que a requisição possa continuar.
    return config;
  },
  (error) => {
    console.log("ERROR: ", error);
    // Se ocorrer um erro durante a configuração da requisição, rejeita a promessa.
    return Promise.reject(error);
  }
);
