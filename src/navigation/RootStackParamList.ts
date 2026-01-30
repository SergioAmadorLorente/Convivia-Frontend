export type RootStackParamList = {
  Main: undefined;
  Bienvenida: undefined;
  CrearCuenta: undefined;
  IniciarSesion: undefined;
  RecuperarPassword: undefined;
  DashBoardPersonal: undefined;
  NuevaResidencia: undefined;
  UnirResidencia: undefined;
  PoliticaCookiesPrivacidad: undefined;
  TerminosCondiciones: undefined;
  Perfil: undefined;
  EditarPerfil: undefined;
  test: undefined;
  ConviviaPro: undefined;
  CreateTask: { taskToEdit: any } | undefined;
  CreateFactura: { facturaToEdit: any } | undefined;
  InfoLegal: undefined;
  MiResidencia: undefined;
  EditarResidencia: {
    espacioId: string;
    nombreInicial?: string;
    ubicacionInicial?: string;
  };
  FAQ: undefined;
 
};
