import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { FONTS, COLORS } from '../../styles/styles';

type ButtonDef = {
  text: string;
  onPress: () => void | Promise<void>;
  style?: ViewStyle;
};

type PopupProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  imageType?: 'error' | 'logout' | 'success';
  buttons?: ButtonDef[];
  containerStyle?: ViewStyle;
  popupStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  buttonsContainerStyle?: ViewStyle;
};

const imageMap: Record<string, any> = {
  error: require('../../assets/pngerror.png'),
  logout: require('../../assets/pnglogout.png'),
  success: require('../../assets/pngsuccessful.png'),
};

const Popup: React.FC<PopupProps> = ({
  visible,
  onClose,
  title,
  description,
  imageType = 'success',
  buttons = [{ text: 'Aceptar', onPress: () => {} }],
  containerStyle,
  popupStyle,
  imageStyle,
  titleStyle,
  descriptionStyle,
  buttonsContainerStyle,
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={[styles.overlay, containerStyle]}>
        <View style={[styles.popup, popupStyle]}>
          {imgSource && <Image source={imgSource} style={[styles.image, imageStyle]} resizeMode="contain" />}
          <Text style={[styles.title, titleStyle, { fontFamily: FONTS.title }]}>{title}</Text>
          {description ? <Text style={[styles.description, descriptionStyle, { fontFamily: FONTS.regular }]}>{description}</Text> : null}

          <View style={[styles.buttonsContainer, buttonsContainerStyle] as any}>
            {buttons.length === 1 ? (
              <TouchableOpacity style={[styles.singleButton, buttons[0].style]} onPress={handleButtonPress(buttons[0])}>
                <Text style={styles.buttonText}>{buttons[0].text}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.twoButtonsRow}>
                {buttons.slice(0, 2).map((btn, idx) => (
                  <TouchableOpacity key={idx} style={[styles.twoButton, idx === 0 ? { marginRight: 8 } : { marginLeft: 8 }, btn.style]} onPress={handleButtonPress(btn)}>
                    <Text style={styles.buttonText}>{btn.text}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonsContainer: {
    width: '100%',
  },
  singleButton: {
    backgroundColor: '#E6ECDC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  twoButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  twoButton: {
    flex: 1,
    backgroundColor: '#E6ECDC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
});

export default Popup;
