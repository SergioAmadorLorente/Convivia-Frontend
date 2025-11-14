// styles.js
import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const COLORS = {
  background: '#fff',
  primary: '#6B705C',
  secondary: '#4B4741',
  accent: '#ACBF8A',
  inputBackground: '#F5F4F2',
  border: '#CCC',
  error: 'red',
  disabled: '#ccc',
  success: '#E6ECDC',
};

export const FONTS = {
  title: 'DMSerifDisplay_400Regular',
  regular: 'Montserrat_400Regular',
  bold: 'Montserrat_700Bold',
};

export const SIZES = {
  title: moderateScale(40),
  subtitle: moderateScale(13),
  label: moderateScale(15),
  input: moderateScale(13),
  passwordInput: moderateScale(14),
  smallText: moderateScale(12),
  buttonText: moderateScale(15),
  paddingHorizontal: wp('5%'),
  paddingVertical: verticalScale(8),
  marginBottom: verticalScale(10),
  borderRadius: moderateScale(10),
};

export const GLOBAL_STYLES = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: hp('4%'),
    paddingHorizontal: SIZES.paddingHorizontal,
    borderRadius: moderateScale(25),
  },

  // Título de pantalla
  title: {
    fontSize: SIZES.title,
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: 'center',
  },

  // Subtítulo descriptivo
  subtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.secondary,
    marginVertical: hp('1%'),
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },

  // Grupo de inputs
  inputGroup: {
    width: wp('80%'),
    marginTop: hp('2%'),
  },

  // Etiquetas de campo
  label: {
    fontSize: SIZES.label,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    marginBottom: hp('0.5%'),
    marginLeft: wp('1%'),




  },

  // Input de texto
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: wp('4%'),
    paddingVertical: SIZES.paddingVertical,
    fontSize: SIZES.input,
    backgroundColor: COLORS.inputBackground,
  },

  // Texto de error
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.smallText,
    marginTop: hp('0.5%'),
  },

  // Contenedor de input de contraseña
  inputPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: wp('4%'),
    height: verticalScale(40),
    backgroundColor: COLORS.inputBackground,
  },

  // Input de contraseña
  inputPassword: {
    flex: 1,
    fontSize: SIZES.passwordInput,
    fontFamily: FONTS.regular,
    paddingBottom: 0,
  },

  // Botón de mostrar/ocultar contraseña
  eyeIconButton: {
    padding: wp('0.1%'),
  },

  // Contenedor de recuperar contraseña
  recuperarContainer: {
    alignItems: 'flex-end',
    marginTop: hp('0.5%'),
  },

  // Texto de recuperar contraseña
  recuperarPassword: {
    fontSize: SIZES.passwordInput,
    fontFamily: FONTS.regular,
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },

  // Contenedor de checkbox
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

  // Etiqueta de "Recordarme"
  labelRecordarme: {
    fontSize: SIZES.input,
    color: COLORS.primary,
    fontFamily: FONTS.regular,
  },

  // Botón de login
  botonLogearse: {
    paddingVertical: verticalScale(8),
    borderRadius: 15,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('3%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  // Texto del botón de login
  textoBotonLogearse: {
    color: COLORS.secondary,
    fontSize: SIZES.buttonText,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  // Estilos para pantalla de bienvenida (Main)

  // Contenedor de carga mientras se cargan las fuentes
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Contenedor del scroll principal
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: hp('8%'),
    paddingHorizontal: wp('5%'),
  },

  // Título principal de bienvenida
  titulo: {
    fontSize: moderateScale(48),
    color: COLORS.primary,
    fontFamily: FONTS.title,
  },

  // Subtítulo debajo del título
  subtitulo: {
    fontSize: moderateScale(14),
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    marginTop: hp('1%'),
  },

  // Bloque que contiene el párrafo descriptivo
  bloqueTexto: {
    marginTop: hp('1%'),
    alignItems: 'center',
  },

  // Párrafo explicativo
  parrafo: {
    fontSize: moderateScale(13),
    color: '#333',
    textAlign: 'center',
    fontFamily: FONTS.regular,
    width: wp('80%'),
  },

  // Logo principal
  logo: {
    width: wp('60%'),
    height: wp('60%'),
    marginTop: hp('4%'),
  },

  // Contenedor del logo + texto
  logoContainer: {
    width: wp('80%'),
    alignItems: 'center',
    marginTop: hp('2%'),
  },

  // Título debajo del logo
  tituloLogo: {
    fontSize: moderateScale(40),
    color: COLORS.accent,
    fontFamily: FONTS.title,
    textAlign: 'center',
    letterSpacing: 3,
    width: '100%',
  },

  // Eslogan debajo del título del logo
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
    paddingVertical: verticalScale(8),
    borderRadius: 15,
    width: wp('80%'),
    marginTop: hp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  // Botón para iniciar sesión
  botonIniciarSesion: {
    backgroundColor: COLORS.success,
    paddingVertical: verticalScale(8),
    borderRadius: 15,
    width: wp('80%'),
    marginTop: hp('3%'),
    marginBottom: hp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  // Texto dentro de los botones
  textoBoton: {
    color: COLORS.secondary,
    fontSize: moderateScale(14),
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  // Campo de correo electrónico específico para CrearCuenta
  inputEmailCrearCuenta: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: moderateScale(10),
    paddingHorizontal: wp('3%'), // ← diferente a wp('4%')
    paddingVertical: verticalScale(8),
    fontSize: SIZES.input,
    marginBottom: verticalScale(5),
    backgroundColor: COLORS.inputBackground,
    fontFamily: FONTS.regular,
    width: wp('80%'),
  },

  // Botón "Enviar código" específico para CrearCuenta
  botonIngresarMail: {
    paddingVertical: verticalScale(5), // ← más compacto que el login
    borderRadius: 15,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  // Texto del botón "Enviar código"
  textoBotonIngresarMail: {
    color: COLORS.secondary,
    fontSize: SIZES.buttonText,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    padding: verticalScale(3),
  },

  // Contenedor principal de RecuperarPassword
  recuperarContainerPrincipal: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp('5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: moderateScale(25),
  },

  // Bloque interno que contiene el formulario
  recuperarBloque: {
    width: wp('80%'),
    alignItems: 'center',
    marginTop: hp('5%'),
  },

  // Título principal
  recuperarTitulo: {
    fontSize: wp('10%'),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: 'center',
    lineHeight: wp('12%'),
  },

  // Subtítulo debajo del título
  recuperarSubtitulo: {
    fontSize: wp('3%'),
    color: COLORS.secondary,
    marginVertical: hp('1%'),
    fontFamily: FONTS.regular,
  },

  // Etiqueta del campo de correo
  recuperarLabelCorreo: {
    fontSize: wp('3.5%'),
    alignSelf: 'flex-start',
    marginBottom: hp('0.1%'),
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },

  // Campo de entrada de correo
  recuperarInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
    fontSize: SIZES.input,
    marginBottom: hp('1%'),
    backgroundColor: COLORS.inputBackground,
    fontFamily: FONTS.regular,
  },

  // Texto explicativo debajo del input
  recuperarSubTextEmail: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: wp('3%'),
    textAlign: 'justify',
    width: wp('80%'),
    marginTop: hp('1%'),
  },

  // Botón para enviar correo de recuperación
  botonRecuperarPassword: {
    paddingVertical: hp('1.5%'),
    borderRadius: 15,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('3%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  // Texto del botón de recuperación
  textoRecuperarPassword: {
    color: COLORS.secondary,
    fontSize: wp('4%'),
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },

  // Texto de error de validación
  recuperarErrorText: {
    color: COLORS.error,
    fontSize: wp('3.5%'),
    marginTop: hp('0.5%'),
    fontFamily: FONTS.regular,
  },

  // Botón temporal para navegación
  botonTemp: {
    paddingVertical: hp('1.5%'),
    borderRadius: 25,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('20%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: 'red',
  },

  // Texto del botón temporal
  botonTempText: {
    color: 'white',
    textAlign: 'center',
  },

  // Contenedor principal de RestablecerPassword
  restablecerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp('5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: moderateScale(15),
  },

  // Título principal
  restablecerTitulo: {
    fontSize: moderateScale(45),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: 'center',
    lineHeight: moderateScale(55),
  },

  // Subtítulo explicativo
  restablecerSubtitulo: {
    fontSize: moderateScale(12),
    color: COLORS.secondary,
    marginVertical: hp('1%'),
    fontFamily: FONTS.regular,
    width: wp('50%'),
    textAlign: 'center',
    marginBottom: hp('1%'),
  },

  // Grupo de inputs
  restablecerInputGroup: {
    width: wp('80%'),
    marginTop: hp('1%'),
  },

  // Etiqueta de campo
  restablecerLabel: {
    fontSize: SIZES.label,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    marginBottom: hp('0.5%'),
  },

  // Contenedor de input de contraseña
  restablecerInputPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: moderateScale(15),
    paddingHorizontal: wp('4%'),
    height: verticalScale(40),
    backgroundColor: COLORS.inputBackground,
  },

  // Input de contraseña
  restablecerInputPassword: {
    flex: 1,
    fontSize: SIZES.passwordInput,
    fontFamily: FONTS.regular,
    paddingBottom: 0,
  },

  // Botón de mostrar/ocultar contraseña
  restablecerEyeIconButton: {
    padding: wp('0.1%'),
  },

  // Texto de error
  restablecerErrorText: {
    color: COLORS.error,
    fontSize: SIZES.smallText,
    marginTop: hp('0.5%'),
  },

  // Botón de restablecer
  restablecerBoton: {
    paddingVertical: verticalScale(11),
    borderRadius: 15,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  // Texto del botón
  restablecerTextoBoton: {
    color: COLORS.secondary,
    fontSize: moderateScale(16),
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },

  // Pantalla de carga

  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  splashLogo: {
    width: 200,
    height: 200,
  },

  splashText: {
    marginTop: 20,
    fontSize: moderateScale(16),
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },

  // Contenedor principal
  verificacionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp('5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: moderateScale(25),
  },

  // Título principal
  verificacionTitulo: {
    fontSize: moderateScale(45),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: 'center',
    lineHeight: moderateScale(55),
  },

  // Subtítulo explicativo
  verificacionSubtitulo: {
    fontSize: moderateScale(12),
    color: COLORS.secondary,
    marginVertical: hp('1%'),
    fontFamily: FONTS.regular,
    width: wp('75%'),
    textAlign: 'center',
    marginBottom: hp('1%'),
  },

  // Etiqueta del código
  verificacionLabelCodigo: {
    marginTop: hp('2%'),
    fontSize: moderateScale(15),
    marginBottom: -2,
    marginLeft: -wp('35%'),
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },

  // Input del código
  verificacionInputCodigo: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: moderateScale(10),
    paddingHorizontal: wp('3%'),
    paddingVertical: verticalScale(8),
    fontSize: moderateScale(15),
    marginBottom: verticalScale(5),
    backgroundColor: COLORS.inputBackground,
    fontFamily: FONTS.regular,
    width: wp('80%'),
  },

  // Botón para reenviar código
  verificacionEnviarCodigoNuevo: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(8),
    marginLeft: -wp('45%'),
    fontFamily: FONTS.regular,
    color: COLORS.accent,

  },

  // Contador
  verificacionContador: {
    fontSize: moderateScale(14),
    marginTop: -verticalScale(20),
    marginLeft: wp('75%'),
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },

  // Contenedor de contraseña
  verificacionContainerPassword: {
    backgroundColor: COLORS.background,
    paddingTop: hp('7%'),
    paddingHorizontal: wp('5%'),
    borderRadius: moderateScale(25),
  },

  // Etiqueta de contraseña
  verificacionLabelPassword: {
    marginTop: -hp('6%'),
    fontSize: moderateScale(15),
    marginBottom: -2,
    marginLeft: wp('2%'),
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },

  // Requisitos de contraseña
  verificacionLabelPasswordReq: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: moderateScale(11),
    width: wp('80%'),
  },

  // Input de contraseña
  verificacionInputPassword: {
    paddingHorizontal: wp('3%'),
    paddingVertical: verticalScale(8),
    fontSize: moderateScale(16),
    width: wp('70%'),
    backgroundColor: COLORS.inputBackground,
    fontFamily: FONTS.regular,
    paddingBottom: 0,
  },

  // Contenedor del input con icono
  verificacionInputPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: moderateScale(10),
    paddingHorizontal: wp('3%'),
    width: wp('80%'),
    height: verticalScale(38),
    marginBottom: verticalScale(5),
    backgroundColor: COLORS.inputBackground,
  },

  // Icono del ojo
  verificacionEyeIconButton: {
    padding: 0,
    marginLeft: -2,
  },

  // Botón de finalizar registro
  verificacionBotonFinalizar: {
    backgroundColor: COLORS.success,
    paddingVertical: verticalScale(5),
    borderRadius: 15,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('5%'),
    height: verticalScale(45),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  // Texto del botón
  verificacionTextoBotonFinalizar: {
    color: COLORS.secondary,
    fontSize: moderateScale(16),
    textAlign: 'center',
    fontFamily: FONTS.regular,
    padding: verticalScale(3),
  },

  // Modal
  verificacionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  verificacionPopup: {
    width: wp('80%'),
    height: hp('60%'),
    padding: verticalScale(19),
    backgroundColor: COLORS.background,
    borderRadius: moderateScale(25),
    alignItems: 'center',
  },

  verificacionPopupTextTitle: {
    fontSize: moderateScale(25),
    marginBottom: verticalScale(5),
    textAlign: 'center',
    fontFamily: FONTS.title,
    color: COLORS.primary,
  },

  verificacionPopupTextSubTitle: {
    fontSize: moderateScale(12),
    marginBottom: verticalScale(12),
    textAlign: 'center',
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },

  verificacionLogo: {
    width: wp('60%'),
    height: wp('60%'),
    marginTop: -verticalScale(1),
    borderRadius: moderateScale(25),
  },

  verificacionCloseButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: verticalScale(8),
    paddingHorizontal: wp('5%'),
    borderRadius: moderateScale(8),
  },
  verificacionScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  helperText: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: moderateScale(11),
    width: wp('80%'),
  },

textoBienvenida: {
    fontSize: moderateScale(29),
    color: COLORS.primary,
    fontFamily: FONTS.title,
    textAlign: 'center',
    paddingHorizontal: 19
  },
  verificacionBotonesContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
},

verificacionCloseButton: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 15,
  backgroundColor: COLORS.success,
  marginHorizontal: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 3,
  elevation: 5,
},

verificacionCloseButtonText: {
  fontSize: 16,
  color: '#333',
  textAlign: 'center',
},

buttonLogout: {
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 15,
  backgroundColor: COLORS.inputBackground,
  marginHorizontal: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 3,
  elevation: 5,
}
});