// Importación de utilidades y temas de estilos
import { StyleSheet } from "react-native";
import theme, { COMMON, HELPERS, COLORS, FONTS, SIZES } from "./theme";

// Helpers para medidas responsivas y escalado
const { wp, hp, moderateScale, verticalScale } = HELPERS;

// =========================
// ESTILOS GLOBALES PRINCIPALES
// =========================
export const GLOBAL_STYLES = StyleSheet.create({
  // ----------- CONTENEDORES GENERALES [#1]-----------

  // Contenedor de la pantalla splash
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  // Contenedor con scroll para pantallas largas
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    paddingTop: hp("8%"),
    paddingHorizontal: wp("5%"),
  },

  // Contenedor principal de recuperar contraseña
  recuperarContainerPrincipal: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: hp("5%"),
    paddingHorizontal: wp("5%"),
    borderRadius: moderateScale(25),
  },

  //contenedor principal de pantallas
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    paddingTop: hp("4%"),
    paddingHorizontal: SIZES.paddingHorizontal,
    borderRadius: moderateScale(25),
  },

  // Contenedor para link de recuperar contraseña
  recuperarContainer: {
    alignItems: "flex-end",
    marginTop: hp("0.5%"),
  },

  // ----------- TEXTOS Y TIPOGRAFÍA [#2]-----------

  // Texto del botón primario
  primaryButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.buttonText,
    textAlign: "center",
    fontFamily: FONTS.regular,
  },

  // Texto de bienvenida
  textoBienvenida: {
    fontSize: moderateScale(28),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: "center",
    paddingHorizontal: 19,
  },

  // Texto en la pantalla splash
  splashText: {
    marginTop: 20,
    fontSize: moderateScale(16),
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },

  // Texto de ayuda o aclaración
  helperText: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: moderateScale(11),
    width: wp("80%"),
  },
  // Texto del botón temporal
  botonTempText: {
    color: "#fff",
    fontSize: moderateScale(14),
    textAlign: "center",
    fontFamily: FONTS.regular,
  },

  // Texto genérico de botón
  textoBoton: {
    color: COLORS.secondary,
    fontSize: moderateScale(14),
    textAlign: "center",
    fontFamily: FONTS.regular,
  },

  // Bloque de texto agrupado
  bloqueTexto: {
    marginTop: hp("1%"),
    alignItems: "center",
  },

  // Párrafo de texto
  parrafo: {
    fontSize: moderateScale(13),
    color: "#333",
    textAlign: "center",
    fontFamily: FONTS.regular,
    width: wp("80%"),
  },

  // Título principal
  title: {
    fontSize: SIZES.title,
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: "center",
  },

  // Subtítulo principal
  subtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.secondary,
    marginVertical: hp("1%"),
    fontFamily: FONTS.regular,
    textAlign: "center",
  },

  // Texto de error para inputs
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.smallText,
    marginTop: hp("0.5%"),
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
    marginTop: hp("1%"),
  },

  // ----------- CHECKBOXES [#4]-----------
  // Estilo del checkbox
  checkbox: {
    width: wp("5%"),
    height: wp("5%"),
    borderWidth: 1,
    borderRadius: 5,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("2%"),
  },
  // ----------- BOTONES (TODOS LOS TIPOS) -----------

  // Active unified button styles
  buttonPrimaryGreen: {
    ...(COMMON.BUTTON_BASE as any),
    ...(COMMON.SHADOW as any),
    backgroundColor: COLORS.success,
  },

  buttonSecondaryGrey: {
    ...(COMMON.BUTTON_BASE as any),
    ...(COMMON.SHADOW as any),
    backgroundColor: COLORS.inputBackground,
  },
  // Botón para mostrar/ocultar contraseña OK
  eyeIconButton: {
    padding: wp("0.1%"),
  },

  // ----------- LOGOS Y CONTENEDORES DE LOGO [#6]-----------

  // Logo en la pantalla splash
  splashLogo: {
    width: 200,
    height: 200,
  },

  // Contenedor para loading/spinner
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
  },

  // Imagen de logo principal
  logo: {
    width: wp("60%"),
    height: wp("60%"),
    marginTop: hp("4%"),
  },

  // Contenedor del logo
  logoContainer: {
    width: wp("80%"),
    alignItems: "center",
    marginTop: hp("2%"),
  },
  // Título junto al logo
  tituloLogo: {
    fontSize: moderateScale(40),
    color: COLORS.accent,
    fontFamily: FONTS.title,
    textAlign: "center",
    letterSpacing: 3,
    width: "100%",
  },
  // Eslogan bajo el logo
  esloganLogo: {
    fontSize: moderateScale(15),
    fontFamily: FONTS.regular,
    textAlign: "center",
    width: "100%",
    marginTop: -hp("1%"),
    letterSpacing: 1,
  },

  // ----------- RECUPERAR Y RESTABLECER PASSWORD [#7]-----------

  // Texto de error en restablecer contraseña
  restablecerErrorText: {
    color: COLORS.error,
    fontSize: SIZES.smallText,
    marginTop: hp("0.5%"),
  },
  // Texto del botón de restablecer contraseña
  restablecerTextoBoton: {
    color: COLORS.secondary,
    fontSize: moderateScale(16),
    textAlign: "center",
    fontFamily: FONTS.regular,
    padding: verticalScale(3),
  },

  // Subtítulo en restablecer contraseña
  restablecerSubtitulo: {
    fontSize: moderateScale(12),
    color: COLORS.secondary,
    marginVertical: hp("1%"),
    fontFamily: FONTS.regular,
    width: wp("50%"),
    textAlign: "center",
    marginBottom: hp("1%"),
  },
  // Título en restablecer contraseña
  restablecerTitulo: {
    fontSize: moderateScale(45),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: "center",
    lineHeight: moderateScale(55),
  },

  // Contenedor de restablecer contraseña
  restablecerContainer: {
    ...(COMMON.PAGE_CARD as any),
    borderRadius: moderateScale(15),
  },

  recuperarBloque: {
    width: wp("90%"),
    alignItems: "center",
    marginTop: hp("5%"),
  },

  // Título en recuperar contraseña
  recuperarTitulo: {
    fontSize: wp("13%"),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: "center",
    lineHeight: wp("12%"),
  },

  // Subtítulo en recuperar contraseña
  recuperarSubtitulo: {
    fontSize: wp("4%"),
    color: COLORS.secondary,
    marginVertical: hp("1%"),
    fontFamily: FONTS.regular,
  },
  // Texto informativo bajo el input de correo
  recuperarSubTextEmail: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: wp("2.9%"),
    textAlign: "left",
    width: wp("80%"),
    marginTop: hp("1%"),
    lineHeight: moderateScale(16),
  },
  // Texto del botón de recuperar contraseña
  /*textoRecuperarPassword: {
    color: COLORS.secondary,
    fontSize: wp("4%"),
    //textAlign: "left",
    fontFamily: FONTS.regular,
  }*/
  // Texto de error en recuperar contraseña
  recuperarErrorText: {
    color: COLORS.error,
    fontSize: wp("3.5%"),
    marginTop: hp("0.5%"),
    fontFamily: FONTS.regular,
  },

  // Link de recuperar contraseña
  linkRecuperarPassword: {
    fontSize: SIZES.passwordInput,
    fontFamily: FONTS.regular,
    color: COLORS.accent,
    textDecorationLine: "underline",
    //textAlign: "left",
  },

  // ----------- VERIFICACIÓN DE CUENTA [#8]-----------

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
    textAlign: "center",
    lineHeight: moderateScale(55),
  },
  // Subtítulo en verificación de cuenta
  verificacionSubtitulo: {
    fontSize: moderateScale(12),
    color: COLORS.secondary,
    marginVertical: hp("1%"),
    fontFamily: FONTS.regular,
    width: wp("75%"),
    textAlign: "center",
    marginBottom: hp("1%"),
  },
  // Link para reenviar código de verificación
  verificacionEnviarCodigoNuevo: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(8),
    marginLeft: -wp("45%"),
    fontFamily: FONTS.regular,
    color: COLORS.accent,
  },
  // Contador de tiempo para reenviar código
  verificacionContador: {
    fontSize: moderateScale(14),
    marginTop: -verticalScale(20),
    marginLeft: wp("75%"),
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  // Contenedor para crear nueva contraseña tras verificación
  verificacionContainerPassword: {
    backgroundColor: COLORS.background,
    paddingTop: hp("7%"),
    paddingHorizontal: wp("5%"),
    borderRadius: moderateScale(25),
  },

  // Botón para mostrar/ocultar nueva contraseña tras verificación
  verificacionEyeIconButton: {
    padding: 0,
    marginLeft: -2,
  },
  // Contenedor del contenido del scroll en verificación
  verificacionScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },

  // -------------- LABELS [#9]----------------
  // Label genérico para formularios
  labelBase: {
    fontSize: SIZES.label,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },

  // Variaciones de márgenes para labels
  labelMarginSmall: {
    marginBottom: hp("0.5%"),
    marginLeft: wp("1%"),
  },
  labelMarginTop: {
    marginTop: hp("2%"),
  },

  // Label para checkbox y "Recordarme"
  labelCheckbox: {
    fontSize: SIZES.input,
    color: COLORS.primary,
    fontFamily: FONTS.regular,
  },

  // Contenedor de checkbox y label
  checkboxContainer: {
    flexDirection: "row",
    width: wp("80%"),
    marginTop: hp("1%"),
    marginBottom: hp("1%"),
  },

  // Label para verificación (código y nueva contraseña)
  labelVerificacion: {
    fontSize: moderateScale(15),
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },

  // Requisitos de la nueva contraseña
  labelPasswordReq: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: moderateScale(11),
    width: wp("80%"),
  },
});

// Exportaciones de constantes de tema para uso en otros archivos
export { COLORS, FONTS, SIZES };

export const WEB_FULL_VIEWPORT: any = {
  height: "100dvh",
  overflow: "auto",
};

// Exportación por defecto de los estilos globales
export default GLOBAL_STYLES;
