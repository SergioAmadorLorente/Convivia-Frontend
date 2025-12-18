
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
import ErrorSvg from "../../assets/pngerror.svg";
import LogoutSvg from "../../assets/pnglogout.svg";
import SuccessSvg from "../../assets/pngsuccessful.svg";
import HappySvg from "../../assets/happy.svg";
import ConviviaSvg from "../../assets/pngconvivia.svg";
import DeleteSvg from "../../assets/pngdelete.svg";
import GobackSvg from "../../assets/pnggoback.svg";

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
  imageType?: "error" | "logout" | "success" | "happy" | "convivia" | "delete";
  buttons?: ButtonDef[];
  containerStyle?: ViewStyle;
  popupStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  buttonsContainerStyle?: ViewStyle;

  /** Código de 6 dígitos (string o number). Si no lo pasas, no se muestra el bloque de código. */
  code?: string | number;
  /** Control explícito para mostrar el bloque de código (por defecto true). */
  showCode?: boolean;
  /** Mostrar el icono de copiar (por defecto true si hay código y showCode es true). */
  showCopyIcon?: boolean;
  /** Callback opcional tras copiar el código. */
  onCopyCode?: (code: string) => void | Promise<void>;
};


const imageMap: Record<string, React.ElementType> = {
  error: ErrorSvg,
  logout: LogoutSvg,
  success: SuccessSvg,
  happy: HappySvg,
  convivia: ConviviaSvg,
  delete: DeleteSvg,
  goback: GobackSvg,
};

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
  showCode = true,
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

  const ImgComponent = imageType ? imageMap[imageType] : undefined;

  // ¿Tenemos code y queremos mostrarlo?
  const hasCode = showCode && code !== undefined && code !== null && String(code).length > 0;

  // Normaliza el código a 6 dígitos SOLO si hay code
  const codeDigits = useMemo(() => {
    if (!hasCode) return [];
    const raw =
      typeof code === "number"
        ? String(code).padStart(6, "0")
        : String(code).replace(/\D/g, "");
    const six = raw.slice(0, 6);
    const filled = six.padEnd(6, "0"); // completa si faltan dígitos
    return filled.split("");
  }, [code, hasCode]);

  const sixDigitCode = useMemo(() => codeDigits.join(""), [codeDigits]);
  const [copied, setCopied] = useState(false);

  const canShowCopyIcon = (showCopyIcon ?? true) && hasCode;

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={[styles.overlay, containerStyle]}>
        <View style={[styles.popup, popupStyle]}>
          {ImgComponent && (
            <ImgComponent
              style={[styles.image, imageStyle]}
              width={200}
              height={200}
            />
          )}

          {/* Título con estilo base (fontFamily ya en styles.title) */}
          <Text style={[styles.title, titleStyle]}>
            {title}
          </Text>

          {/* Bloque de código: SOLO si imageType='convivia' y hasCode=true */}
          {imageType === "convivia" && hasCode && (
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

          {/* Descripción estándar */}
          {description ? (
            <Text style={[styles.description, descriptionStyle]}>
              {description}
            </Text>
          ) : null}

          {/* Botones */}
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

  // Título y descripción estandarizados
  title: {
    fontSize: 26,
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

  // Bloque genérico para el código
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
    width: 36,
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
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});

export default Popup;
