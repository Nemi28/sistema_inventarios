export interface CambiarPasswordData {
  password_actual: string;
  password_nueva: string;
  password_confirmacion: string;
}

export interface CambiarPasswordResponse {
  success: boolean;
  mensaje: string;
}

export interface SolicitarRecuperacionData {
  email: string;
}

export interface SolicitarRecuperacionResponse {
  success: boolean;
  mensaje: string;
  dev_reset_link?: string;
  dev_token?: string;
}

export interface ValidarTokenResponse {
  success: boolean;
  mensaje: string;
  data?: {
    email: string;
  };
}

export interface ResetearPasswordData {
  token: string;
  password_nueva: string;
  password_confirmacion: string;
}

export interface ResetearPasswordResponse {
  success: boolean;
  mensaje: string;
}