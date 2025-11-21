// Importación de utilidades y temas de estilos
import { StyleSheet } from 'react-native';
import theme, { COMMON, HELPERS, COLORS, FONTS, SIZES } from './theme';

// Helpers para medidas responsivas y escalado
const { wp, hp, moderateScale, verticalScale } = HELPERS;

// =========================
// ESTILOS GLOBALES PRINCIPALES
// =========================
export const GLOBAL_STYLES = StyleSheet.create({
      // =========================
      // ESTILOS UNIFICADOS: USAR SOLO ESTOS PARA CONTENEDORES, TITULOS, LABELS, INPUTS, ERRORES Y BOTONES
      // =========================
      // Usa 'container', 'title', 'subtitle', 'label', 'input', 'errorText', 'primaryButton', 'textoBoton', etc. en todas las pantallas.
      // Si algún estilo visual es realmente único, agrégalo aquí con un nombre claro y justificado.
    // ----------- CONTENEDORES GENERALES -----------
    // ----------- TEXTOS Y TIPOGRAFÍA -----------
    // ----------- INPUTS Y CAMPOS DE FORMULARIO -----------
    // ----------- CHECKBOXES -----------
    // ----------- BOTONES (TODOS LOS TIPOS) -----------
    // ----------- LOGOS Y CONTENEDORES DE LOGO -----------
    // ----------- RECUPERAR Y RESTABLECER PASSWORD -----------
    // ----------- VERIFICACIÓN DE CUENTA -----------
    // ----------- POPUPS Y OVERLAYS -----------
  // Contenedor principal de pantallas
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: hp('4%'),
    paddingHorizontal: SIZES.paddingHorizontal,
    borderRadius: moderateScale(25),
  },
  // Título principal
  title: {
    fontSize: SIZES.title,
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: 'center',
  },
  // Subtítulo principal
  subtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.secondary,
    marginVertical: hp('1%'),
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  // Grupo de inputs en formularios
  inputGroup: {
    width: wp('80%'),
    marginTop: hp('2%'),
  },
  // Etiqueta de campos de formulario
  label: {
    fontSize: SIZES.label,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    marginBottom: hp('0.5%'),
    marginLeft: wp('1%'),
  },
  // Input de texto estándar
  input: {
    ...(COMMON.INPUT_BASE as any),
    paddingHorizontal: wp('4%'),
  },
  // Texto de error para inputs
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.smallText,
    marginTop: hp('0.5%'),
  },
  // Contenedor de input de contraseña
  inputPasswordContainer: {
    ...(COMMON.INPUT_CONTAINER as any),
    paddingHorizontal: wp('4%'),
    height: verticalScale(40),
  },
  // Input de contraseña
  inputPassword: {
    flex: 1,
    fontSize: SIZES.passwordInput,
    fontFamily: FONTS.regular,
    paddingBottom: 0,
  },
  // Botón para mostrar/ocultar contraseña
  eyeIconButton: {
    padding: wp('0.1%'),
  },
  // Contenedor para link de recuperar contraseña
  recuperarContainer: {
    alignItems: 'flex-end',
    marginTop: hp('0.5%'),
  },
  // Link de recuperar contraseña
  recuperarPassword: {
    fontSize: SIZES.passwordInput,
    fontFamily: FONTS.regular,
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
  // Contenedor de checkbox y label
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp('80%'),
    marginTop: hp('2%'),
  },
  // Estilo del checkbox
  checkbox: {
    width: wp('5%'),
    height: wp('5%'),
    borderWidth: 1,
    borderRadius: 5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  // Label para "Recordarme"
  labelRecordarme: {
    fontSize: SIZES.input,
    color: COLORS.primary,
    fontFamily: FONTS.regular,
  },
  // Botón principal para login
  botonLogearse: {
    ...(COMMON.BUTTON_BASE as any),
    ...(COMMON.SHADOW as any),
  },
  // Texto del botón de login
  textoBotonLogearse: {
    color: COLORS.secondary,
    fontSize: SIZES.buttonText,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  // Contenedor para loading/spinner
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  // Contenedor con scroll para pantallas largas
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: hp('8%'),
    paddingHorizontal: wp('5%'),
  },
  // Título grande para pantallas
  titulo: {
    fontSize: moderateScale(48),
    color: COLORS.primary,
    fontFamily: FONTS.title,
  },
  // Subtítulo grande para pantallas
  subtitulo: {
    fontSize: moderateScale(14),
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    marginTop: hp('1%'),
  },
  // Bloque de texto agrupado
  bloqueTexto: {
    marginTop: hp('1%'),
    alignItems: 'center',
  },
  // Párrafo de texto
  parrafo: {
    fontSize: moderateScale(13),
    color: '#333',
    textAlign: 'center',
    fontFamily: FONTS.regular,
    width: wp('80%'),
  },
  // Imagen de logo principal
  logo: {
    width: wp('60%'),
    height: wp('60%'),
    marginTop: hp('4%'),
  },
  // Contenedor del logo
  logoContainer: {
    width: wp('80%'),
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  // Título junto al logo
  tituloLogo: {
    fontSize: moderateScale(40),
    color: COLORS.accent,
    fontFamily: FONTS.title,
    textAlign: 'center',
    letterSpacing: 3,
    width: '100%',
  },
  // Eslogan bajo el logo
  esloganLogo: {
    fontSize: moderateScale(15),
    fontFamily: FONTS.regular,
    textAlign: 'center',
    width: '100%',
    marginTop: -hp('1%'),
    letterSpacing: 1,
  },
  // Botón para crear cuenta
  botonCrearCuenta: {
    backgroundColor: COLORS.inputBackground,
    ...(COMMON.BUTTON_BASE as any),
    marginTop: hp('4%'),
    ...(COMMON.SHADOW as any),
  },
  // Botón para iniciar sesión
  botonIniciarSesion: {
    backgroundColor: COLORS.success,
    ...(COMMON.BUTTON_BASE as any),
    marginBottom: hp('5%'),
    ...(COMMON.SHADOW as any),
  },
  // Texto genérico de botón
  textoBoton: {
    color: COLORS.secondary,
    fontSize: moderateScale(14),
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  // Input de email en crear cuenta
  inputEmailCrearCuenta: {
    ...(COMMON.INPUT_BASE as any),
    marginBottom: verticalScale(5),
    width: wp('80%'),
  },
  // Botón para ingresar email
  botonIngresarMail: {
    paddingVertical: verticalScale(5),
    borderRadius: 15,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('2%'),
    ...(COMMON.SHADOW as any),
  },
  // Texto del botón de ingresar email
  textoBotonIngresarMail: {
    color: COLORS.secondary,
    fontSize: SIZES.buttonText,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    padding: verticalScale(3),
  },
  // Contenedor principal de recuperar contraseña
  recuperarContainerPrincipal: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp('5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: moderateScale(25),
  },
  // Bloque de contenido en recuperar contraseña
  recuperarBloque: {
    width: wp('80%'),
    alignItems: 'center',
    marginTop: hp('5%'),
  },
  // Título en recuperar contraseña
  recuperarTitulo: {
    fontSize: wp('10%'),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: 'center',
    lineHeight: wp('12%'),
  },
  // Subtítulo en recuperar contraseña
  recuperarSubtitulo: {
    fontSize: wp('3%'),
    color: COLORS.secondary,
    marginVertical: hp('1%'),
    fontFamily: FONTS.regular,
  },
  // Label para correo en recuperar contraseña
  recuperarLabelCorreo: {
    fontSize: wp('3.5%'),
    alignSelf: 'flex-start',
    marginBottom: hp('0.1%'),
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  // Input de correo en recuperar contraseña
  recuperarInput: {
    width: '100%',
    ...(COMMON.INPUT_BASE as any),
    marginBottom: hp('1%'),
  },
  // Texto informativo bajo el input de correo
  recuperarSubTextEmail: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: wp('3%'),
    textAlign: 'justify',
    width: wp('80%'),
    marginTop: hp('1%'),
  },
  // Botón para recuperar contraseña
  botonRecuperarPassword: {
    paddingVertical: hp('1.5%'),
    borderRadius: 15,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('3%'),
    ...(COMMON.SHADOW as any),
  },
  // Texto del botón de recuperar contraseña
  textoRecuperarPassword: {
    color: COLORS.secondary,
    fontSize: wp('4%'),
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  // Texto de error en recuperar contraseña
  recuperarErrorText: {
    color: COLORS.error,
    fontSize: wp('3.5%'),
    marginTop: hp('0.5%'),
    fontFamily: FONTS.regular,
  },
  // Botón temporal (pruebas o debug)
  botonTemp: {
    paddingVertical: hp('1.5%'),
    borderRadius: 25,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('20%'),
    ...(COMMON.SHADOW as any),
    backgroundColor: 'red',
  },
  // Texto del botón temporal
  botonTempText: {
    color: '#fff',
    fontSize: moderateScale(14),
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  // Contenedor de restablecer contraseña
  restablecerContainer: {
    ...(COMMON.PAGE_CARD as any),
    borderRadius: moderateScale(15),
  },
  // Título en restablecer contraseña
  restablecerTitulo: {
    fontSize: moderateScale(45),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: 'center',
    lineHeight: moderateScale(55),
  },
  // Subtítulo en restablecer contraseña
  restablecerSubtitulo: {
    fontSize: moderateScale(12),
    color: COLORS.secondary,
    marginVertical: hp('1%'),
    fontFamily: FONTS.regular,
    width: wp('50%'),
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  // Grupo de inputs en restablecer contraseña
  restablecerInputGroup: {
    width: wp('80%'),
    marginTop: hp('1%'),
  },
  // Label en restablecer contraseña
  restablecerLabel: {
    fontSize: SIZES.label,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    marginBottom: hp('0.5%'),
  },
  // Contenedor de input de nueva contraseña
  restablecerInputPasswordContainer: {
    ...(COMMON.INPUT_CONTAINER as any),
    borderRadius: moderateScale(15),
    paddingHorizontal: wp('4%'),
    height: verticalScale(40),
  },
  // Input de nueva contraseña
  restablecerInputPassword: {
    flex: 1,
    fontSize: SIZES.passwordInput,
    fontFamily: FONTS.regular,
    paddingBottom: 0,
  },
  // Botón para mostrar/ocultar nueva contraseña
  restablecerEyeIconButton: {
    padding: wp('0.1%'),
  },
  // Texto de error en restablecer contraseña
  restablecerErrorText: {
    color: COLORS.error,
    fontSize: SIZES.smallText,
    marginTop: hp('0.5%'),
  },
  // Botón para restablecer contraseña
  restablecerBoton: {
    paddingVertical: verticalScale(11),
    borderRadius: 15,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('4%'),
    ...(COMMON.SHADOW as any),
  },
  // Texto del botón de restablecer contraseña
  restablecerTextoBoton: {
    color: COLORS.secondary,
    fontSize: moderateScale(16),
    textAlign: 'center',
    fontFamily: FONTS.regular,
    padding: verticalScale(3),
  },
  // Contenedor de la pantalla splash
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  // Logo en la pantalla splash
  splashLogo: {
    width: 200,
    height: 200,
  },
  // Texto en la pantalla splash
  splashText: {
    marginTop: 20,
    fontSize: moderateScale(16),
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  // Contenedor de verificación de cuenta
  verificacionContainer: {
    ...(COMMON.PAGE_CARD as any),
    borderRadius: moderateScale(25),
  },
  // Título en verificación de cuenta
  verificacionTitulo: {
    fontSize: moderateScale(45),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: 'center',
    lineHeight: moderateScale(55),
  },
  // Subtítulo en verificación de cuenta
  verificacionSubtitulo: {
    fontSize: moderateScale(12),
    color: COLORS.secondary,
    marginVertical: hp('1%'),
    fontFamily: FONTS.regular,
    width: wp('75%'),
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  // Label para código de verificación
  verificacionLabelCodigo: {
    marginTop: hp('2%'),
    fontSize: moderateScale(15),
    marginBottom: -2,
    marginLeft: -wp('35%'),
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  // Input para código de verificación
  verificacionInputCodigo: {
    ...(COMMON.INPUT_BASE as any),
    fontSize: moderateScale(15),
    marginBottom: verticalScale(5),
    width: wp('80%'),
  },
  // Link para reenviar código de verificación
  verificacionEnviarCodigoNuevo: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(8),
    marginLeft: -wp('45%'),
    fontFamily: FONTS.regular,
    color: COLORS.accent,
  },
  // Contador de tiempo para reenviar código
  verificacionContador: {
    fontSize: moderateScale(14),
    marginTop: -verticalScale(20),
    marginLeft: wp('75%'),
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  // Contenedor para crear nueva contraseña tras verificación
  verificacionContainerPassword: {
    backgroundColor: COLORS.background,
    paddingTop: hp('7%'),
    paddingHorizontal: wp('5%'),
    borderRadius: moderateScale(25),
  },
  // Label para nueva contraseña tras verificación
  verificacionLabelPassword: {
    marginTop: -hp('6%'),
    fontSize: moderateScale(15),
    marginBottom: -2,
    marginLeft: wp('2%'),
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  // Requisitos de la nueva contraseña
  verificacionLabelPasswordReq: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: moderateScale(11),
    width: wp('80%'),
  },
  // Input de nueva contraseña tras verificación
  verificacionInputPassword: {
    paddingHorizontal: wp('3%'),
    paddingVertical: verticalScale(8),
    fontSize: moderateScale(16),
    width: wp('70%'),
    backgroundColor: COLORS.inputBackground,
    fontFamily: FONTS.regular,
    paddingBottom: 0,
  },
  // Contenedor del input de nueva contraseña tras verificación
  verificacionInputPasswordContainer: {
    ...(COMMON.INPUT_CONTAINER as any),
    borderRadius: moderateScale(10),
    width: wp('80%'),
    height: verticalScale(38),
    marginBottom: verticalScale(5),
  },
  // Botón para mostrar/ocultar nueva contraseña tras verificación
  verificacionEyeIconButton: {
    padding: 0,
    marginLeft: -2,
  },
  // Botón para finalizar verificación
  verificacionBotonFinalizar: {
    backgroundColor: COLORS.success,
    ...(COMMON.BUTTON_BASE as any),
    marginTop: hp('5%'),
    height: verticalScale(45),
    ...(COMMON.SHADOW as any),
  },
  // Texto del botón finalizar verificación
  verificacionTextoBotonFinalizar: {
    color: COLORS.secondary,
    fontSize: moderateScale(16),
    textAlign: 'center',
    fontFamily: FONTS.regular,
    padding: verticalScale(3),
  },
  // Overlay de verificación
  verificacionOverlay: {
    ...(COMMON.OVERLAY as any),
  },
  // Popup de verificación
  verificacionPopup: {
    ...(COMMON.POPUP as any),
  },
  // Título del popup de verificación
  verificacionPopupTextTitle: {
    fontSize: moderateScale(25),
    marginBottom: verticalScale(5),
    textAlign: 'center',
    fontFamily: FONTS.title,
    color: COLORS.primary,
  },
  // Subtítulo del popup de verificación
  verificacionPopupTextSubTitle: {
    fontSize: moderateScale(12),
    marginBottom: verticalScale(12),
    textAlign: 'center',
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  // Logo en el popup de verificación
  verificacionLogo: {
    width: wp('60%'),
    height: wp('60%'),
    marginTop: -verticalScale(1),
    borderRadius: moderateScale(25),
  },
  // Botón para cerrar popup de verificación
  verificacionCloseButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: verticalScale(8),
    paddingHorizontal: wp('5%'),
    borderRadius: moderateScale(8),
  },
  // Contenido scrollable en verificación
  verificacionScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  // Texto de ayuda o aclaración
  helperText: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: moderateScale(11),
    width: wp('80%'),
  },
  // Texto de bienvenida
  textoBienvenida: {
    fontSize: moderateScale(29),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: 'center',
    paddingHorizontal: 19,
  },
  // Contenedor de botones en verificación
  verificacionBotonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  // Texto del botón cerrar en verificación
  verificacionCloseButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  /* Backwards-compatible aliases used by some screens */
  // Overlay genérico reutilizable
  overlay: {
    ...(COMMON.OVERLAY as any),
  },
  // Popup genérico reutilizable
  popup: {
    ...(COMMON.POPUP as any),
  },
  // Título del popup genérico
  popupTextTitle: {
    fontSize: moderateScale(25),
    marginBottom: verticalScale(5),
    textAlign: 'center',
    fontFamily: FONTS.title,
    color: COLORS.primary,
  },
  // Subtítulo del popup genérico
  popupTextSubTitle: {
    fontSize: moderateScale(12),
    marginBottom: verticalScale(12),
    textAlign: 'center',
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  // Botón para cerrar popups
  closeButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: verticalScale(8),
    paddingHorizontal: wp('5%'),
    borderRadius: moderateScale(8),
  },
  // Texto del botón cerrar popup
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  // Texto junto al checkbox
  checkboxText: {
    fontSize: SIZES.input,
    color: COLORS.primary,
    fontFamily: FONTS.regular,
  },
  // Botón para logout
  buttonLogout: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: COLORS.inputBackground,
    marginHorizontal: 15,
    ...(COMMON.SHADOW as any),
  },
  // Botón primario reutilizable
  primaryButton: {
    ...(COMMON.BUTTON_BASE as any),
    ...(COMMON.SHADOW as any),
    backgroundColor: COLORS.success,
  },
  // Texto del botón primario
  primaryButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.buttonText,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  // Estado de botón deshabilitado
  disabledButton: {
    opacity: 0.8,
  },
});

// Exportaciones de constantes de tema para uso en otros archivos
export { COLORS, FONTS, SIZES };

// Exportación por defecto de los estilos globales
export default GLOBAL_STYLES;
