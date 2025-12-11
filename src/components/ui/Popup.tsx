
import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { FONTS, COLORS } from "../../styles/styles";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";

type ButtonDef = {
  text: string;
  onPress: () => void | Promise<void>;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

type PopupProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  imageType?: "error" | "logout" | "success" | "happy" | "convivia";
  buttons?: ButtonDef[];
  containerStyle?: ViewStyle;
  popupStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  buttonsContainerStyle?: ViewStyle;

  /** NUEVO: código de 6 dígitos (string o number). Si no llega, se usa placeholder. */
  code?: string | number;
  /** NUEVO: mostrar icono copiar (por defecto true si hay código). */
  showCopyIcon?: boolean;
  /** NUEVO: callback tras copiar. */
  onCopyCode?: (code: string) => void | Promise<void>;
};

const imageMap: Record<string, any> = {
  error: require("../../assets/pngerror.png"),
  logout: require("../../assets/pnglogout.png"),
  success: require("../../assets/pngsuccessful.png"),
  happy: require("../../assets/pngCaraFeliz.png"),
  convivia: require("../../assets/pngconvivia.png"),
};

const PLACEHOLDER_CODE = "966069";

const Popup: React.FC<PopupProps> = ({
  visible,
  onClose,
  title,
  description,
  imageType = "success",
  buttons = [{ text: "Aceptar", onPress: () => {} }],
  containerStyle,
  popupStyle,
  imageStyle,
  titleStyle,
  descriptionStyle,
  buttonsContainerStyle,
  code,
  showCopyIcon,
  onCopyCode,
}) => {
  const handleButtonPress = (btn: ButtonDef) => async () => {
    try {
      await Promise.resolve(btn.onPress());
    } catch (e) {
      // swallow errors from handler but still close
    } finally {
      onClose();
    }
  };

  const imgSource = imageType ? imageMap[imageType] : undefined;

  // Normaliza el código a 6 dígitos (si no llega, placeholder)
  const codeDigits = useMemo(() => {
    const raw =
      code === undefined || code === null
        ? PLACEHOLDER_CODE
        : typeof code === "number"
        ? String(code).padStart(6, "0")
        : String(code).replace(/\D/g, "");
    const six = raw.slice(0, 6);
    const filled =
      six.length < 6
        ? six + PLACEHOLDER_CODE.slice(six.length, 6)
        : six;
    return filled.split("");
  }, [code]);

  const sixDigitCode = useMemo(() => codeDigits.join(""), [codeDigits]);
  const [copied, setCopied] = useState(false);
  const canShowCopyIcon = showCopyIcon ?? Boolean(code ?? PLACEHOLDER_CODE);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(sixDigitCode);
      setCopied(true);
      if (onCopyCode) await Promise.resolve(onCopyCode(sixDigitCode));
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const isConvivia = imageType === "convivia";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={[styles.overlay, containerStyle]}>
        <View style={[styles.popup, popupStyle]}>
          {imgSource && (
            <Image
              source={imgSource}
              style={[styles.image, imageStyle]}
              resizeMode="contain"
            />
          )}

          {/* Título estandarizado (fontFamily ya en styles.title) */}
          <Text style={[styles.title, titleStyle]}>
            {title}
          </Text>

          {/* Si es convivia y tenemos código, renderizamos bloque de código */}
          {isConvivia && (
            <>
              <Text style={[styles.description, descriptionStyle]}>
                Tu código es:
              </Text>

              <View style={styles.codeRowWithCopy}>
                <View style={styles.codeRow}>
                  {codeDigits.map((d, idx) => (
                    <View key={idx} style={styles.codeBox}>
                      <Text style={styles.codeDigit}>{d}</Text>
                    </View>
                  ))}
                </View>

                {canShowCopyIcon && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Copiar código"
                    onPress={handleCopy}
                    style={styles.copyIconButton}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={copied ? "check" : "copy"}
                      size={18}
                      color={copied ? "#3E5639" : COLORS.secondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Descripción estandarizada; si es convivia y quieres texto auxiliar, pásalo en description */}
          {description ? (
            <Text style={[styles.description, descriptionStyle]}>
              {description}
            </Text>
          ) : null}

          {/* Botones (estándar) */}
          <View style={[styles.buttonsContainer, buttonsContainerStyle as any]}>
            {buttons.length === 1 ? (
              <TouchableOpacity
                style={[styles.singleButton, buttons[0].style]}
                onPress={handleButtonPress(buttons[0])}
              >
                <Text style={[styles.buttonText, buttons[0].textStyle]}>{buttons[0].text}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.twoButtonsRow}>
                {buttons.slice(0, 2).map((btn, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.twoButton,
                      idx === 0 ? { marginRight: 8 } : { marginLeft: 8 },
                      btn.style,
                    ]}
                    onPress={handleButtonPress(btn)}
                  >
                    <Text style={[styles.buttonText, btn.textStyle]}>{btn.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  popup: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 12,
    marginTop: 20,
  },

  // TITULO y DESCRIPCIÓN
  title: {
    fontSize: 24,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: FONTS.title,
  },
  description: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: FONTS.regular,
  },

  // Bloque genérico para el código ( “convivia”)
  codeRowWithCopy: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  codeBox: {
    width: 38,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E6ECDC",
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  codeDigit: {
    fontSize: 20,
    color: "#3E5639",
    fontWeight: "700",
    fontFamily: FONTS.title,
  },
  copyIconButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#F3F6EF",
  },

  // Botones estándar
  buttonsContainer: {
    width: "100%",
  },
  singleButton: {
    backgroundColor: "#E6ECDC",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  twoButtonsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  twoButton: {
    flex: 1,
    backgroundColor: "#E6ECDC",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.secondary,
    fontWeight: "400",
  },
});

export default Popup;
