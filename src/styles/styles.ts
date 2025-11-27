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

  //contenedor principal de pantallas
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    paddingTop: hp("4%"),
    paddingHorizontal: SIZES.paddingHorizontal,
    borderRadius: moderateScale(25),
  },

  // ----------- TEXTOS Y TIPOGRAFÍA [#2]-----------
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

  // Texto genérico de botón
  textoBoton: {
    color: COLORS.secondary,
    fontSize: moderateScale(14),
    textAlign: "center",
    fontFamily: FONTS.regular,
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
    textAlign: "center",
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

  recuperarBloque: {
    width: wp("90%"),
    alignItems: "center",
    marginTop: hp("5%"),
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
  
  /*labelMarginTop: {
    marginTop: hp("2%"),
  },*/

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
