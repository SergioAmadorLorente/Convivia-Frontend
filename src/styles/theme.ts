import { moderateScale, verticalScale } from "react-native-size-matters";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export const COLORS = {
  background: "#fff",
  primary: "#6B705C",
  secondary: "#4B4741",
  accent: "#ACBF8A",
  inputBackground: "#F5F4F2",
  border: "#CCC",
  error: "red",
  disabled: "#ccc",
  success: "#E6ECDC",
};

export const FONTS = {
  title: "DMSerifDisplay_400Regular",
  regular: "Montserrat_400Regular",
  bold: "Montserrat_700Bold",
};

export const SIZES = {
  // typography
  title: moderateScale(40),
  hugeTitle: moderateScale(48),
  largeTitle: moderateScale(45),
  welcomeTitle: moderateScale(29),
  subtitle: moderateScale(13),
  label: moderateScale(15),
  input: moderateScale(13),
  passwordInput: moderateScale(14),
  smallText: moderateScale(12),
  buttonText: moderateScale(15),
  text14: moderateScale(14),
  text16: moderateScale(16),
  text11: moderateScale(11),
  popupTitle: moderateScale(25),

  // spacing & layout
  paddingHorizontal: wp("5%"),
  paddingVertical: verticalScale(8),
  marginBottom: verticalScale(10),
  borderRadius: moderateScale(10),

  // fixed sizes
  splashLogo: 200,
};

export const HELPERS = {
  wp,
  hp,
  moderateScale,
  verticalScale,
};

export const COMPONENTS = {
  DESPLEGABLE: {
    leftSegmentWidth: moderateScale(60),
    height: 2,
    leftColor: COLORS.accent,
    rightColor: COLORS.primary,
    gap: moderateScale(8),
    marginTop: moderateScale(1),
    marginBottom: verticalScale(7.5),
  },
};

export const COMMON = {
  SHADOW: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  PAGE_CARD: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: hp("5%"),
    paddingHorizontal: wp("5%"),
    borderRadius: moderateScale(25),
  },
  BUTTON_BASE: {
    paddingVertical: verticalScale(10),
    borderRadius: 15,
    width: wp("80%"),
    alignSelf: "center",
    marginTop: hp("3%"),
  },
  POPUP: {
    width: wp("80%"),
    height: hp("60%"),
    padding: verticalScale(19),
    backgroundColor: COLORS.background,
    borderRadius: moderateScale(25),
    alignItems: "center",
  },
  OVERLAY: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  INPUT_BASE: {
    borderColor: COLORS.border,
    borderRadius: moderateScale(10),
    paddingHorizontal: wp("3%"),
    paddingVertical: verticalScale(8),
    fontSize: SIZES.input,
    backgroundColor: COLORS.inputBackground,
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  INPUT_CONTAINER: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: moderateScale(10),
    paddingHorizontal: wp("3%"),
    height: verticalScale(40),
    backgroundColor: COLORS.inputBackground,
  },
};

export const CHECKBOX = {
  /** Área táctil para que sea fácil pulsar el checkbox */
  touchArea: {
    padding: 1,
    borderRadius: 999,
  },
  /** Tamaño del icono (Feather: 'square' / 'check-square') */
  iconSize: 22,
  /** Colores del icono*/
  colors: {
    checked: COLORS.secondary,
    unchecked: COLORS.secondary,
  },
};

export default {
  COLORS,
  FONTS,
  SIZES,
  COMMON,
  HELPERS,
  COMPONENTS,
  CHECKBOX,
};
